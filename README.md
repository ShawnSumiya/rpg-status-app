# RPGステータス診断生成システム (Next.js + Gemini API)

このシステムは、Googleの生成AI「Gemini」を利用して、ユーザーの回答からRPG風のステータスカードを自動生成するWebアプリケーションです。
設定ファイルを編集するだけで、診断内容、キャラクター設定、アプリ名などを自由にカスタマイズ可能です。

## ✨ 特徴

- **AIによる無限診断**: 固定の診断結果ではなく、AIが毎回ユニークな文章と数値を生成します。
- **簡単カスタマイズ**: `config/site.config.ts` を編集するだけで、独自の診断アプリに変身します。
- **高画質画像生成**: 結果画面をOGP（SNSシェア用画像）として自動生成します。

## 🛠 必須環境

- Node.js (v18以上推奨)
- Google AI Studio アカウント (APIキー取得用)
- Vercel アカウント (公開用・任意)

## 🚀 ローカルでの起動方法

1. **依存パッケージのインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**  
   `.env.local` を作成し、Gemini の API キーを設定します。
   ```bash
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```
   （`GOOGLE_GENERATIVE_AI_API_KEY` も利用可能です。未設定の場合は `GOOGLE_API_KEY` が使われます。）

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   ブラウザで http://localhost:3000 を開いて動作を確認できます。

## 📁 主なファイル・エントリポイント

| パス | 説明 |
|------|------|
| `config/site.config.ts` | アプリ名・説明・URL・ヒーロー文言・診断フォームテキスト・AIの性格（プロンプト）などをまとめた設定ファイル。ここを編集してカスタマイズします。 |
| `app/page.tsx` | トップページ（ランディング＋診断フォーム＋結果表示カード）。 |
| `app/api/diagnose/route.ts` | ユーザーの回答を受け取り、Gemini に診断を依頼する API。 |
| `app/api/og/route.tsx` | 診断結果をクエリから受け取り、OG 画像を生成するエンドポイント。 |
| `components/diagnosis-form.tsx` | React Hook Form + Zod による診断フォーム。 |
| `components/status-card.tsx` | 診断結果を RPG ステータス風 UI で表示するカード。 |

## 🛠 技術スタック

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **UI**: ダークファンタジー / RPG 風
- **AI**: Google Generative AI SDK (`@google/genai`)
- **Form**: React Hook Form + Zod
- **OG 画像**: `@vercel/og`
- **Icons**: Lucide React

## 📜 利用可能なスクリプト

- `npm run dev` — 開発サーバー起動
- `npm run build` — 本番ビルド
- `npm run start` — 本番サーバー起動
- `npm run lint` — ESLint 実行
