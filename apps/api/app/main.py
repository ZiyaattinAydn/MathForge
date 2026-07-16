from fastapi import FastAPI
from pydantic import BaseModel

from app.routers.learning import router as learning_router
from app.routers.questions import router as questions_router


class HealthResponse(BaseModel):
    status: str
    service: str


app = FastAPI(
    title="MathForge API",
    version="0.3.0",
)

app.include_router(questions_router)
app.include_router(learning_router)


@app.get(
    "/api/v1/health",
    response_model=HealthResponse,
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="mathforge-api",
    )
