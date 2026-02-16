import type { Metadata } from "next";
import "./globals.css";
import { DotGothic16 } from "next/font/google";

/** RPG風ドット絵フォント（DotGothic16）をアプリ全体に適用 */
const dotGothic16 = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dotgothic16"
});

/** SEO・OGP用メタデータ */
export const metadata: Metadata = {
  title: "RPG性格ステータス診断 - 冒険の書メーカー",
  description:
    "Gemini があなたの性格を辛口RPGステータスに変換する診断アプリ。メンタルHPから相性最悪な相手まで丸わかり。"
};

/**
 * ルートレイアウト
 * 全体のレイアウト構造とフォント、ダークテーマを設定する。
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${dotGothic16.variable} font-gothic antialiased`}>
        <main className="min-h-screen flex justify-center px-4 py-10">
          <div className="w-full max-w-5xl flex flex-col items-stretch">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

