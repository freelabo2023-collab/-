"use client";

import { useMemo, useState } from "react";
import type { CtaConfig, Diagnosis } from "@/diagnoses/types";
import { DEFAULT_CTA } from "@/config/site";
import { evaluate, isComplete, type Answers } from "@/lib/scoring";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ResultView from "./ResultView";

interface Props {
  diagnosis: Diagnosis;
}

type Phase = "intro" | "questions" | "result";

/** 診断の進行管理（イントロ → 1問ずつ回答 → 結果） */
export default function DiagnosisClient({ diagnosis }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0); // 現在の質問インデックス
  const [answers, setAnswers] = useState<Answers>({});

  const cta: CtaConfig = useMemo(
    () => ({ ...DEFAULT_CTA, ...diagnosis.cta }),
    [diagnosis.cta]
  );

  const total = diagnosis.questions.length;
  const question = diagnosis.questions[step];

  function start() {
    setAnswers({});
    setStep(0);
    setPhase("questions");
  }

  function select(choiceId: string) {
    const q = diagnosis.questions[step];
    const next = { ...answers, [q.id]: choiceId };
    setAnswers(next);

    if (step < total - 1) {
      // 少し待ってから次へ（選択がわかるように）
      window.setTimeout(() => setStep(step + 1), 180);
    } else if (isComplete(diagnosis, next)) {
      window.setTimeout(() => {
        setPhase("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 180);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function restart() {
    setPhase("intro");
    setStep(0);
    setAnswers({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ===== イントロ =====
  if (phase === "intro") {
    return (
      <div className="intro card fade-in">
        <span className="eyebrow">無料・約1分・{total}問</span>
        <h1>{diagnosis.title}</h1>
        <p className="catch">{diagnosis.catchphrase}</p>
        {diagnosis.description && (
          <p className="desc">{diagnosis.description}</p>
        )}

        {diagnosis.targets && diagnosis.targets.length > 0 && (
          <div className="targets">
            {diagnosis.targets.map((t) => (
              <span className="target-chip" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="meta-row">
          <div>
            <strong>{total}問</strong>
            選択式
          </div>
          <div>
            <strong>約1分</strong>
            で完了
          </div>
          <div>
            <strong>4タイプ</strong>
            で診断
          </div>
        </div>

        <button type="button" className="btn btn-blue btn-full" onClick={start}>
          診断をはじめる
        </button>
        <span className="demo-badge">デモ版：ローカルで動作するプロトタイプ</span>
      </div>
    );
  }

  // ===== 結果 =====
  if (phase === "result") {
    const result = evaluate(diagnosis, answers);
    return <ResultView result={result} cta={cta} onRestart={restart} />;
  }

  // ===== 質問（1問ずつ） =====
  return (
    <div>
      <ProgressBar current={step + 1} total={total} />
      <QuestionCard
        question={question}
        index={step}
        total={total}
        selected={answers[question.id]}
        onSelect={select}
        onBack={back}
        showBack={step > 0}
      />
    </div>
  );
}
