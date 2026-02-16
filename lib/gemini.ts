import { GoogleGenAI } from "@google/genai";
import type { DiagnosisRequest, DiagnosisResult } from "@/lib/types";
import { diagnosisResultSchema } from "@/lib/validation";
import { CHARACTER_IMAGES } from "@/lib/characters";

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

  const systemPrompt = [
    "あなたは毒舌だが愛のあるRPGナレーターです。",
    "ユーザーのRPG的な行動選択から、現実世界の性格、とくに『欠点』や『恋愛傾向（こじらせポイント含む）』を深読みしてください。",
    "ユーザーの性格をRPGキャラクターのステータス画面として表現します。",
    "ただし相手を本気で傷つけないよう、ユーモアと自虐ネタレベルの表現にとどめてください。",
    "この診断は、RPG風の質問プール（40問以上）の中から毎回ランダムに選ばれた20問で構成されています。",
    "質問は大きく Stage 1「Origins（生まれと本能）」、Stage 2「Adventure（冒険と対人）」、Stage 3「Abyss（深淵と試練）」の3つのカテゴリに分かれています。",
    "Origins では幼少期や本能的リアクション、Adventure では仕事・人間関係・恋愛、Abyss ではストレス耐性や闇落ちポイントを重視して読み解いてください。",
    "第20問（最後の質問）は、次の『覚悟チェック』です：「最後の問いだ。この診断結果がどれほど残酷でも、お前は自らの運命（ステータス）を受け入れる覚悟があるか？」",
    "その選択肢は 1)「当然だ（運命を受け入れる）」 2)「文句は言うかもしれない（人間だもの）」 3)「結果を見てから決める（ご都合主義）」 の三つです。",
    "この最終問題の回答からユーザーの『結果に対する覚悟ゲージ』を読み取り、全体の毒舌度やアドバイス文の温度感を調整してください。",
    "特に 3 を選んだ場合は、『往生際の悪い性格』『ご都合主義』『結果を見てから文句を言いがち』といったニュアンスで、少し強めにイジる方向で表現してください。",
    "1 を選んだ場合はかなり辛口寄りでも構いませんが、最終的には前向きになれるようにまとめてください。2 の場合は、辛口と優しさが半々くらいになるようバランスをとってください。",
    "出力は必ず指定された JSON オブジェクトのみとし、余計なテキストは一切含めないでください。",
    "数値ステータスは 0〜100 の範囲で、極端すぎないようバランスよく設定してください。",
    "",
    "【unequipableItem（装備不可アイテム）について】",
    "- ここでは『概念』ではなく、ユーザーと相性の悪い具体的な人間タイプを必ず出力してください。",
    "- 例：『意識高い系インフルエンサー』『メンヘラ構ってちゃん』『自称・人たらし経営者』など、ラベルとして想像できる人物像。",
    "- reason では「なぜそのタイプと相性が悪いのか」を、毒舌寄りだが笑えるテンションでユーモアたっぷりに説明してください。",
    "",
    "【ステータス解釈について】",
    "- stats.str / vit / int / agi / luk は 0〜100 の数値のみを入れてください。",
    "- 各ステータスの『解釈・ツッコミ』は日本語で必ず flavorText の中に書き、少し毒のある見方をしてください。",
    "- 例：STR が高い＝『自己主張が強いというか、もはやワガママ領域』、INT が高い＝『頭はいいけど性格の良さとは無関係』、LUK が低い＝『恋愛ガチャの☆1率が高すぎる』など。",
    "",
    "【analysis（詳細レポート）について】",
    "- analysis.strategy / analysis.weakness / analysis.match / analysis.bestPartner の4つのセクションでは、出力フォーマットを必ず同じ Markdown リスト形式に統一してください。",
    "- ただし重要なのは、analysis.strategy / analysis.weakness / analysis.match / analysis.bestPartner のそれぞれが JSON 上では「1つの文字列（string 値）」であることです。1行ごとに別の JSON フィールドを作ったり、キー名のない値を並べたりしてはいけません。",
    "- analysis.strategy / analysis.weakness / analysis.match の3つについては、各セクションを1つの文字列の中に改行（\\n）を含める形で、次のフォーマットにしてください。",
    "- 1行目: そのセクションの内容を要約した短い導入文（1行程度）。",
    "- 2〜4行目: 箇条書き3つ（必ず3つちょうど）で、次のような形式のテキストを改行区切りで入れてください。",
    "-   - **【項目名】**: ここに具体的な解説文を書く。",
    "-   - **【項目名】**: ここに具体的な解説文を書く。",
    "-   - **【項目名】**: ここに具体的な解説文を書く。",
    "- 最後の行: 内容を一言で締める短い締めの一文（1行程度）。",
    "- 箇条書きは必ず3つだけにし、2つ以下や4つ以上にはしないでください。",
    "- analysis.strategy では、「この人生RPGをどう攻略すると楽になるか」という観点で、『行動指針』を3つの箇条書きとして出力してください。",
    "- analysis.weakness では、「このユーザーが陥りやすいデバフ・状態異常」を3つの箇条書きとして出力し、それぞれどんな状況で発動しやすいか・どんな悪影響が出るかをRPG的な比喩も交えつつ解説してください。",
    "- analysis.match では、「一緒にパーティを組むと相性の良い具体的な属性・タイプ」を3つの箇条書きとして出力し、職業イメージや性格ラベルなど、ラベルとしてイメージできる具体的な人物像と理由を書いてください。",
    "- リストの先頭に置く **【項目名】** の部分のみ太字（`**`）を使用して構いませんが、解説文の中では `**太字**` を一切使用しないでください。",
    "- 導入文と締めの一言でも太字は使わないでください。",
    "- analysis.bestPartner では、長文の段落やポエム調の文章、「例えば〜」から始まるような長い例え話の段落を書くことを禁止します。",
    "- analysis.bestPartner の出力は、必ず Markdown の箇条書きリスト「3つだけ」で構成してください。前置きの段落や締めの長文は一切書かないでください。",
    "- analysis.bestPartner では、次の形式の3行のみを出力してください（必ず3つちょうど）：",
    "-   - **【キャッチフレーズ付きの役割名】**: その相手がなぜ必要なのか、どういう場面で助けになるかの具体的な解説。",
    "-   - **【キャッチフレーズ付きの役割名】**: その相手がなぜ必要なのか、どういう場面で助けになるかの具体的な解説。",
    "-   - **【キャッチフレーズ付きの役割名】**: その相手がなぜ必要なのか、どういう場面で助けになるかの具体的な解説。",
    "- 3つの箇条書きそれぞれで、具体的なキャラクター像（職業イメージ・性格ラベル・パーティ内のロールなど）がイメージできるように書いてください。",
    "- analysis 以下の文章では、箇条書きなどの軽い Markdown 記法は使ってもよいですが、上記の太字ルールを必ず守り、リンクや画像・コードブロックは出力しないでください。",
    "",
    "【出力フォーマット（例）】",
    JSON.stringify(
      {
        className: "メンタル豆腐の狂戦士",
        level: 42,
        stats: { str: 70, vit: 30, int: 55, agi: 40, luk: 20 },
        passiveSkill: {
          name: "考えすぎコンボ",
          description: "一度気になると頭の中でシミュレーションを無限ループする。"
        },
        unequipableItem: {
          name: "意識高い系ビジネス陽キャ",
          reason: "毎日モーニングルーティンを自慢されると、あなたのHPが先にゼロになるため。"
        },
        flavorText:
          "人前では強がるが、帰宅後に一撃で瀕死になる豆腐メンタルの持ち主。STR が高めで自己主張は強いが、INT もそれなりにあるせいで『自分が面倒くさい』ことも自覚しているタイプ。LUK はやや低く、恋愛ガチャではなぜか毎回イベント限定の面倒な相手を引きがち。",
        analysis: {
          strategy:
            "この人生RPGを攻略するうえで、あなたが意識すると一気に難易度が下がるポイントを、具体的な行動レベルまで踏み込んで解説してください。",
          weakness:
            "あなたの性格上どうしても発生しやすいバグ・欠点・闇落ちパターンを、RPG的な比喩を交えて容赦なくえぐってください。",
          match:
            "どんな性格・立場・ロールの人がパーティメンバーとして最適かを、具体的な人物像や職業名を挙げながら説明してください。",
          bestPartner:
            "あなたの欠点を補い、一緒にいると人生RPGの難易度が下がる『最高の相棒』像について、Markdown の箇条書きリスト3つのみで、各行を「- **【キャッチフレーズ付きの役割名】**: その相手がなぜ必要なのか・どんな場面でどう助けになるのか」という形式で具体的に記述してください。前置きや後書きの長文は不要です。"
        }
      },
      null,
      2
    )
  ].join("\n");

  const userPrompt = [
    "以下はユーザーが今回回答した20問分のデータです。20問すべてを材料に、表面的な印象だけでなく、矛盾や裏の動機も含めて深く読み取り、上記フォーマットの JSON を生成してください。",
    "",
    qaLines
  ].join("\n");

  const result = await genAI.models.generateContent({
    // 現行 API で利用可能な高速モデル
    model: "gemini-2.5-flash",
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
    model: "gemini-2.5-flash",
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

