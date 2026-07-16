import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.routers.learning import router as learning_router
from app.routers.questions import router as questions_router
from app.routers.submissions import router as submissions_router


class HealthResponse(BaseModel):
    status: str
    service: str


def get_allowed_origins() -> list[str]:
    configured_origins = os.getenv(
        "MATHFORGE_WEB_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )

    return [
        origin.strip()
        for origin in configured_origins.split(",")
        if origin.strip()
    ]


app = FastAPI(
    title="MathForge API",
    version="0.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(questions_router)
app.include_router(learning_router)
app.include_router(submissions_router)


@app.get(
    "/api/v1/health",
    response_model=HealthResponse,
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="mathforge-api",
    )
