import base64
import json

from app.models.question import JsonValue, Question
from app.models.submission import (
    SubmissionLanguage,
    SubmissionResponse,
    SubmissionStatus,
    SubmissionTestResult,
)
from app.models.test_case import HiddenTestCase
from app.services.judge0 import Judge0Client, Judge0Execution

RESULT_MARKER = "__MATHFORGE_RESULTS_V1__"

LANGUAGE_IDS: dict[SubmissionLanguage, int] = {
    SubmissionLanguage.JAVASCRIPT: 102,
    SubmissionLanguage.PYTHON: 109,
    SubmissionLanguage.CSHARP: 51,
}


def run_submission(
    *,
    question: Question,
    tests: tuple[HiddenTestCase, ...],
    language: SubmissionLanguage,
    source_code: str,
    client: Judge0Client,
) -> SubmissionResponse:
    wrapped_source = build_wrapped_source(
        question=question,
        tests=tests,
        language=language,
        source_code=source_code,
    )

    try:
        execution = client.execute(
            source_code=wrapped_source,
            language_id=LANGUAGE_IDS[language],
        )
    except RuntimeError:
        return SubmissionResponse(
            status=SubmissionStatus.INTERNAL_ERROR,
            passed_tests=0,
            total_tests=len(tests),
            results=[],
            message="Kod çalıştırma servisine ulaşılamadı.",
        )

    non_accepted_response = _map_execution_error(
        execution=execution,
        total_tests=len(tests),
    )

    if non_accepted_response is not None:
        return non_accepted_response

    try:
        results = parse_test_results(execution.stdout)
    except ValueError:
        return SubmissionResponse(
            status=SubmissionStatus.INTERNAL_ERROR,
            passed_tests=0,
            total_tests=len(tests),
            results=[],
            execution_time_ms=_to_milliseconds(execution.time_seconds),
            memory_kb=execution.memory_kb,
            message="Test sonuçları okunamadı.",
        )

    passed_tests = sum(result.passed for result in results)
    status = (
        SubmissionStatus.ACCEPTED
        if passed_tests == len(tests)
        else SubmissionStatus.WRONG_ANSWER
    )

    return SubmissionResponse(
        status=status,
        passed_tests=passed_tests,
        total_tests=len(tests),
        results=results,
        execution_time_ms=_to_milliseconds(execution.time_seconds),
        memory_kb=execution.memory_kb,
    )


def build_wrapped_source(
    *,
    question: Question,
    tests: tuple[HiddenTestCase, ...],
    language: SubmissionLanguage,
    source_code: str,
) -> str:
    if language is SubmissionLanguage.JAVASCRIPT:
        return _build_javascript_source(
            source_code=source_code,
            function_name=question.function_names.javascript,
            tests=tests,
        )

    if language is SubmissionLanguage.PYTHON:
        return _build_python_source(
            source_code=source_code,
            function_name=question.function_names.python,
            tests=tests,
        )

    return _build_csharp_source(
        source_code=source_code,
        function_name=question.function_names.csharp,
        tests=tests,
    )


def parse_test_results(stdout: str) -> list[SubmissionTestResult]:
    if RESULT_MARKER not in stdout:
        raise ValueError("MathForge result marker not found")

    result_section = stdout.rsplit(RESULT_MARKER, maxsplit=1)[1]
    results: list[SubmissionTestResult] = []

    for raw_line in result_section.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        parts = line.split("|", maxsplit=3)

        if len(parts) != 4:
            continue

        index_text, passed_text, actual_encoded, error_encoded = parts

        results.append(
            SubmissionTestResult(
                index=int(index_text),
                passed=passed_text == "1",
                actual=_decode_text(actual_encoded) or None,
                error=_decode_text(error_encoded) or None,
            )
        )

    if not results:
        raise ValueError("No MathForge test results found")

    return results


def _build_javascript_source(
    *,
    source_code: str,
    function_name: str,
    tests: tuple[HiddenTestCase, ...],
) -> str:
    tests_json = json.dumps(
        [
            {
                "inputs": test.inputs,
                "expected": test.expected,
            }
            for test in tests
        ],
        ensure_ascii=False,
    )

    return f"""
{source_code}

const __mfTests = {tests_json};
const __mfEncode = (value) =>
  Buffer.from(String(value), "utf8").toString("base64");

console.log("{RESULT_MARKER}");

for (let index = 0; index < __mfTests.length; index += 1) {{
  const test = __mfTests[index];

  try {{
    const actual = {function_name}(...test.inputs);
    const passed = Object.is(actual, test.expected);

    console.log(
      `${{index}}|${{passed ? "1" : "0"}}|${{__mfEncode(actual)}}|`
    );
  }} catch (error) {{
    console.log(
      `${{index}}|0||${{__mfEncode(error instanceof Error ? error.message : error)}}`
    );
  }}
}}
""".strip()


def _build_python_source(
    *,
    source_code: str,
    function_name: str,
    tests: tuple[HiddenTestCase, ...],
) -> str:
    tests_repr = repr(
        [
            {
                "inputs": list(test.inputs),
                "expected": test.expected,
            }
            for test in tests
        ]
    )

    return f"""
{source_code}

import base64 as __mf_base64

__mf_tests = {tests_repr}


def __mf_encode(value):
    return __mf_base64.b64encode(
        str(value).encode("utf-8")
    ).decode("ascii")


print("{RESULT_MARKER}")

for __mf_index, __mf_test in enumerate(__mf_tests):
    try:
        __mf_actual = {function_name}(*__mf_test["inputs"])
        __mf_passed = __mf_actual == __mf_test["expected"]

        print(
            f"{{__mf_index}}|{{1 if __mf_passed else 0}}|"
            f"{{__mf_encode(__mf_actual)}}|"
        )
    except Exception as __mf_error:
        print(
            f"{{__mf_index}}|0||{{__mf_encode(__mf_error)}}"
        )
""".strip()


def _build_csharp_source(
    *,
    source_code: str,
    function_name: str,
    tests: tuple[HiddenTestCase, ...],
) -> str:
    test_lines: list[str] = []

    for index, test in enumerate(tests):
        arguments = ", ".join(
            _to_csharp_literal(value)
            for value in test.inputs
        )
        expected = _to_csharp_literal(test.expected)

        test_lines.extend(
            [
                "        try",
                "        {",
                f"            var actual = {function_name}({arguments});",
                f"            var passed = object.Equals(actual, {expected});",
                (
                    f'            Console.WriteLine("{index}|"'
                    ' + (passed ? "1" : "0")'
                    ' + "|"'
                    " + Encode(Convert.ToString("
                    "actual, CultureInfo.InvariantCulture)"
                    " ?? string.Empty)"
                    ' + "|");'
                ),
                "        }",
                "        catch (Exception error)",
                "        {",
                (
                    f'            Console.WriteLine("{index}|0||"'
                    " + Encode(error.Message));"
                ),
                "        }",
            ]
        )

    generated_tests = "\n".join(test_lines)

    return f"""
using System;
using System.Globalization;
using System.Text;

public class Program
{{
{_indent_source(source_code, 4)}

    private static string Encode(string value)
    {{
        return Convert.ToBase64String(
            Encoding.UTF8.GetBytes(value)
        );
    }}

    public static void Main()
    {{
        Console.WriteLine("{RESULT_MARKER}");

{generated_tests}
    }}
}}
""".strip()


def _map_execution_error(
    *,
    execution: Judge0Execution,
    total_tests: int,
) -> SubmissionResponse | None:
    if execution.status_id == 3:
        return None

    if execution.status_id == 5:
        status = SubmissionStatus.TIME_LIMIT_EXCEEDED
        message = "Kodun çalışma süresi sınırı aşıldı."
    elif execution.status_id == 6:
        status = SubmissionStatus.COMPILATION_ERROR
        message = execution.compile_output or "Kod derlenemedi."
    elif 7 <= execution.status_id <= 12:
        status = SubmissionStatus.RUNTIME_ERROR
        message = execution.stderr or execution.status_description
    else:
        status = SubmissionStatus.INTERNAL_ERROR
        message = execution.status_description

    return SubmissionResponse(
        status=status,
        passed_tests=0,
        total_tests=total_tests,
        results=[],
        execution_time_ms=_to_milliseconds(execution.time_seconds),
        memory_kb=execution.memory_kb,
        message=message,
    )


def _decode_text(value: str) -> str:
    if not value:
        return ""

    try:
        return base64.b64decode(value).decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        raise ValueError("Invalid encoded result") from None


def _to_milliseconds(value: str | None) -> int | None:
    if value is None:
        return None

    try:
        return round(float(value) * 1000)
    except ValueError:
        return None


def _to_csharp_literal(value: JsonValue) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"

    if isinstance(value, int):
        return str(value)

    if isinstance(value, float):
        return f"{value!r}d"

    if isinstance(value, str):
        escaped = (
            value.replace("\\", "\\\\")
            .replace('"', '\\"')
            .replace("\n", "\\n")
            .replace("\r", "\\r")
        )
        return f'"{escaped}"'

    raise ValueError(
        "C# runner currently supports primitive test values only"
    )


def _indent_source(source_code: str, spaces: int) -> str:
    prefix = " " * spaces

    return "\n".join(
        f"{prefix}{line}" if line else ""
        for line in source_code.splitlines()
    )
