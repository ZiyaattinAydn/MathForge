from pydantic import BaseModel, ConfigDict, Field

from app.models.question import LearningTopicId


class LanguageCodeExamples(BaseModel):
    model_config = ConfigDict(frozen=True)

    javascript: str = Field(min_length=1)
    python: str = Field(min_length=1)
    csharp: str = Field(min_length=1)


class MiniExercise(BaseModel):
    model_config = ConfigDict(frozen=True)

    prompt: str = Field(min_length=1)
    answers: LanguageCodeExamples
    explanation: str = Field(min_length=1)


class LearningTopic(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: LearningTopicId
    slug: str = Field(min_length=1)
    order: int = Field(ge=1)
    title: str = Field(min_length=1)

    summary: str = Field(min_length=1)
    concept: str = Field(min_length=1)
    why_it_matters: str = Field(min_length=1)

    code_examples: LanguageCodeExamples
    quick_tips: list[str] = Field(min_length=1)
    common_mistakes: list[str] = Field(min_length=1)
    mini_exercise: MiniExercise


class LearningTopicSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: LearningTopicId
    slug: str
    order: int
    title: str
    summary: str
