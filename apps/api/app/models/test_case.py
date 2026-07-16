from pydantic import BaseModel, ConfigDict

from app.models.question import JsonValue


class HiddenTestCase(BaseModel):
    model_config = ConfigDict(frozen=True)

    inputs: list[JsonValue]
    expected: JsonValue
