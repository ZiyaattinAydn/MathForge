from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class Audience(StrEnum):
    GENERAL = "general"
    MATH_LOVER = "math-lover"


class Difficulty(StrEnum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class LearningTopicId(StrEnum):
    VARIABLES = "variables"
    ARITHMETIC = "arithmetic"
    FUNCTIONS = "functions"
    RETURN = "return"
    CONDITIONS = "conditions"
    LOOPS = "loops"
    ARRAYS = "arrays"
    MODULO = "modulo"


type JsonPrimitive = int | float | str | bool
type JsonValue = JsonPrimitive | list[JsonPrimitive]


class QuestionExample(BaseModel):
    model_config = ConfigDict(frozen=True)

    inputs: list[JsonValue]
    expected_output: JsonValue
    explanation: str = Field(min_length=1)


class FunctionNames(BaseModel):
    model_config = ConfigDict(frozen=True)

    javascript: str = Field(min_length=1)
    python: str = Field(min_length=1)
    csharp: str = Field(min_length=1)


class StarterCode(BaseModel):
    model_config = ConfigDict(frozen=True)

    javascript: str = Field(min_length=1)
    python: str = Field(min_length=1)
    csharp: str = Field(min_length=1)


class Question(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: str = Field(min_length=1)
    slug: str = Field(min_length=1)
    order: int = Field(ge=1)
    title: str = Field(min_length=1)

    audience: Audience
    difficulty: Difficulty

    learning_goal: str = Field(min_length=1)
    description: str = Field(min_length=1)
    task: str = Field(min_length=1)
    input_description: str = Field(min_length=1)
    output_description: str = Field(min_length=1)

    learning_topics: list[LearningTopicId] = Field(min_length=1)
    quick_tips: list[str] = Field(min_length=1)
    hints: list[str] = Field(min_length=1)
    common_mistakes: list[str] = Field(min_length=1)
    examples: list[QuestionExample] = Field(min_length=1)

    function_names: FunctionNames
    starter_code: StarterCode


class QuestionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True, frozen=True)

    id: str
    slug: str
    order: int
    title: str
    audience: Audience
    difficulty: Difficulty
    learning_goal: str
    learning_topics: list[LearningTopicId]
