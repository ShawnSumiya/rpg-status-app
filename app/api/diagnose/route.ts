import { NextRequest, NextResponse } from "next/server";
import { diagnosisRequestSchema } from "@/lib/validation";
import type { DiagnosisRequest } from "@/lib/types";
import { generateDiagnosis } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    const parsed = diagnosisRequestSchema.parse(json) as DiagnosisRequest;

    const result = await generateDiagnosis(parsed);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("[API] /api/diagnose error", error);

    // Zod バリデーションエラー
    if (error instanceof Error && "issues" in (error as any)) {
      return NextResponse.json(
        {
          error: "入力値が不正です。",
          details: (error as any).issues
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

