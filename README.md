## RPG風・性格ステータス診断アプリ

Gemini を使って、いくつかの質問からユーザーの性格を **RPGキャラクターのステータスカード** として生成する Next.js アプリです。  
診断結果は Web 上で閲覧できるほか、`@vercel/og` を用いて OG 画像として生成し、保存やシェアに利用できます。

### 技術スタック

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **UI テイスト**: ダークファンタジー / RPG 風
- **AI**: Google Generative AI SDK (`@google/generative-ai`)
- **Form**: React Hook Form + Zod
- **Image Generation**: `@vercel/og`
- **Icons**: Lucide React

### セットアップ

```bash
cd documents

# 依存関係のインストール
cd rpg-status-app
npm install

# 開発サーバー起動
npm run dev
```

### 環境変数

`GOOGLE_API_KEY` を `.env.local` に設定してください。

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 主なエントリポイント

- `app/page.tsx`  
  ランディング＋診断フォーム＋結果表示カードをまとめたトップページ。

- `app/api/diagnose/route.ts`  
  ユーザーの回答を受け取り、Gemini に構造化出力で診断を依頼する API。

- `app/api/og/route.tsx`  
  診断結果の一部をクエリパラメータから受け取り、OG 画像を生成するエンドポイント。

- `components/diagnosis-form.tsx`  
  React Hook Form + Zod で構成された 5 問の心理テストフォーム。

- `components/status-card.tsx`  
  Gemini から返された診断結果を RPG のステータス画面風 UI で表示するカード。

