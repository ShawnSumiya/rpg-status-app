"use client";

import { useEffect, useState } from "react";
import { DiagnosisForm } from "@/components/diagnosis-form";
import { StatusCard } from "@/components/status-card";
import type { DiagnosisResult } from "@/lib/types";
import { Sparkles } from "lucide-react";

/**
 * トップページ
 * ランディングヘッダー・診断フォーム・診断結果カードを表示する。
 * 診断結果が表示された際は自動的にトップへスクロールする。
 */
export default function HomePage() {
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  // 診断結果が表示されたらスクロール位置をトップに戻す
  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [result]);

  const hasResult = !!result;

  return (
    <div className="flex w-full flex-col items-stretch gap-6 md:gap-8">
      {/* ランディング的なヘッダー */}
      <section className="mx-auto max-w-3xl text-center space-y-3 md:space-y-4">
        <p className="rpg-label flex items-center justify-center gap-2 text-slate-300/80">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-300/70 bg-black/60">
            <Sparkles className="h-3 w-3 text-amber-200" />
          </span>
          PERSONALITY RPG CARD MAKER
        </p>
        <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl rpg-gradient-text">
          あなたの性格、、、
          <br />
          RPGステータス化します。
        </h1>
        <p className="hero-subtitle text-xs md:text-sm text-slate-200/90 leading-relaxed">
          いくつかの質問に答えるだけで、性格をRPGキャラカードに変換。
          <br />
          メンタルHPから相性最悪な相手まで、すべて数値とスキルで可視化します。
        </p>
      </section>

      {!hasResult && <DiagnosisForm onDiagnosed={setResult} />}

      {hasResult && result && (
        <div className="fade-in-up">
          <StatusCard result={result} />
        </div>
      )}
    </div>
  );
}

