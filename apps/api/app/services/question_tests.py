from pathlib import Path

from pydantic import TypeAdapter

from app.models.test_case import HiddenTestCase

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "question_tests.json"
TEST_CATALOG_ADAPTER = TypeAdapter(dict[str, list[HiddenTestCase]])


def _load_test_catalog() -> dict[str, tuple[HiddenTestCase, ...]]:
    catalog = TEST_CATALOG_ADAPTER.validate_json(DATA_PATH.read_bytes())

    return {
        question_id: tuple(test_cases)
        for question_id, test_cases in catalog.items()
    }


QUESTION_TESTS = _load_test_catalog()


def get_question_tests(question_id: str) -> tuple[HiddenTestCase, ...] | None:
    return QUESTION_TESTS.get(question_id)
