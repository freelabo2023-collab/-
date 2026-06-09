import type { Diagnosis } from "./types";

/**
 * デモ診断：「店舗のLINE売上導線診断」
 *
 * ▼ 文言の差し替えはこのファイルだけでOKです
 *   - 質問文 / 選択肢      : questions[].text, questions[].choices[].label
 *   - 点数                : questions[].choices[].points（高い＝できている）
 *   - 結果タイプの判定重み : questions[].choices[].weights（合計が最大のタイプが結果）
 *   - 結果文              : resultTypes[]
 *
 * ▼ 結果タイプの判定ロジック（概要）
 *   各回答の weights を結果タイプごとに合計し、最も高いタイプを採用します。
 *   total スコア（points 合計）は「総合スコア」として表示し、
 *   points が低い質問の improvement を「優先して直すべき3つ」に自動表示します。
 */

// 結果タイプID（このファイル内の resultTypes と対応）
const A = "A"; // まずは導線整理タイプ
const B = "B"; // LINE公式整備タイプ
const C = "C"; // 自動応答・AI Bot導入タイプ
const D = "D"; // 集客導線作り直しタイプ

export const storeLineDiagnosis: Diagnosis = {
  slug: "store-line",
  title: "店舗のLINE売上導線診断",
  catchphrase:
    "あなたのお店は、Instagramから予約・問い合わせを取りこぼしていませんか？",
  description:
    "8つの質問に答えるだけで、Instagram・LINE公式・予約導線の弱点と、今すぐ直すべきポイントが分かります。所要時間は約1分です。",
  targets: [
    "美容室",
    "整体",
    "エステ",
    "ドッグカフェ",
    "トリミングサロン",
    "飲食店",
    "サウナ",
    "個人サロン",
  ],

  questions: [
    {
      id: "q1",
      text: "Instagramを見た人が、次に何をすればいいか分かりますか？",
      improvement:
        "プロフィールに「予約・問い合わせ」への入口を1つにまとめ、見た人が迷わず次へ進めるようにしましょう。",
      choices: [
        { id: "A", label: "予約・問い合わせまで分かりやすく案内している", points: 3, weights: { A: 1 } },
        { id: "B", label: "プロフィールにリンクはあるが、少し分かりにくい", points: 2, weights: { A: 2 } },
        { id: "C", label: "投稿はしているが、予約導線は弱い", points: 1, weights: { D: 2 } },
        { id: "D", label: "ほとんど案内していない", points: 0, weights: { D: 3 } },
      ],
    },
    {
      id: "q2",
      text: "LINE公式アカウントは活用できていますか？",
      improvement:
        "LINE登録後の「あいさつメッセージ」「予約案内」「配信」を整えると、登録が売上につながりやすくなります。",
      choices: [
        { id: "A", label: "登録後の案内・予約・配信まで整っている", points: 3, weights: { A: 1 } },
        { id: "B", label: "アカウントはあるが、あまり運用できていない", points: 2, weights: { B: 3 } },
        { id: "C", label: "作っただけで止まっている", points: 1, weights: { B: 3 } },
        { id: "D", label: "まだ持っていない", points: 0, weights: { D: 2, B: 1 } },
      ],
    },
    {
      id: "q3",
      text: "初めての人が料金・メニューをすぐ理解できますか？",
      improvement:
        "メニュー・料金・所要時間を1ページにまとめ、初めての人がすぐ確認できる場所に置きましょう。",
      choices: [
        { id: "A", label: "メニュー・料金・所要時間まで分かりやすい", points: 3, weights: { A: 1 } },
        { id: "B", label: "だいたい分かるが、少し迷う", points: 2, weights: { A: 1 } },
        { id: "C", label: "投稿を探さないと分からない", points: 1, weights: { D: 2 } },
        { id: "D", label: "料金やメニューが分かりにくい", points: 0, weights: { D: 2 } },
      ],
    },
    {
      id: "q4",
      text: "よくある質問への対応はできていますか？",
      improvement:
        "「営業時間・料金・予約方法・アクセス」など、よく聞かれる内容をLINEの自動応答やWebに事前に用意しましょう。",
      choices: [
        { id: "A", label: "LINEやWebで事前に回答できている", points: 3, weights: { A: 1 } },
        { id: "B", label: "投稿やハイライトに少し載せている", points: 2, weights: { B: 1 } },
        { id: "C", label: "DMや電話で毎回対応している", points: 1, weights: { C: 3 } },
        { id: "D", label: "あまり整理できていない", points: 0, weights: { C: 1, D: 1 } },
      ],
    },
    {
      id: "q5",
      text: "予約・問い合わせまでの手順は短いですか？",
      improvement:
        "予約・問い合わせは「1〜2タップ」で完了できる導線に。リンクの数を減らし、入口を分かりやすくしましょう。",
      choices: [
        { id: "A", label: "1〜2タップで予約・問い合わせできる", points: 3, weights: { A: 1 } },
        { id: "B", label: "予約リンクはあるが少し迷う", points: 2, weights: { A: 2 } },
        { id: "C", label: "DMや電話が中心", points: 1, weights: { C: 2 } },
        { id: "D", label: "予約方法が分かりにくい", points: 0, weights: { D: 3 } },
      ],
    },
    {
      id: "q6",
      text: "一度来た人に再来店してもらう仕組みはありますか？",
      improvement:
        "LINEのクーポンや定期配信で「もう一度行く理由」をつくり、再来店の導線を用意しましょう。",
      choices: [
        { id: "A", label: "LINE配信やクーポンで再来店導線がある", points: 3, weights: { A: 1 } },
        { id: "B", label: "ときどき投稿や配信で案内している", points: 2, weights: { B: 1 } },
        { id: "C", label: "常連さん任せになっている", points: 1, weights: { B: 2 } },
        { id: "D", label: "特に何もしていない", points: 0, weights: { B: 2, D: 1 } },
      ],
    },
    {
      id: "q7",
      text: "キャンペーンや新メニューを届ける手段はありますか？",
      improvement:
        "LINE配信・Instagram・店頭を連動させ、「届けたい時に届けられる」発信の仕組みを整えましょう。",
      choices: [
        { id: "A", label: "LINE配信・Instagram・店頭で連動している", points: 3, weights: { A: 1 } },
        { id: "B", label: "Instagram中心で発信している", points: 2, weights: { B: 1 } },
        { id: "C", label: "思いついた時だけ投稿している", points: 1, weights: { B: 2 } },
        { id: "D", label: "ほとんど告知できていない", points: 0, weights: { D: 2 } },
      ],
    },
    {
      id: "q8",
      text: "今、一番困っていることは何ですか？",
      hint: "この回答は、おすすめの方向性を決める参考にします。",
      // この質問は方向性を聞くため、総合スコアには含めません
      scored: false,
      improvement:
        "「何を一番増やしたいか」を決めると、直す順番がはっきりします。まずは1つに絞りましょう。",
      choices: [
        { id: "A", label: "新規客を増やしたい", points: 0, weights: { D: 3 } },
        { id: "B", label: "予約・問い合わせを増やしたい", points: 0, weights: { A: 3 } },
        { id: "C", label: "リピートを増やしたい", points: 0, weights: { B: 3 } },
        { id: "D", label: "対応の手間を減らしたい", points: 0, weights: { C: 4 } },
        { id: "E", label: "何から直せばいいか分からない", points: 0, weights: { D: 3 } },
      ],
    },
  ],

  resultTypes: [
    {
      id: A,
      title: "まずは導線整理タイプ",
      description:
        "InstagramやWebで興味を持ってもらえていても、予約・問い合わせまでの道筋が少し分かりにくい状態です。まずは、プロフィールリンク、LINE登録、予約ページ、メニュー案内を整理するだけでも、取りこぼしを減らせる可能性があります。",
      challenge:
        "発信はできているのに、「見た人がどこへ進めばいいか」の案内が少し弱く、あと一歩のところで予約・問い合わせを取りこぼしています。",
      lineAdvice:
        "プロフィールの入口をLINE登録に集約し、登録後すぐに「予約はこちら」「メニューはこちら」を案内する。最初の数通で迷わせないことがポイントです。",
      plan: { name: "ライトプラン", price: "30,000円" },
    },
    {
      id: B,
      title: "LINE公式整備タイプ",
      description:
        "LINE公式アカウントはあるものの、登録後に何を案内するか、どう予約につなげるかが弱い状態です。初回案内、よくある質問、予約導線、再来店案内まで整えることで、LINEを使える営業導線に変えられます。",
      challenge:
        "LINEという強力な接点を持っているのに、登録後の案内・予約・再来店の導線が整っておらず、活かしきれていません。",
      lineAdvice:
        "あいさつメッセージ・よくある質問・予約導線・再来店クーポンをセットで用意し、「登録 → 予約 → 再来店」までを一本の流れにします。",
      plan: { name: "スタンダードプラン", price: "50,000円" },
    },
    {
      id: C,
      title: "自動応答・AI Bot導入タイプ",
      description:
        "問い合わせ対応や案内に時間を取られている状態です。営業時間、料金、予約方法、メニュー説明など、毎回同じ内容を人が対応している場合は、LINEの自動応答やAI Botを入れることで、対応の手間を減らしながら予約につなげやすくなります。",
      challenge:
        "DMや電話で同じ質問への対応を繰り返しており、対応の手間が予約対応や接客の時間を圧迫しています。",
      lineAdvice:
        "よくある質問をLINEの自動応答やAI Botに任せ、人は「予約確定」と「接客」に集中。24時間、取りこぼさず案内できる状態をつくります。",
      plan: { name: "プレミアムプラン", price: "80,000円" },
    },
    {
      id: D,
      title: "集客導線作り直しタイプ",
      description:
        "Instagram、LINE、予約ページ、メニュー案内が分断されていて、お客様が途中で迷いやすい状態です。投稿を頑張る前に、「見た人がどこへ進むのか」「登録後に何を案内するのか」「予約まで何タップで進めるのか」を一度整理する必要があります。",
      challenge:
        "発信・LINE・予約・メニューがそれぞれ独立していて、お客様が途中で離脱しやすい状態です。投稿量を増やす前に、全体の導線設計を見直す段階です。",
      lineAdvice:
        "まずは「Instagram → LINE登録 → 予約」の1本道を設計。LINEを導線の中心に置き、各接点をつなぎ直すところから始めます。",
      plan: { name: "導線設計パック", price: "要相談" },
    },
  ],
};
