import { z } from "zod";
import { TOTAL_QUESTION_COUNT } from "@/lib/questions";

export const singleAnswerSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z
    .string()
    .min(1, "答えを入力してください")
    .max(400, "400文字以内で入力してください")
});

export const diagnosisRequestSchema = z.object({
  answers: z
    .array(singleAnswerSchema)
    .length(
      TOTAL_QUESTION_COUNT,
      `${TOTAL_QUESTION_COUNT}問すべてに回答してください`
    )
});

// Gemini からの診断結果 JSON を検証するスキーマ
export const diagnosisResultSchema = z.object({
  characterId: z.string().optional(),
  className: z.string(),
  level: z.number().int(),
  stats: z.object({
    str: z.number(),
    vit: z.number(),
    int: z.number(),
    agi: z.number(),
    luk: z.number()
  }),
  passiveSkill: z.object({
    name: z.string(),
    description: z.string()
  }),
  unequipableItem: z.object({
    name: z.string(),
    reason: z.string()
  }),
  flavorText: z.string(),
  analysis: z.object({
    strategy: z.string(),
    weakness: z.string(),
    match: z.string(),
    bestPartner: z.string().optional()
  })
});

export type DiagnosisRequestInput = z.infer<typeof diagnosisRequestSchema>;

