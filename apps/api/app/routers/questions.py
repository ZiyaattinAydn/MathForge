from fastapi import APIRouter, HTTPException, status

from app.models.question import Question, QuestionSummary
from app.services.question_catalog import (
    find_question_by_slug,
    list_question_summaries,
)

router = APIRouter(
    prefix="/api/v1/questions",
    tags=["questions"],
)


@router.get(
    "",
    response_model=list[QuestionSummary],
    summary="List questions",
)
def list_questions() -> list[QuestionSummary]:
    return list_question_summaries()


@router.get(
    "/{slug}",
    response_model=Question,
    summary="Get question details",
)
def get_question(slug: str) -> Question:
    question = find_question_by_slug(slug)

    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    return question
