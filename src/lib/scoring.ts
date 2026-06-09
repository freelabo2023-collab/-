import type { Diagnosis, Question, ResultType } from "@/diagnoses/types";

/** 回答状態：質問ID → 選択肢ID */
export type Answers = Record<string, string>;

/** 「優先して直すべき3つ」の1項目 */
export interface PriorityFix {
  questionText: string;
  improvement: string;
}

/** 診断結果 */
export interface DiagnosisResult {
  /** 結果タイプ */
  type: ResultType;
  /** 総合スコア（0〜100） */
  score: number;
  /** 素点 / 満点（参考表示用） */
  rawScore: number;
  maxScore: number;
  /** 優先して直すべき3つ */
  priorities: PriorityFix[];
}

/** 採点対象の質問だけを返す */
function scoredQuestions(diagnosis: Diagnosis): Question[] {
  return diagnosis.questions.filter((q) => q.scored !== false);
}

/**
 * 総合スコアを 0〜100 で算出する。
 * 採点対象質問の points 合計 ÷ 満点 × 100。
 */
export function calcScore(diagnosis: Diagnosis, answers: Answers): {
  score: number;
  rawScore: number;
  maxScore: number;
} {
  const questions = scoredQuestions(diagnosis);
  let rawScore = 0;
  let maxScore = 0;

  for (const q of questions) {
    const maxPoints = Math.max(...q.choices.map((c) => c.points), 0);
    maxScore += maxPoints;
    const chosen = q.choices.find((c) => c.id === answers[q.id]);
    if (chosen) rawScore += chosen.points;
  }

  const score = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
  return { score, rawScore, maxScore };
}

/**
 * 結果タイプを判定する。
 * 各回答の weights を結果タイプごとに合計し、最も高いタイプを採用。
 * 同点の場合は resultTypes の定義順（先に定義されたタイプ）を優先。
 */
export function determineType(
  diagnosis: Diagnosis,
  answers: Answers
): ResultType {
  const totals: Record<string, number> = {};
  for (const rt of diagnosis.resultTypes) totals[rt.id] = 0;

  for (const q of diagnosis.questions) {
    const chosen = q.choices.find((c) => c.id === answers[q.id]);
    if (!chosen?.weights) continue;
    for (const [typeId, weight] of Object.entries(chosen.weights)) {
      if (typeId in totals) totals[typeId] += weight ?? 0;
    }
  }

  let best = diagnosis.resultTypes[0];
  let bestScore = -Infinity;
  for (const rt of diagnosis.resultTypes) {
    if (totals[rt.id] > bestScore) {
      bestScore = totals[rt.id];
      best = rt;
    }
  }
  return best;
}

/**
 * 「優先して直すべき3つ」を抽出する。
 * points が低い（＝できていない）質問から順に、improvement があるものを最大3件返す。
 */
export function topPriorities(
  diagnosis: Diagnosis,
  answers: Answers,
  limit = 3
): PriorityFix[] {
  const ranked = diagnosis.questions
    .map((q) => {
      const chosen = q.choices.find((c) => c.id === answers[q.id]);
      const maxPoints = Math.max(...q.choices.map((c) => c.points), 0);
      // 達成度（0=できていない 〜 1=できている）。低いほど優先。
      const ratio = maxPoints > 0 && chosen ? chosen.points / maxPoints : 0;
      return { q, ratio };
    })
    .filter((x) => x.q.improvement)
    .sort((a, b) => a.ratio - b.ratio);

  return ranked.slice(0, limit).map(({ q }) => ({
    questionText: q.text,
    improvement: q.improvement as string,
  }));
}

/** 回答一式から最終結果をまとめて算出 */
export function evaluate(
  diagnosis: Diagnosis,
  answers: Answers
): DiagnosisResult {
  const { score, rawScore, maxScore } = calcScore(diagnosis, answers);
  const type = determineType(diagnosis, answers);
  const priorities = topPriorities(diagnosis, answers);
  return { type, score, rawScore, maxScore, priorities };
}

/** すべての質問に回答済みか */
export function isComplete(diagnosis: Diagnosis, answers: Answers): boolean {
  return diagnosis.questions.every((q) => Boolean(answers[q.id]));
}
