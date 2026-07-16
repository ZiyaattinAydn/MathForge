import type {
  LearningTopicSummary,
  Question,
  QuestionSummary,
  SubmissionPayload,
  SubmissionResponse,
} from "@/types/mathforge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `MathForge API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export function getQuestionSummaries(): Promise<QuestionSummary[]> {
  return request<QuestionSummary[]>("/api/v1/questions");
}

export function getQuestion(slug: string): Promise<Question> {
  return request<Question>(
    `/api/v1/questions/${encodeURIComponent(slug)}`,
  );
}

export function getLearningTopicSummaries(): Promise<LearningTopicSummary[]> {
  return request<LearningTopicSummary[]>("/api/v1/learning-topics");
}

export async function submitSolution(
  payload: SubmissionPayload,
): Promise<SubmissionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Submission request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as SubmissionResponse;
}
