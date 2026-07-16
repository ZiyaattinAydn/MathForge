from pathlib import Path

from pydantic import TypeAdapter

from app.models.question import Question, QuestionSummary

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "questions.json"
QUESTION_LIST_ADAPTER = TypeAdapter(list[Question])


def _validate_unique_fields(questions: list[Question]) -> None:
    ids: set[str] = set()
    slugs: set[str] = set()
    orders: set[int] = set()

    for question in questions:
        if question.id in ids:
            raise ValueError(f"Duplicate question id: {question.id}")

        if question.slug in slugs:
            raise ValueError(f"Duplicate question slug: {question.slug}")

        if question.order in orders:
            raise ValueError(f"Duplicate question order: {question.order}")

        ids.add(question.id)
        slugs.add(question.slug)
        orders.add(question.order)


def _load_questions() -> tuple[Question, ...]:
    questions = QUESTION_LIST_ADAPTER.validate_json(
        DATA_PATH.read_bytes()
    )

    _validate_unique_fields(questions)

    return tuple(
        sorted(
            questions,
            key=lambda question: question.order,
        )
    )


QUESTIONS = _load_questions()


def list_question_summaries() -> list[QuestionSummary]:
    return [
        QuestionSummary.model_validate(question)
        for question in QUESTIONS
    ]


def find_question_by_slug(slug: str) -> Question | None:
    return next(
        (
            question
            for question in QUESTIONS
            if question.slug == slug
        ),
        None,
    )
