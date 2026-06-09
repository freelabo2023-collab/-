/**
 * 診断ツールの型定義
 *
 * すべての診断（業種別含む）はこの型に沿った設定ファイルを用意することで追加できます。
 * 質問・選択肢・点数・結果文はすべてこの設定ファイル側で管理し、
 * 画面コンポーネント（UI）は一切変更せずに差し替えられる構成にしています。
 */

/** 結果タイプのID。診断ごとに4タイプ（A〜D）を想定 */
export type ResultTypeId = string;

/** 1つの選択肢 */
export interface Choice {
  /** 選択肢ID（"A" / "B" ...）。表示にも使用 */
  id: string;
  /** 選択肢の文言 */
  label: string;
  /**
   * 総合スコアに加算される点数。
   * 「できている＝高い / できていない＝低い」で設定します（例: A=3, B=2, C=1, D=0）。
   */
  points: number;
  /**
   * 結果タイプの判定に使う重み付け。
   * 回答ごとに各タイプへ加点し、合計が最も高いタイプを結果とします。
   * 例: { D: 2 } はこの選択肢が選ばれたら「タイプD」に2点加算する、という意味。
   */
  weights?: Partial<Record<ResultTypeId, number>>;
}

/** 1つの質問 */
export interface Question {
  /** 質問ID（"q1" など） */
  id: string;
  /** 質問文 */
  text: string;
  /** 補足説明（任意） */
  hint?: string;
  /** 選択肢 */
  choices: Choice[];
  /**
   * この質問のスコアが低かった場合に「優先して直すべき3つ」に表示する改善ヒント。
   * 設定しておくと、回答内容に応じて自動で課題が抽出されます。
   */
  improvement?: string;
  /**
   * 総合スコア計算の対象に含めるか。
   * Q8（一番困っていること）のような「点数ではなく方向性を聞く質問」は false にします。
   * 省略時は true。
   */
  scored?: boolean;
}

/** おすすめプラン */
export interface Plan {
  name: string;
  /** 価格表記（"30,000円" や "要相談" など自由文字列） */
  price: string;
}

/** 結果タイプ（4タイプ） */
export interface ResultType {
  id: ResultTypeId;
  /** タイプ名（"まずは導線整理タイプ" など） */
  title: string;
  /** タイプの説明文 */
  description: string;
  /** 現在の課題 */
  challenge: string;
  /** おすすめのLINE活用方法 */
  lineAdvice: string;
  /** おすすめプラン */
  plan: Plan;
}

/** CTA（行動喚起）リンクの設定 */
export interface CtaConfig {
  /** LINE登録 / 診断結果をLINEで送るボタンのリンク先 */
  lineUrl: string;
  /** 無料相談ボタンのリンク先 */
  consultUrl: string;
  /** 「自分のお店用に診断ツールを作る」ボタンのリンク先 */
  buildUrl: string;
}

/** 1つの診断全体の設定 */
export interface Diagnosis {
  /** URLに使うスラッグ（"store-line" など） */
  slug: string;
  /** 診断名 */
  title: string;
  /** キャッチコピー */
  catchphrase: string;
  /** 対象業種などの補足説明（トップカードに表示） */
  description?: string;
  /** 想定ターゲット（トップに小さく表示） */
  targets?: string[];
  /** 質問一覧（順番に表示） */
  questions: Question[];
  /** 結果タイプ一覧（4タイプ） */
  resultTypes: ResultType[];
  /** CTAリンク。省略時はサイト共通設定を使用 */
  cta?: Partial<CtaConfig>;
}
