# Codex 依頼プロンプト — Nagamachi BASE 安定化（返金ゼロ設計＋速度改善）

> このファイルの内容をそのまま Codex に渡してください。
> 目的: (1) 「決済成立したのに枠が無い」状態を構造的に消し、返金・手動復旧をゼロにする
> （オーナーの手作業はフォーム承認のみ） / (2) タップの体感速度を上げる /
> (3) 本番反映・外部サービス操作は勝手に行わない。

---

あなたはNagamachi BASEの予約/決済/鍵システムの安定化を担当するエンジニアです。
このリポジトリ（claude_review_bundle_20260619 / 本番コードのコピー）に対して作業します。

対象:
- liff_line_link_page/js/plan-b-app.js, booking-rules.js
- netlify/functions/booking-api.js, stripe-webhook.js, line-webhook.js
- apps_script/nagamachi_base_line_rich_menu/Code.gs
- scripts/ 配下のテスト

## 最重要ゴール（2つ）
A. 「決済が成立したのに、その予約枠が確保できていない」状態を“構造的に”発生させない。
   - 自動返金・手動返金・手動復旧オペレーションを一切使わない。
   - これらが必要になる時点で設計が誤り、とみなす。
B. LIFFのタップ時の体感速度を上げる（特に予約画面の週送り・種別切替・初期表示）。

## 大原則：流れは変えず、中身だけ良くする（ふるまい保存）
- これは“ふるまいを保つリファクタリング＋限定的な信頼性/速度改善”である。
  会員から見える画面遷移・操作・文言・APIの入出力契約は変えない。内部実装だけ良くする。
- 既存のルート/アクション名と入出力契約は維持する:
  ルート: apply / booking / booking-confirm / booking-success / booking-cancel /
          my-reservations / pricing / guide / contact
  アクション: memberContext / prepareApplication / availability / availabilityRange /
              quote / createCheckout / myReservations / resumeCheckout / cancelPendingReservation
  （内部実装は変えてよいが、リクエスト/レスポンスのフィールドと意味は後方互換を保つ）
- 「決済を再開」「未決済予約を取り消す」のpending復帰UIと導線は今までどおり動くこと。
- やむを得ず外から見えるふるまいが変わる箇所が出る場合は、勝手に変えず、
  段階1の設計書に「変わる点・理由・代替が無いこと」を列挙してオーナー確認を取ること。
  （想定される唯一の内部変更は「取り直し時の枠の持ち方」と「決済確定方式(capture)」のみ。
    これらも会員の操作・画面としては同一に保つ。）

## 運用最小化（絶対要件）
オーナーが行う手作業は「入会フォームに申込みが来たら、確認して承認する」だけにする。
それ以外（予約確定・鍵発行・失敗時の復旧・未払い対応・各種通知）はすべて自動。
現在 Apps Script メニューにある手動復旧系（決済後エラー予約の安全復旧など）は、
設計で“起きない”ようにするか、自動トリガ化して、オーナーの手作業を増やさないこと。

## 絶対に発生させてはいけない状態と、守るべき不変条件
原因は「枠の保持」を2つの別時計で管理していること:
- 時計A: Sheetsの pending（created_at から PLAN_B_PENDING_HOLD_MINUTES のローカルタイマー）
- 時計B: Stripe Checkout Session の寿命（resumeCheckout で延長され得る）

この2つがズレた瞬間に「Bはまだ払えるのにAの枠は解放/他者取得済み」が生じ、
決済成立後に planBFindReservationSlotConflict_ が競合検出 → status=error → 課金済み・鍵なし、
となる。これを設計で消す。

守る不変条件（最重要）:
> 「同一の予約枠に対して “いま支払い可能な Stripe Checkout Session” は、常に最大1つしか存在しない。」

## 設計方針（この方針に沿って設計書を作ること）
1. 時計を1本に畳む:
   - 枠の保持＝「その予約のStripe Sessionがまだ生きている（open）こと」と定義する。
   - 空き判定(availability)の pending 生存条件を、ローカル35分タイマー単独ではなく
     “Sessionがopen/未失効”に一致させる（Stripeの状態をSheetsにミラーして空き判定はミラーを読む）。
   - Sessionの expires_at は保持期限に合わせる。resumeCheckout は expires_at を
     元の保持期限より延長しない（キャップする）。

2. 枠を空ける操作は必ず “先にStripe Sessionをexpireしてから”:
   - cancel / 取り直し / 期限切れ掃除など、枠を解放するすべての経路で、
     まず該当 Stripe Session の expire を成功させ、その後に枠を解放する。
   - expireは返金ではない（未払いの決済ページを閉じるだけ。金銭は動かない）。
   - expireが「もう完了/支払い済みで閉じられない」と返したら、それは“実は払われていた”ので、
     枠を解放せずそのまま鍵発行(fulfillment)へ進める。
   - Stripe操作はNetlify側にしか鍵が無いので、Apps Script内で枠を空ける処理（現状の
     planBSupersedeMemberPendingForSlot_ 等）は廃止し、解放はNetlify経由のexpireを通す設計にする。

3. supersede(作り直し)をやめ、「1会員・1枠＝1予約・1Session」を再利用する:
   - createCheckout は「(会員,枠)に対する get-or-reuse」にする。既存の生きたpendingがあれば
     新規作成せず再利用し、Sessionも“openなら再利用／駄目なら旧をexpireしてから1本だけ作り直す”。
   - 新しいpendingやSessionを量産しない（二重Session・二重課金の芽を断つ）。

4. 枠が解放される唯一の経路を限定する:
   - (a)決済成功, (b)明示キャンセル(expire成功が前提), (c)checkout.session.expired Webhook、のみ。
   - 純粋なローカル時刻だけで枠を空ける処理は削除する。
   - Webhook欠落への保険として、保持期限+猶予を超えたpendingに対し
     StripeにSession状態を問い合わせて整合させる“低頻度の自動リコンサイル”を入れる（手動オペは増やさない）。

5. 残余レースでも返金が要らない決済モードにする:
   - 上記が守られれば競合は理論上起きないが、万一の残余レースでも“返金”を発生させないため、
     決済は manual capture（与信→確定/ボイド）を基本とし、Webhookで枠を確保できたら即capture、
     確保できない万一の場合はvoid（=課金が成立しない。返金ではない）とする。
   - 既存の payment_authorized / requires_capture / planBStripeReservationAuthorizationCanceled_ /
     stripe-webhookでのPaymentIntent取得 などの未完部分を整合させる。
   - capture/voidはNetlify(Stripe鍵あり)で行い、枠の確保判定と台帳更新はApps Script(LockService)で行う、
     という責務分担を厳守する。即時confirmのUXを壊さないこと（confirm画面→数秒で鍵が見える）。
   - 注: auto-captureのままで本要件(返金ゼロ)を満たせると判断する場合は、その根拠を設計書に明記し、
     どちらの方式を採るかを段階1で必ずオーナー確認すること。

6. 既存の LockService + planBFindReservationSlotConflict_ は“発火しない最終防壁”として残す。

7. 既存のLINE通知を壊さないこと（明示要件）:
   - お問い合わせ自動返信（line-webhook.js → processLineContactEvents_ → replyLineTextMessage_）と
     画像受付の返信は今回の変更対象外。挙動を変えない。
   - 決済後の「会員向け予約完了通知」と「運営向け予約通知」は、
     “実際に課金が確定した後（manual captureならcapture成功後、auto captureなら入金確定後）に、
     ちょうど1回ずつ”飛ぶこと。飛ばない／二重で飛ぶ／与信のみ(未確定)で飛ぶ、を禁止する。
   - 7時/21時のサマリー通知トリガ、通知グループ登録、宛先の重複排除も挙動を変えない。
   - completed_line_notify_status / admin_line_notify_status による“送信済み記録→再送防止”を維持する。

## 速度改善（B）の具体方針
- planBResolveMemberByIdToken_ の verifyLineIdToken_（毎API外部HTTPS）を CacheService 等で
  短期キャッシュし、週送り/種別切替のたびに外部検証が走らないようにする。
- availabilityRange の全行走査を軽量化（期間で getValues 段階から絞る／会員・日付インデックス化）。
  7日分を1回で取り、クライアント側でも近接週をプリフェッチ/キャッシュして再取得を減らす。
- タップは楽観的UI（押下フィードバックは既存 installTapFeedback を活かしつつ、
  実処理の待ちを短縮）。二度押し対策はサーバ整合(不変条件)で担保されるので、UIは速さ優先にしてよい。
- 体感の重い箇所（idToken待ち・空き取得待ち）を計測し、before/afterを設計書/レポートに記載。

## 禁止事項（厳守）
- 本番反映・外部サービスへの実操作を勝手に行わない:
  clasp push / clasp deploy / netlify deploy --prod / Stripe実操作 / LINE設定変更 /
  KEYVOX実操作 は実行禁止。
- 本番のApps Script, Netlify, Stripe, LINE, KEYVOX, Google Sheets を変更しない。
- .env / .clasp.json / .clasprc.json / 各種トークン・個人情報をコミットしない・出力しない。
- 破壊的・不可逆な操作の前は必ず目的・影響範囲・リスクを説明して確認を取る。

## 進め方（段階を厳守）
### 段階1（まず設計だけ。実装しない）
- DESIGN_no_paid_without_slot.md を作成し、以下を含める:
  - 状態遷移表（pending→paid/expired/cancelled 等とStripe/Sheets/KEYVOXの対応）
  - 不変条件の証明（なぜ競合が起きないか）
  - Netlif↔Apps Scriptのやり取りとロック手順
  - expires_at整合、リコンサイル間隔、capture/voidの責務分担
  - auto vs manual capture の判断と根拠
  - 変更ファイル一覧、移行/デプロイ順序とロールバック、影響範囲
- ここで一旦停止し、オーナーの承認を待つ（実装に進まない）。

### 段階2（承認後に実装）
- 専用ブランチで実装。ローカルで `npm test` が全て緑になること。
- scripts/ に結合テストを追加（下記「受け入れ基準」を満たすこと）。
- `node --check` による構文チェックも通す。

### 段階3（実行はしない。手順書だけ）
- デプロイ手順書（Apps Script先→Netlifyの順序、cacheキー更新、ロールバック）を文書化。
  実際の clasp push / netlify --prod 等は行わず、オーナーの承認待ちで終える。

## 受け入れ基準（段階2で自動テスト化する具体シナリオ）
- 取り直し: 同一(会員,枠)で再度createCheckout→新規pendingを量産せず1予約/1Sessionを再利用する。
- 旧Sessionで決済: 枠解放の前に必ずexpireされ、expire不可(=支払済)なら解放せずfulfillmentへ進む。
- 二重Session/二重課金が発生しないこと。
- 期限切れ: ローカル時刻単独で枠が空かないこと。expired Webhook受信またはリコンサイルでのみ解放。
- 決済成功後、status/key_issue_status の確定と、会員/運営/グループ通知が二重送信されないこと。
- 決済後の会員通知・運営通知が、課金確定後に“ちょうど1回ずつ”飛ぶこと（飛ばない/二重/未確定での送信を禁止）。
- お問い合わせ自動返信・画像受付返信が従来どおり動作すること（回帰テスト）。

### 現状維持（回帰）チェック — これらの“流れ”が変わっていないこと
- 入会申込フロー（apply → memberContext分岐 → prepareApplication → Googleフォーム遷移）。
- 申込フォーム送信トリガ / 会員ステータス編集トリガ / 本人確認画像のLINE受付→Drive保存→行紐づけ。
- 初回会費決済のWebhook処理（client_reference_id分岐 / メール照合 / 会員登録完了通知）。
  ※ 予約Checkoutの再設計が、この初回会費決済の経路を壊さないこと（同じstripe-webhookを共有している）。
- 月会費の未払い猶予→日次sweep→停止、解約即停止、回復で復帰、の自動処理。
- 予約フロー（booking → 7日空き表示 → quote確認 → createCheckout → Stripe → success/cancel画面）。
- 予約確認（未来予約＋未決済pendingのみ表示／過去予約・cancelled等は非表示／「今回の予約」バッジ）。
- QR/鍵の表示条件（決済済み＆key_issue_status=issued＆会員状態OKのときだけ／pendingでは出さない）。
- KEYVOX鍵発行（決済後にのみ発行／失敗時の自動復旧トリガ／空き照会は予約可否に使わない）。
- リッチメニューの各routeと文言、料金/ガイド表示。
- 上記を確認する回帰テストを scripts/ に追加し、既存テストも含め npm test を緑にすること。
- 決済前は鍵/QRを返さない既存ゲートが維持されること（pendingでQRが出ない）。
- 金額・人数・麻雀オプション・日時が 画面/quote/Stripe line item/reservationsシート/LINE通知 で一致すること。
- 万一の競合検出時に“返金”が発生しないこと（void もしくは構造上未到達）。
- KEYVOX空き照会は予約可否判定に戻さないこと。

## 出力フォーマット
- 段階1: DESIGN_no_paid_without_slot.md（上記内容）＋ auto/manual captureの推奨と理由 ＋ 確認したい論点。
- 段階2以降: 変更点サマリ、追加テスト一覧、テスト結果(緑)、before/after速度メモ、デプロイ手順書。

いきなりコードを書き始めず、段階1の設計書を最初に提出して停止すること。
