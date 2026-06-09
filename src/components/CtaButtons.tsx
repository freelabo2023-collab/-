import type { CtaConfig } from "@/diagnoses/types";
import { CTA_LABELS } from "@/config/site";

interface Props {
  cta: CtaConfig;
}

/**
 * 結果画面のCTAボタン群。
 * - LINEで診断結果を送る / LINE登録
 * - 無料で相談してみる
 * - 自分のお店用に診断ツールを作る
 *
 * プロトタイプのためリンク先は site.ts のデフォルト（"#..."）です。
 * 実URLに差し替えると、そのまま本番のCTAとして使えます。
 */
export default function CtaButtons({ cta }: Props) {
  return (
    <div className="cta-block">
      <a
        href={cta.consultUrl}
        className="btn btn-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {CTA_LABELS.consult}
      </a>
      <a
        href={cta.lineUrl}
        className="btn btn-line"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* LINEアイコン（簡易） */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.48 2 2 5.69 2 10.23c0 4.07 3.58 7.48 8.42 8.12.33.07.78.22.89.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.02.89.56s5.88-3.46 8.02-5.93C21.46 13.6 22 11.98 22 10.23 22 5.69 17.52 2 12 2z" />
        </svg>
        {CTA_LABELS.line}
      </a>
      <p className="cta-note">
        ※ 診断結果はあなたの回答をもとに自動で表示しています
      </p>

      <div className="cta-divider">— — —</div>

      <a
        href={cta.buildUrl}
        className="btn btn-ghost btn-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        {CTA_LABELS.build}
      </a>
    </div>
  );
}
