import type { CtaConfig } from "@/diagnoses/types";

/**
 * サイト全体の共通設定。
 *
 * ▼ よく差し替える項目
 *   - brandName        : ブランド名
 *   - cta.lineUrl      : FREE LABO公式LINEの友だち追加URL
 *   - cta.consultUrl   : 無料相談の問い合わせ先（フォーム / LINE / メール等）
 *   - cta.buildUrl     : 「自分のお店用に診断ツールを作る」問い合わせ先
 *
 * ※ プロトタイプのため、未設定のURLは "#" を入れています。
 *   本番ではここを実際のURLに差し替えてください。
 */

export const SITE = {
  brandName: "FREE LABO",
  tagline: "小規模店舗の売上導線を、診断から。",
  /** フッターなどに表示する運営者表記 */
  operator: "FREE LABO",
};

/** CTAリンクの共通デフォルト値 */
export const DEFAULT_CTA: CtaConfig = {
  // FREE LABO公式LINEの友だち追加URL（例: https://lin.ee/xxxxxxx）
  lineUrl: "#line",
  // 無料相談の窓口URL
  consultUrl: "#consult",
  // 「自分のお店用に診断ツールを作る」問い合わせURL
  buildUrl: "#build",
};

/** CTAボタンの文言（サイト共通） */
export const CTA_LABELS = {
  consult: "無料で相談してみる",
  line: "LINEで診断結果を送る",
  lineRegister: "LINE登録する",
  build: "自分のお店用に診断ツールを作る",
};
