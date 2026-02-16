import type { Metadata } from "next";
import "./globals.css";
import { DotGothic16 } from "next/font/google";
import { SITE_CONFIG } from "@/config/site.config";

/** RPG風ドット絵フォント（DotGothic16）をアプリ全体に適用 */
const dotGothic16 = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dotgothic16"
});

/** SEO・OGP用メタデータ */
export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description
  }
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

