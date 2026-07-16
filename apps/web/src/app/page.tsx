import { QuestionWorkspace } from "@/components/question-workspace";
import {
  getQuestion,
  getQuestionSummaries,
} from "@/lib/mathforge-api";
import type {
  Question,
  QuestionSummary,
} from "@/types/mathforge";

export const dynamic = "force-dynamic";

async function loadWorkspace(): Promise<{
  questions: QuestionSummary[];
  initialQuestion: Question | null;
}> {
  try {
    const questions = await getQuestionSummaries();

    if (questions.length === 0) {
      return {
        questions: [],
        initialQuestion: null,
      };
    }

    const initialQuestion = await getQuestion(
      questions[0].slug,
    );

    return {
      questions,
      initialQuestion,
    };
  } catch {
    return {
      questions: [],
      initialQuestion: null,
    };
  }
}

export default async function Home() {
  const { questions, initialQuestion } =
    await loadWorkspace();

  return (
    <QuestionWorkspace
      questions={questions}
      initialQuestion={initialQuestion}
    />
  );
}
