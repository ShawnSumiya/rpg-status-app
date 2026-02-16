"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DiagnosisResult } from "@/lib/types";
import { Sparkles, Swords } from "lucide-react";
import {
  getRandomQuestions,
  TOTAL_QUESTION_COUNT,
  getStageByCategory,
  type Question
} from "@/lib/questions";
import { SITE_CONFIG } from "@/config/site.config";

/** フォームバリデーションスキーマ（20問すべての回答が必須・400文字以内） */
const formSchema = z.object({
  answers: z
    .array(
      z
        .string()
        .min(1, "選択肢を選んでください")
        .max(400, "400文字以内で入力してください")
    )
    .length(TOTAL_QUESTION_COUNT, `${TOTAL_QUESTION_COUNT}問すべて回答してください`)
});

type FormValues = z.infer<typeof formSchema>;

type DiagnosisFormProps = {
  onDiagnosed: (result: DiagnosisResult) => void;
};

/** ローディングバーの更新間隔（ミリ秒） */
const LOADING_BAR_INTERVAL_MS = 100;

/**
 * 診断フォームコンポーネント
 * 紙芝居形式で1問ずつ表示し、全20問回答後に診断APIを呼び出す。
 * 質問の抽選ロジックは lib/questions.ts の getRandomQuestions に依存。
 * @see lib/questions.ts - 質問の追加・変更・カテゴリ編集を行う場合はこちらを編集。
 */
export function DiagnosisForm({ onDiagnosed }: DiagnosisFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: Array(TOTAL_QUESTION_COUNT).fill("")
    },
    mode: "onChange",
    // 紙芝居形式で一度表示した質問の回答も保持・検証させるため
    shouldUnregister: false
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    trigger
  } = form;
  const stopLoadingBar = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!questions) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingPercent(0);

    // 減速しながら99%まで動き続ける（無限漸近）。100%はAPI成功時のみ。
    loadingIntervalRef.current = setInterval(() => {
      setLoadingPercent((prev) => {
        if (prev >= 100) return 100;

        let increment = 0;
        if (prev < 30) {
          increment = Math.random() * 1 + 2; // 0〜30%: 高速 (+2.0〜3.0)
        } else if (prev < 70) {
          increment = Math.random() * 0.5 + 0.5; // 30〜70%: 中速 (+0.5〜1.0)
        } else if (prev < 90) {
          increment = Math.random() * 0.3 + 0.2; // 70〜90%: 低速 (+0.2〜0.5)
        } else {
          increment = 0.05; // 90〜99%: 超低速（止まらず少しずつ動かす）
        }

        const nextVal = prev + increment;
        return nextVal >= 99 ? 99 : nextVal;
      });
    }, LOADING_BAR_INTERVAL_MS);

    try {
      const payload = {
        answers: questions.map((q, index) => ({
          id: q.id,
          question: q.text,
          answer: values.answers[index]
        }))
      };

      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "診断に失敗しました。");
      }

      const json = (await res.json()) as DiagnosisResult;

      // ※ 実際のAPIレスポンスが返ってきたら100%にして結果表示につなげる
      stopLoadingBar();
      setLoadingPercent(100);
      await new Promise((r) => setTimeout(r, 300));
      onDiagnosed(json);
    } catch (error) {
      console.error(error);
      stopLoadingBar();
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "診断に失敗しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  });

  const handleNext = async () => {
    const isValid = await trigger(`answers.${currentIndex}` as const);
    if (!isValid) return;

    if (!questions) return;

    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      await onSubmit();
      return;
    }

    setCurrentIndex((prev) =>
      Math.min(prev + 1, questions.length - 1)
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    // 質問プールから「ランダム19問 + 固定ラスト1問」を抽選
    setQuestions(getRandomQuestions(TOTAL_QUESTION_COUNT));
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    return () => stopLoadingBar();
  }, []);

  if (!questions || questions.length === 0) {
    return (
      <div className="rpg-panel w-full max-w-2xl mx-auto p-6 md:p-8 flex items-center justify-center">
        <p className="text-sm text-slate-300">質問をロードしています...</p>
      </div>
    );
  }

  const totalCount = TOTAL_QUESTION_COUNT;
  const currentQuestion = questions[currentIndex];
  const currentStage = getStageByCategory(currentQuestion.category);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCount - 1;
  const progressPercent = ((currentIndex + 1) / totalCount) * 100;

  return (
    <form
      onSubmit={onSubmit}
      className="rpg-panel w-full max-w-2xl mx-auto p-6 md:p-8 space-y-6"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="rpg-label">RPG PERSONALITY TEST</p>
          <h1 className="mt-1 text-2xl md:text-3xl rpg-gradient-text">
            {SITE_CONFIG.diagnosisForm.title}
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-300/80 leading-relaxed">
            {SITE_CONFIG.diagnosisForm.description.replace(
              "{count}",
              String(TOTAL_QUESTION_COUNT)
            )}
            <br className="hidden md:inline" />
            {SITE_CONFIG.diagnosisForm.descriptionSub}
          </p>
        </div>
        <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/60 bg-black/40 shadow-rpg-glow">
          <Swords className="h-6 w-6 text-amber-300" />
        </div>
      </header>

      {/* 冒険の進捗バー */}
      <section className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex flex-col">
              <span className="uppercase tracking-[0.18em] text-emerald-300">
                {currentStage.title}
              </span>
              <span className="text-[10px] text-emerald-100/80">
                {currentStage.subtitle}
              </span>
            </div>
            <span className="tabular-nums text-slate-300/90">
              Q{currentIndex + 1} / {TOTAL_QUESTION_COUNT}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-purple-400 shadow-[0_0_12px_rgba(250,204,21,0.7)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {currentStage.description}
          </p>
        </div>

        {/* 紙芝居形式：1問ずつ表示（20問目だけ少し演出を濃くする） */}
        <div
          key={currentQuestion.id}
          className={`mt-4 space-y-2 rounded-lg p-4 md:p-5 question-card-slide ${
            isLast
              ? "border border-amber-400/80 bg-gradient-to-br from-black/80 via-slate-900/90 to-amber-900/40 shadow-[0_0_24px_rgba(250,204,21,0.7)]"
              : "border border-slate-700/70 bg-black/50"
          }`}
        >
          <label className="rpg-label flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-300/60 bg-black/60 text-xs text-amber-200">
              Q{currentIndex + 1}
            </span>
            {isLast && (
              <span className="ml-1 text-[10px] tracking-[0.2em] text-amber-300">
                LAST QUESTION
              </span>
            )}
            <span className="text-sm md:text-base text-slate-100">
              {currentQuestion.text}
            </span>
          </label>
          <div className="mt-3">
            <Controller
              control={control}
              name={`answers.${currentIndex}`}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  {currentQuestion.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        value={option}
                        checked={field.value === option}
                        onChange={() => field.onChange(option)}
                        className="h-4 w-4 text-amber-400 border-slate-600 bg-black"
                      />
                      <span className="text-sm md:text-base text-slate-100 group-hover:text-amber-200">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>
          {errors.answers?.[currentIndex] && (
            <p className="mt-2 text-xs text-red-400">
              {errors.answers[currentIndex]?.message}
            </p>
          )}
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-xs text-red-100">
          {errorMessage}
        </div>
      )}

      <footer className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-between">
        <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed">
          入力内容は診断結果の生成のみに使用されます。
          <br className="hidden md:inline" />
          ブラウザを閉じると回答はリセットされます。
          <span className="text-amber-300">
            {" "}
            直感でサクサク進めてみてください。
          </span>
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {!isLoading && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={isFirst}
                className="rpg-button-ghost min-w-[110px] disabled:opacity-40"
              >
                戻る
              </button>
              <button
                id="diagnosis-btn"
                type="button"
                onClick={handleNext}
                className="rpg-button-primary min-w-[180px] shrink-0 whitespace-nowrap px-3 md:px-4"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {isLast
                    ? "冒険の書を生成する"
                    : "次の質問へ進む"}
                </span>
              </button>
            </div>
          )}
          {/* 診断中: ボタンの代わりにRPG風EXPバー型ローディングを表示（初期状態は非表示） */}
          <div
            className="loading-bar-container"
            style={{ display: isLoading ? "block" : "none" }}
          >
            <p className="loading-bar-label">
              LOADING... {Math.floor(Math.min(loadingPercent, 100))}%
            </p>
            <div className="loading-bar-track">
              <div
                className="loading-bar-fill"
                style={{ width: `${Math.min(loadingPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </form>
  );
}


