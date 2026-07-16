from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_questions_returns_complete_stable_order() -> None:
    response = client.get("/api/v1/questions")

    assert response.status_code == 200

    questions = response.json()

    assert len(questions) == 12
    assert [question["order"] for question in questions] == list(range(1, 13))
    assert questions[0]["slug"] == "iki-sayiyi-topla"
    assert questions[-1]["slug"] == "izgara-yollari"


def test_question_summary_does_not_include_full_content() -> None:
    response = client.get("/api/v1/questions")

    first_question = response.json()[0]

    assert "starter_code" not in first_question
    assert "examples" not in first_question
    assert "common_mistakes" not in first_question


def test_get_question_returns_learning_content() -> None:
    response = client.get("/api/v1/questions/iki-sayiyi-topla")

    assert response.status_code == 200

    question = response.json()

    assert question["title"] == "İki Sayıyı Topla"
    assert question["difficulty"] == "easy"
    assert question["learning_topics"] == [
        "variables",
        "arithmetic",
        "functions",
        "return",
    ]
    assert len(question["quick_tips"]) == 3
    assert "javascript" in question["starter_code"]
    assert "python" in question["starter_code"]
    assert "csharp" in question["starter_code"]


def test_every_question_has_six_hidden_tests() -> None:
    from app.services.question_catalog import QUESTIONS
    from app.services.question_tests import get_question_tests

    for question in QUESTIONS:
        tests = get_question_tests(question.id)

        assert tests is not None
        assert len(tests) == 6


def test_missing_question_returns_404() -> None:
    response = client.get("/api/v1/questions/bilinmeyen-soru")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Question not found",
    }
