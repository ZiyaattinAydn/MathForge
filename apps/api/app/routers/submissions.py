from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.submission import (
    SubmissionRequest,
    SubmissionResponse,
)
from app.services.judge0 import Judge0Client, get_judge0_client
from app.services.question_catalog import find_question_by_id
from app.services.question_tests import get_question_tests
from app.services.submission_guard import enforce_submission_guard
from app.services.submission_runner import run_submission

router = APIRouter(
    prefix="/api/v1/submissions",
    tags=["submissions"],
)


@router.post(
    "",
    response_model=SubmissionResponse,
    summary="Run a submitted solution",
    dependencies=[Depends(enforce_submission_guard)],
)
def create_submission(
    submission: SubmissionRequest,
    client: Annotated[
        Judge0Client,
        Depends(get_judge0_client),
    ],
) -> SubmissionResponse:
    question = find_question_by_id(submission.question_id)

    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    tests = get_question_tests(question.id)

    if tests is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Question tests are not available",
        )

    return run_submission(
        question=question,
        tests=tests,
        language=submission.language,
        source_code=submission.source_code,
        client=client,
    )
