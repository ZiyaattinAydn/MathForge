export type Audience = "general" | "math-lover";
export type Difficulty = "easy" | "medium" | "hard";

export type QuestionSummary = {
  id: string;
  slug: string;
  order: number;
  title: string;
  audience: Audience;
  difficulty: Difficulty;
  learning_goal: string;
  learning_topics: string[];
};

export type LearningTopicSummary = {
  id: string;
  slug: string;
  order: number;
  title: string;
  summary: string;
};
