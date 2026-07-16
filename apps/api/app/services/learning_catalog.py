from pathlib import Path

from pydantic import TypeAdapter

from app.models.learning import LearningTopic, LearningTopicSummary

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "learning_topics.json"
LEARNING_TOPIC_LIST_ADAPTER = TypeAdapter(list[LearningTopic])


def _validate_unique_fields(topics: list[LearningTopic]) -> None:
    ids: set[str] = set()
    slugs: set[str] = set()
    orders: set[int] = set()

    for topic in topics:
        topic_id = str(topic.id)

        if topic_id in ids:
            raise ValueError(f"Duplicate learning topic id: {topic_id}")

        if topic.slug in slugs:
            raise ValueError(f"Duplicate learning topic slug: {topic.slug}")

        if topic.order in orders:
            raise ValueError(f"Duplicate learning topic order: {topic.order}")

        ids.add(topic_id)
        slugs.add(topic.slug)
        orders.add(topic.order)


def _load_learning_topics() -> tuple[LearningTopic, ...]:
    topics = LEARNING_TOPIC_LIST_ADAPTER.validate_json(
        DATA_PATH.read_bytes()
    )

    _validate_unique_fields(topics)

    return tuple(
        sorted(
            topics,
            key=lambda topic: topic.order,
        )
    )


LEARNING_TOPICS = _load_learning_topics()


def list_learning_topic_summaries() -> list[LearningTopicSummary]:
    return [
        LearningTopicSummary.model_validate(topic)
        for topic in LEARNING_TOPICS
    ]


def find_learning_topic_by_slug(slug: str) -> LearningTopic | None:
    return next(
        (
            topic
            for topic in LEARNING_TOPICS
            if topic.slug == slug
        ),
        None,
    )
