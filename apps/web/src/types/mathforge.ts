export type Audience = "general" | "math-lover";
export type Difficulty = "easy" | "medium" | "hard";
export type Language = "javascript" | "python" | "csharp";

export type LearningTopicId =
  | "variables"
  | "arithmetic"
  | "functions"
  | "return"
  | "conditions"
  | "loops"
  | "arrays"
  | "modulo";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type QuestionSummary = {
  id: string;
  slug: string;
  order: number;
  title: string;
  audience: Audience;
  difficulty: Difficulty;
  learning_goal: string;
  learning_topics: LearningTopicId[];
};

export type QuestionExample = {
  inputs: JsonValue[];
  expected_output: JsonValue;
  explanation: string;
};

export type LanguageValues = Record<Language, string>;

export type Question = QuestionSummary & {
  description: string;
  task: string;
  input_description: string;
  output_description: string;
  quick_tips: string[];
  hints: string[];
  common_mistakes: string[];
  examples: QuestionExample[];
  function_names: LanguageValues;
  starter_code: LanguageValues;
};

export type LearningTopicSummary = {
  id: LearningTopicId;
  slug: string;
  order: number;
  title: string;
  summary: string;
};

export type MiniExercise = {
  prompt: string;
  answers: LanguageValues;
  explanation: string;
};

export type LearningTopic = LearningTopicSummary & {
  concept: string;
  why_it_matters: string;
  code_examples: LanguageValues;
  quick_tips: string[];
  common_mistakes: string[];
  mini_exercise: MiniExercise;
};

export type SubmissionStatus =
  | "accepted"
  | "wrong_answer"
  | "compilation_error"
  | "runtime_error"
  | "time_limit_exceeded"
  | "internal_error";

export type SubmissionPayload = {
  question_id: string;
  language: Language;
  source_code: string;
};

export type SubmissionTestResult = {
  index: number;
  passed: boolean;
  actual: string | null;
  error: string | null;
};

export type SubmissionResponse = {
  status: SubmissionStatus;
  passed_tests: number;
  total_tests: number;
  results: SubmissionTestResult[];
  execution_time_ms: number | null;
  memory_kb: number | null;
  message: string | null;
};
