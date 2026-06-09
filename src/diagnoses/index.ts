import type { Diagnosis } from "./types";
import { storeLineDiagnosis } from "./store-line";

/**
 * 診断レジストリ
 *
 * ▼ 業種別の診断を追加する手順
 *   1. このフォルダに新しい設定ファイルを作成（例: beauty-salon.ts）
 *      store-line.ts をコピーして文言・点数・結果文を書き換えるのが簡単です。
 *   2. ここで import して下の DIAGNOSES 配列に追加するだけ。
 *
 *   追加後は自動でトップページ一覧と /diagnosis/[slug] に反映されます。
 *   画面側のコード変更は不要です。
 */
export const DIAGNOSES: Diagnosis[] = [
  storeLineDiagnosis,
  // 例: beautySalonDiagnosis,
  // 例: restaurantDiagnosis,
];

/** スラッグから診断を取得 */
export function getDiagnosis(slug: string): Diagnosis | undefined {
  return DIAGNOSES.find((d) => d.slug === slug);
}

/** 最初に表示するデモ診断（トップから直接開始する用） */
export const FEATURED_DIAGNOSIS = storeLineDiagnosis;
