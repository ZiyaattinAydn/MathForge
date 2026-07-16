from fastapi.testclient import TestClient

from app.main import app
from app.services.judge0 import (
    Judge0Execution,
    get_judge0_client,
)
from app.services.submission_runner import RESULT_MARKER


class FakeJudge0Client:
    def __init__(
        self,
        execution: Judge0Execution,
    ) -> None:
        self.execution = execution
        self.source_code = ""
        self.language_id = 0

    def execute(
        self,
        *,
        source_code: str,
        language_id: int,
    ) -> Judge0Execution:
        self.source_code = source_code
        self.language_id = language_id

        return self.execution


def encoded(value: str) -> str:
    import base64

    return base64.b64encode(
        value.encode("utf-8")
    ).decode("ascii")


def make_stdout(
    passed_values: list[bool],
) -> str:
    lines = [RESULT_MARKER]

    for index, passed in enumerate(passed_values):
        lines.append(
            f"{index}|{'1' if passed else '0'}|"
            f"{encoded(str(index))}|"
        )

    return "\n".join(lines)


def make_execution(
    *,
    status_id: int = 3,
    description: str = "Accepted",
    stdout: str = "",
    compile_output: str = "",
) -> Judge0Execution:
    return Judge0Execution(
        status_id=status_id,
        status_description=description,
        stdout=stdout,
        stderr="",
        compile_output=compile_output,
        time_seconds="0.125",
        memory_kb=1024,
    )


def test_python_submission_is_accepted() -> None:
    fake_client = FakeJudge0Client(
        make_execution(
            stdout=make_stdout(
                [True, True, True, True, True, True]
            )
        )
    )

    app.dependency_overrides[get_judge0_client] = lambda: fake_client

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/submissions",
            json={
                "question_id": "question-001",
                "language": "python",
                "source_code": (
                    "def add_numbers(a, b):\n"
                    "    return a + b"
                ),
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert response.json()["passed_tests"] == 6
    assert fake_client.language_id == 109
    assert "add_numbers" in fake_client.source_code


def test_submission_can_return_wrong_answer() -> None:
    fake_client = FakeJudge0Client(
        make_execution(
            stdout=make_stdout(
                [True, False, True, False, True, True]
            )
        )
    )

    app.dependency_overrides[get_judge0_client] = lambda: fake_client

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/submissions",
            json={
                "question_id": "question-001",
                "language": "javascript",
                "source_code": (
                    "function addNumbers(a, b) {\n"
                    "  return a;\n"
                    "}"
                ),
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["status"] == "wrong_answer"
    assert response.json()["passed_tests"] == 4
    assert fake_client.language_id == 102


def test_compilation_error_is_returned() -> None:
    fake_client = FakeJudge0Client(
        make_execution(
            status_id=6,
            description="Compilation Error",
            compile_output="Unexpected token",
        )
    )

    app.dependency_overrides[get_judge0_client] = lambda: fake_client

    try:
        client = TestClient(app)
        response = client.post(
            "/api/v1/submissions",
            json={
                "question_id": "question-002",
                "language": "csharp",
                "source_code": "invalid code",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["status"] == "compilation_error"
    assert response.json()["message"] == "Unexpected token"


def test_unknown_question_returns_404() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/v1/submissions",
        json={
            "question_id": "unknown-question",
            "language": "python",
            "source_code": "def solve():\n    return 1",
        },
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Question not found",
    }
