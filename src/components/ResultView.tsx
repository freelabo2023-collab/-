import type { CtaConfig } from "@/diagnoses/types";
import type { DiagnosisResult } from "@/lib/scoring";
import CtaButtons from "./CtaButtons";

interface Props {
  result: DiagnosisResult;
  cta: CtaConfig;
  onRestart: () => void;
}

/** スコアに応じたひとことコメント */
function scoreComment(score: number): string {
  if (score >= 80) return "売上導線はかなり整っています";
  if (score >= 60) return "あと少しで、取りこぼしを減らせます";
  if (score >= 40) return "改善できる余地が多く残っています";
  return "まずは導線づくりから始めるのがおすすめです";
}

/** 結果画面：診断タイプ・総合スコア・課題・優先改善・LINE活用・プラン・CTA */
export default function ResultView({ result, cta, onRestart }: Props) {
  const { type, score, priorities } = result;

  return (
    <div className="result fade-in">
      {/* ヒーロー：タイプ + 総合スコア */}
      <div className="result-hero">
        <div className="result-eyebrow">診断結果</div>
        <h1 className="result-title">{type.title}</h1>

        <div className="score-ring" aria-label={`総合スコア ${score}点`}>
          <div
            className="ring-inner"
            style={{
              // スコアに応じてリングを塗る（円錐グラデ）
              boxShadow: "0 0 0 0 transparent",
            }}
          />
          <ScoreRing score={score} />
        </div>
        <div className="score-label">総合スコア（100点満点）</div>
        <div className="score-label" style={{ marginTop: 6, color: "#fff" }}>
          {scoreComment(score)}
        </div>
      </div>

      {/* タイプ説明 */}
      <section className="result-section">
        <h3>診断タイプについて</h3>
        <p>{type.description}</p>
      </section>

      {/* 現在の課題 */}
      <section className="result-section">
        <h3>現在の課題</h3>
        <p className="muted">{type.challenge}</p>
      </section>

      {/* 優先して直すべき3つ */}
      <section className="result-section">
        <h3>優先して直すべき3つ</h3>
        <ol className="priority-list">
          {priorities.map((p, i) => (
            <li className="priority-item" key={i}>
              <span className="priority-no">{i + 1}</span>
              <div className="priority-body">
                <span className="priority-q">{p.questionText}</span>
                {p.improvement}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* おすすめのLINE活用方法 */}
      <section className="result-section">
        <h3>おすすめのLINE活用方法</h3>
        <p>{type.lineAdvice}</p>
      </section>

      {/* おすすめプラン */}
      <div className="plan-card">
        <div className="plan-eyebrow">おすすめプラン</div>
        <div className="plan-row">
          <span className="plan-name">{type.plan.name}</span>
          <span className="plan-price">{type.plan.price}</span>
        </div>
      </div>

      {/* CTA */}
      <CtaButtons cta={cta} />

      <div className="restart">
        <button type="button" onClick={onRestart}>
          もう一度診断する
        </button>
      </div>
    </div>
  );
}

/** スコアを円形ゲージで表現（SVG・依存ライブラリなし） */
function ScoreRing({ score }: { score: number }) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#c8a85a"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      {/* 中央の数値（回転を戻す） */}
      <g transform={`rotate(90 ${size / 2} ${size / 2})`}>
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="40"
          fontWeight="800"
        >
          {score}
        </text>
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.65)"
          fontSize="13"
        >
          点
        </text>
      </g>
    </svg>
  );
}
