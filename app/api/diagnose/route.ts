import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { diagnosisRequestSchema } from "@/lib/validation";
import type { DiagnosisRequest } from "@/lib/types";
import { generateDiagnosis } from "@/lib/gemini";

export const runtime = "nodejs";

/**
 * 診断APIエンドポイント
 * 質問・回答のペアを受け取り、Gemini AI による性格診断を実行してRPGステータス形式で返す。
 * @see lib/gemini.ts - 診断ロジックの本体。プロンプトや出力形式を変更したい場合はこちらを編集。
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    const parsed = diagnosisRequestSchema.parse(json) as DiagnosisRequest;

    const result = await generateDiagnosis(parsed);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("[API] /api/diagnose error", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "入力値が不正です。",
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "診断に失敗しました。時間をおいて再度お試しください。"
      },
      { status: 500 }
    );
  }
}

