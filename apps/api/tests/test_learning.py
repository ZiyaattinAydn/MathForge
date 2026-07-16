from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_learning_topics_returns_stable_order() -> None:
    response = client.get("/api/v1/learning-topics")

    assert response.status_code == 200

    topics = response.json()

    assert len(topics) == 4
    assert [topic["order"] for topic in topics] == [1, 2, 3, 4]
    assert [topic["slug"] for topic in topics] == [
        "degiskenler",
        "dort-islem",
        "fonksiyonlar",
        "return",
    ]


def test_learning_topic_summary_excludes_full_lesson() -> None:
    response = client.get("/api/v1/learning-topics")

    first_topic = response.json()[0]

    assert "code_examples" not in first_topic
    assert "common_mistakes" not in first_topic
    assert "mini_exercise" not in first_topic


def test_get_learning_topic_returns_teaching_content() -> None:
    response = client.get("/api/v1/learning-topics/degiskenler")

    assert response.status_code == 200

    topic = response.json()

    assert topic["id"] == "variables"
    assert topic["title"] == "Değişkenler"
    assert "javascript" in topic["code_examples"]
    assert "python" in topic["code_examples"]
    assert "csharp" in topic["code_examples"]
    assert len(topic["quick_tips"]) == 3
    assert topic["mini_exercise"]["prompt"]


def test_missing_learning_topic_returns_404() -> None:
    response = client.get("/api/v1/learning-topics/bilinmeyen-konu")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Learning topic not found",
    }
