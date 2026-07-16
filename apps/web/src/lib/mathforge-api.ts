import type {
  LearningTopicSummary,
  QuestionSummary,
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

  return response.json() as Promise<T>;
}

export function getQuestionSummaries(): Promise<QuestionSummary[]> {
  return request<QuestionSummary[]>("/api/v1/questions");
}

export function getLearningTopicSummaries(): Promise<LearningTopicSummary[]> {
  return request<LearningTopicSummary[]>("/api/v1/learning-topics");
}
