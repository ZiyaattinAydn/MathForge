from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class SubmissionLanguage(StrEnum):
    JAVASCRIPT = "javascript"
    PYTHON = "python"
    CSHARP = "csharp"


class SubmissionStatus(StrEnum):
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    COMPILATION_ERROR = "compilation_error"
    RUNTIME_ERROR = "runtime_error"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    INTERNAL_ERROR = "internal_error"


class SubmissionRequest(BaseModel):
    question_id: str = Field(min_length=1)
    language: SubmissionLanguage
    source_code: str = Field(min_length=1, max_length=20_000)


class SubmissionTestResult(BaseModel):
    model_config = ConfigDict(frozen=True)

    index: int = Field(ge=0)
    passed: bool
    actual: str | None = None
    error: str | None = None


class SubmissionResponse(BaseModel):
    status: SubmissionStatus
    passed_tests: int = Field(ge=0)
    total_tests: int = Field(ge=0)
    results: list[SubmissionTestResult]
    execution_time_ms: int | None = None
    memory_kb: int | None = None
    message: str | None = None
