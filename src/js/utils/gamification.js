import { normalizeLessonText } from "../data/seed-lessons.js";

function normalizeCodeAnswer(value) {
  return normalizeLessonText(value).replace(/\s+/g, "").replace(/;$/, "");
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function differenceInDays(startKey, endKey) {
  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay);
}

function getAcceptedAnswers(question) {
  if (question.type === "code_fill") {
    return (question.acceptedAnswers ?? []).map((answer) => normalizeCodeAnswer(answer));
  }

  return [normalizeLessonText(question.correctAnswer)];
}

function normalizeAnswerForQuestion(question, answer) {
  if (question.type === "code_fill") {
    return normalizeCodeAnswer(answer);
  }

  return normalizeLessonText(answer);
}

function getAnswerDisplayText(question, answer) {
  if (question.type === "code_fill") {
    return answer;
  }

  return (
    question.options?.find((option) => option.value === answer)?.label ??
    answer
  );
}

export function getTodayDateKey() {
  return toDateKey(new Date());
}

export function calculateNextStreak(lastStudyDate, currentStreak, todayKey = getTodayDateKey()) {
  if (!lastStudyDate) return 1;

  const difference = differenceInDays(lastStudyDate, todayKey);

  if (difference <= 0) {
    return currentStreak || 1;
  }

  if (difference === 1) {
    return (currentStreak || 0) + 1;
  }

  return 1;
}

export function mergeCompletedLessonIds(currentIds, lessonId) {
  return Array.from(new Set([...(currentIds ?? []), lessonId]));
}

export function evaluateLessonAnswers(lesson, answers) {
  const questions = lesson?.content?.questions ?? [];

  const results = questions.map((question) => {
    const rawAnswer = answers?.[question.id] ?? "";
    const normalizedAnswer = normalizeAnswerForQuestion(question, rawAnswer);
    const acceptedAnswers = getAcceptedAnswers(question);
    const isCorrect = acceptedAnswers.includes(normalizedAnswer);

    return {
      questionId: question.id,
      prompt: question.prompt,
      type: question.type,
      userAnswer: getAnswerDisplayText(question, rawAnswer),
      expectedAnswer: getAnswerDisplayText(question, question.correctAnswer),
      isCorrect,
      feedback: isCorrect ? question.feedback?.correct : question.feedback?.incorrect,
    };
  });

  const correctCount = results.filter((item) => item.isCorrect).length;
  const totalQuestions = questions.length || 1;
  const perfect = correctCount === questions.length && questions.length > 0;
  const bonusXp = perfect ? 5 : 0;
  const baseXp = Number(lesson?.xpReward ?? 0);

  return {
    score: Math.round((correctCount / totalQuestions) * 100),
    correctCount,
    totalQuestions: questions.length,
    perfect,
    baseXp,
    bonusXp,
    xpEarned: baseXp + bonusXp,
    results,
  };
}

export function getLessonStatuses(lessons, completedLessonIds) {
  const completedIds = new Set(completedLessonIds ?? []);
  let availableConsumed = false;

  return lessons.map((lesson) => {
    if (completedIds.has(lesson.id)) {
      return { ...lesson, status: "completed" };
    }

    if (!availableConsumed) {
      availableConsumed = true;
      return { ...lesson, status: "available" };
    }

    return { ...lesson, status: "locked" };
  });
}
