import pytest
from fastapi import HTTPException

from app.services.submission_guard import (
    SubmissionGuard,
    SubmissionGuardSettings,
)


def create_settings(
    *,
    enabled: bool = True,
    limit: int = 2,
    daily_limit: int = 10,
) -> SubmissionGuardSettings:
    return SubmissionGuardSettings(
        submissions_enabled=enabled,
        submission_limit=limit,
        submission_window_seconds=60,
        process_daily_limit=daily_limit,
    )


def test_guard_allows_requests_within_limit() -> None:
    guard = SubmissionGuard(create_settings())

    guard.enforce("127.0.0.1")
    guard.enforce("127.0.0.1")


def test_guard_rejects_requests_above_limit() -> None:
    guard = SubmissionGuard(create_settings())

    guard.enforce("127.0.0.1")
    guard.enforce("127.0.0.1")

    with pytest.raises(HTTPException) as error:
        guard.enforce("127.0.0.1")

    assert error.value.status_code == 429
    assert error.value.headers is not None
    assert "Retry-After" in error.value.headers


def test_guard_can_disable_all_submissions() -> None:
    guard = SubmissionGuard(
        create_settings(enabled=False)
    )

    with pytest.raises(HTTPException) as error:
        guard.enforce("127.0.0.1")

    assert error.value.status_code == 503


def test_guard_enforces_process_daily_cap() -> None:
    guard = SubmissionGuard(
        create_settings(
            limit=10,
            daily_limit=2,
        )
    )

    guard.enforce("first-client")
    guard.enforce("second-client")

    with pytest.raises(HTTPException) as error:
        guard.enforce("third-client")

    assert error.value.status_code == 503
