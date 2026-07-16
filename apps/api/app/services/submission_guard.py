from collections import defaultdict, deque
from datetime import UTC, datetime
from functools import lru_cache
from math import ceil
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request, status
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class SubmissionGuardSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="MATHFORGE_",
        extra="ignore",
    )

    submissions_enabled: bool = True
    submission_limit: int = Field(
        default=5,
        ge=1,
        le=100,
    )
    submission_window_seconds: int = Field(
        default=60,
        ge=1,
        le=3600,
    )
    process_daily_limit: int = Field(
        default=250,
        ge=1,
        le=100_000,
    )


class SubmissionGuard:
    def __init__(
        self,
        settings: SubmissionGuardSettings,
    ) -> None:
        self.settings = settings
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._daily_count = 0
        self._current_day = datetime.now(UTC).date()
        self._lock = Lock()

    def enforce(self, identifier: str) -> None:
        if not self.settings.submissions_enabled:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Code submissions are temporarily disabled",
            )

        now = monotonic()
        today = datetime.now(UTC).date()

        with self._lock:
            if today != self._current_day:
                self._current_day = today
                self._daily_count = 0
                self._requests.clear()

            if (
                self._daily_count
                >= self.settings.process_daily_limit
            ):
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Daily submission safety limit reached",
                )

            bucket = self._requests[identifier]
            window = self.settings.submission_window_seconds
            cutoff = now - window

            while bucket and bucket[0] <= cutoff:
                bucket.popleft()

            if len(bucket) >= self.settings.submission_limit:
                retry_after = max(
                    1,
                    ceil(bucket[0] + window - now),
                )

                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many code submissions",
                    headers={
                        "Retry-After": str(retry_after),
                    },
                )

            bucket.append(now)
            self._daily_count += 1


def get_client_identifier(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")

    if forwarded_for:
        first_address = forwarded_for.split(",", maxsplit=1)[0]
        return first_address.strip() or "unknown"

    if request.client is not None:
        return request.client.host

    return "unknown"


@lru_cache
def get_submission_guard() -> SubmissionGuard:
    return SubmissionGuard(
        SubmissionGuardSettings()
    )


def enforce_submission_guard(request: Request) -> None:
    guard = get_submission_guard()
    guard.enforce(get_client_identifier(request))
