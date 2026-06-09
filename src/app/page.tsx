import Link from "next/link";
import { DIAGNOSES, FEATURED_DIAGNOSIS } from "@/diagnoses";
import DiagnosisClient from "@/components/DiagnosisClient";

/**
 * トップページ。
 * 診断が1つだけのうちはそのデモ診断を直接表示し、
 * 複数になったら一覧（業種別）として並べます。
 */
export default function HomePage() {
  // 診断が1つのときは、そのままデモ診断を表示
  if (DIAGNOSES.length <= 1) {
    return <DiagnosisClient diagnosis={FEATURED_DIAGNOSIS} />;
  }

  // 複数の診断がある場合は一覧（業種別）を表示
  return (
    <div className="fade-in">
      <div className="intro" style={{ marginBottom: 22 }}>
        <span className="eyebrow">小規模店舗向け 売上導線診断</span>
        <h1>あなたのお店に合わせて診断を選べます</h1>
        <p className="desc">
          業種に合わせた診断で、Instagram・LINE公式・予約導線の弱点を見つけましょう。
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {DIAGNOSES.map((d) => (
          <Link key={d.slug} href={`/diagnosis/${d.slug}`} className="card">
            <span className="question-no">診断</span>
            <h2 className="question-text" style={{ fontSize: 19 }}>
              {d.title}
            </h2>
            <p className="desc" style={{ margin: 0 }}>
              {d.catchphrase}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
