import { GoogleGenAI } from "@google/genai";
import type { DiagnosisRequest, DiagnosisResult } from "@/lib/types";
import { diagnosisResultSchema } from "@/lib/validation";
import { CHARACTER_IMAGES } from "@/lib/characters";
import { AI_CONFIG } from "@/config/site.config";

// 公式ドキュメントに合わせて GOOGLE_GENERATIVE_AI_API_KEY を優先しつつ、
// 後方互換として GOOGLE_API_KEY もサポートしておく
const rawGeminiEnv = {
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
};

const apiKey =
  rawGeminiEnv.GOOGLE_GENERATIVE_AI_API_KEY ?? rawGeminiEnv.GOOGLE_API_KEY;

if (!apiKey) {
  // Next.js の起動時に気付きやすくするため、明示的にエラーを投げておく
  // 実運用ではロギング等に差し替えてもよい
  console.warn(
    "[Gemini] GOOGLE_GENERATIVE_AI_API_KEY / GOOGLE_API_KEY が設定されていません。.env.local を確認してください。"
  );
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY（または GOOGLE_API_KEY）が設定されていません。"
    );
  }

  if (client) return client;

  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * 診断のメイン処理：Gemini AI に質問・回答を送り、RPGステータス形式のJSONを生成する。
 *
 * 【カスタマイズのポイント】
 * - systemPrompt（51〜150行付近）: ここを編集すると診断のトーン・毒舌度・出力フォーマットが変わる。
 * - model: "gemini-2.5-flash" を別モデルに変更可能。速度と品質のトレードオフを調整できる。
 * - selectCharacterId: 診断結果に合うキャラクター画像を選択。lib/characters.ts のキャラ一覧と連動。
 */
export async function generateDiagnosis(
  payload: DiagnosisRequest
): Promise<DiagnosisResult> {
  const genAI = getClient();

  const qaLines = payload.answers
    .map(
      (item, index) =>
        `Q${index + 1}. ${item.question}\nA${index + 1}. ${item.answer}`
    )
    .join("\n\n");

  const systemPrompt = AI_CONFIG.systemPrompt;

  const questionCount = payload.answers.length;
  const userPrompt = [
    `以下はユーザーが今回回答した${questionCount}問分のデータです。${questionCount}問すべてを材料に、表面的な印象だけでなく、矛盾や裏の動機も含めて深く読み取り、上記フォーマットの JSON を生成してください。`,
    "",
    qaLines
  ].join("\n");

  const result = await genAI.models.generateContent({
    model: AI_CONFIG.model,
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
      }
    ]
  });

  const text = result.text ?? "";

  try {
    // モデルが ```json ... ``` 形式で返してくる場合があるので、コードフェンスを剥がしてからパースする
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      const firstNewline = cleaned.indexOf("\n");
      const lastFence = cleaned.lastIndexOf("```");
      if (firstNewline !== -1 && lastFence !== -1 && lastFence > firstNewline) {
        cleaned = cleaned.slice(firstNewline + 1, lastFence).trim();
      }
    }

    const parsed = diagnosisResultSchema.parse(
      JSON.parse(cleaned)
    ) as DiagnosisResult;

    // 後方互換のため、bestPartner が空なら match を流用する
    if (!parsed.analysis.bestPartner) {
      parsed.analysis.bestPartner = parsed.analysis.match;
    }

    // 診断結果の性格に合わせて、22種類のキャラクター画像から最適なものをGeminiに選択させる
    try {
      parsed.characterId = await selectCharacterId(parsed);
    } catch (charError) {
      console.warn("[Gemini] キャラクター選択に失敗、フォールバックを使用:", charError);
      parsed.characterId = "hero";
    }

    return parsed;
  } catch (error) {
    console.error("[Gemini] JSON パースに失敗しました。raw response:", text);
    throw new Error("診断結果の解析に失敗しました。しばらくしてから再度お試しください。");
  }
}

/** 診断結果の性格に最も相性の良いキャラクター画像IDをGeminiに選択させる */
async function selectCharacterId(diagnosis: DiagnosisResult): Promise<string> {
  const genAI = getClient();

  const characterList = CHARACTER_IMAGES.map(
    (c) => `- id: "${c.id}", name: "${c.name}", tags: ${c.tags}`
  ).join("\n");

  const prompt = [
    "以下はRPG診断の結果です。この診断結果の性格（className、flavorText、passiveSkill、stats、analysis など）と最も相性が良いキャラクターを、下記の22種類から1つだけ選んでください。",
    "各キャラクターの tags を参考に、性格のマッチ度で判断してください。",
    "",
    "【診断結果】",
    `className: ${diagnosis.className}`,
    `flavorText: ${diagnosis.flavorText.slice(0, 500)}...`,
    `passiveSkill: ${diagnosis.passiveSkill.name} - ${diagnosis.passiveSkill.description}`,
    "",
    "【選択肢（22種類）】",
    characterList,
    "",
    "出力は必ず次のJSON形式のみにし、余計なテキストは含めないでください：",
    '{"characterId": "ここに選んだidを1つだけ"}'
  ].join("\n");

  const result = await genAI.models.generateContent({
    model: AI_CONFIG.model,
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const text = (result.text ?? "").trim();
  let cleaned = text;
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    const lastFence = cleaned.lastIndexOf("```");
    if (firstNewline !== -1 && lastFence !== -1 && lastFence > firstNewline) {
      cleaned = cleaned.slice(firstNewline + 1, lastFence).trim();
    }
  }

  const parsed = JSON.parse(cleaned) as { characterId?: string };
  const id = parsed.characterId;
  const validIds = new Set(CHARACTER_IMAGES.map((c) => c.id));
  if (typeof id === "string" && validIds.has(id)) return id;
  return "hero";
}

