from fastapi import APIRouter, HTTPException, status

from app.models.learning import LearningTopic, LearningTopicSummary
from app.services.learning_catalog import (
    find_learning_topic_by_slug,
    list_learning_topic_summaries,
)

router = APIRouter(
    prefix="/api/v1/learning-topics",
    tags=["learning"],
)


@router.get(
    "",
    response_model=list[LearningTopicSummary],
    summary="List learning topics",
)
def list_learning_topics() -> list[LearningTopicSummary]:
    return list_learning_topic_summaries()


@router.get(
    "/{slug}",
    response_model=LearningTopic,
    summary="Get learning topic",
)
def get_learning_topic(slug: str) -> LearningTopic:
    topic = find_learning_topic_by_slug(slug)

    if topic is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning topic not found",
        )

    return topic
