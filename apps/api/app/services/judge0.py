import time
from dataclasses import dataclass
from functools import lru_cache

import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict


class Judge0Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    judge0_base_url: str
    judge0_api_host: str
    judge0_api_key: str


@lru_cache
def get_judge0_settings() -> Judge0Settings:
    return Judge0Settings()


@dataclass(frozen=True)
class Judge0Execution:
    status_id: int
    status_description: str
    stdout: str
    stderr: str
    compile_output: str
    time_seconds: str | None
    memory_kb: int | None


class Judge0Client:
    def __init__(self, settings: Judge0Settings) -> None:
        self.base_url = settings.judge0_base_url.rstrip("/")
        self.headers = {
            "X-RapidAPI-Key": settings.judge0_api_key,
            "X-RapidAPI-Host": settings.judge0_api_host,
            "Content-Type": "application/json",
        }

    def execute(
        self,
        *,
        source_code: str,
        language_id: int,
    ) -> Judge0Execution:
        with httpx.Client(timeout=30) as client:
            response = client.post(
                f"{self.base_url}/submissions",
                params={
                    "base64_encoded": "false",
                    "wait": "true",
                },
                headers=self.headers,
                json={
                    "source_code": source_code,
                    "language_id": language_id,
                },
            )

            if response.status_code >= 400:
                raise RuntimeError(
                    f"Judge0 request failed with HTTP {response.status_code}"
                )

            payload = response.json()

            if "status" not in payload:
                token = payload.get("token")

                if not token:
                    raise RuntimeError("Judge0 did not return a result or token")

                payload = self._poll_result(client, token)

        status = payload.get("status") or {}

        return Judge0Execution(
            status_id=int(status.get("id", 0)),
            status_description=str(status.get("description", "Unknown")),
            stdout=str(payload.get("stdout") or ""),
            stderr=str(payload.get("stderr") or ""),
            compile_output=str(payload.get("compile_output") or ""),
            time_seconds=payload.get("time"),
            memory_kb=payload.get("memory"),
        )

    def _poll_result(
        self,
        client: httpx.Client,
        token: str,
    ) -> dict[str, object]:
        for _ in range(12):
            time.sleep(0.75)

            response = client.get(
                f"{self.base_url}/submissions/{token}",
                params={"base64_encoded": "false"},
                headers=self.headers,
            )
            response.raise_for_status()

            payload = response.json()
            status_id = int((payload.get("status") or {}).get("id", 0))

            if status_id not in (1, 2):
                return payload

        raise RuntimeError("Judge0 execution timed out while polling")


def get_judge0_client() -> Judge0Client:
    return Judge0Client(get_judge0_settings())
