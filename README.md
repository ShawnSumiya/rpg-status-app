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

## 🛠 アプリのカスタマイズ方法（プログラミング不要）

本アプリは、設定ファイル **`config/site.config.ts`** を編集するだけで、
アプリ名、AIの性格、ステータス項目などを自由に変更できます。

### 1. 設定ファイルを開く
フォルダ内の `config/site.config.ts` をテキストエディタ（VSCodeやメモ帳など）で開きます。

### 2. 各項目を編集する

#### 🅰️ アプリ名・説明文の変更
`siteInfo` の部分を書き換えると、ブラウザのタブ名やSNSシェア時の文章が変わります。

```typescript
siteInfo: {
  title: "あなたのアプリ名", 
  description: "アプリの説明文...",
  // ...
},
```

#### 🅱️ ステータス項目（パラメータ）の変更
`statusLabels` の部分を書き換えると、診断結果のグラフや画像の項目名が変わります。
※ `str` や `vit` などの左側のキー（英語部分）は変更しないでください。

```typescript
statusLabels: {
  str: "営業力",    // 元: STR / 自己主張力
  vit: "忍耐力",    // 元: VIT / メンタル耐久
  int: "企画力",    // 元: INT / 悪知恵
  agi: "行動力",    // 元: AGI / 逃げ足
  luk: "愛嬌",      // 元: LUK / 異性運
},
```

#### 🅾️ AIの性格（診断内容）の変更
`aiConfig.persona` の文章を変更することで、AIの口調やキャラ設定が変わります。
「辛口で」「優しく」「戦国武将風に」など、自由に指示を書き込んでください。

```typescript
aiConfig: {
  persona: `
    あなたはここを自由に書き換えてください。
    例：あなたは熱血テニスコーチです。「〜だ！」という口調で話してください。
  `,
},
```

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
