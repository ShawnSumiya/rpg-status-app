export type DiagnosisStats = {
  /** 自己主張力 */
  str: number;
  /** メンタル耐久 */
  vit: number;
  /** 悪知恵 */
  int: number;
  /** 逃げ足 */
  agi: number;
  /** 異性運 */
  luk: number;
};

export type PassiveSkill = {
  /** 無意識の癖の名前 */
  name: string;
  /** そのスキルの辛口説明 */
  description: string;
};

export type UnequipableItem = {
  /** 装備不可アイテム＝相性最悪な相手の名前 */
  name: string;
  /** なぜ呪われているのか（理由） */
  reason: string;
};

export type DiagnosisAnalysis = {
  /** 人生攻略のヒント（長文・辛口） */
  strategy: string;
  /** 致命的な弱点・デバフ（長文） */
  weakness: string;
  /** 推奨パーティメンバー・相性（具体的） */
  match: string;
  /** 最高の相棒像（欠点を補ってくれる具体的な人物像） */
  bestPartner?: string;
};

export type DiagnosisResult = {
  /** 診断結果に最も相性の良いキャラクター画像のID */
  characterId?: string;
  /** RPG風クラス名（例: メンタル豆腐の狂戦士） */
  className: string;
  /** 精神年齢を示すレベル */
  level: number;
  /** ステータス */
  stats: DiagnosisStats;
  /** 無意識の癖 */
  passiveSkill: PassiveSkill;
  /** 装備できない＝相性最悪な相手 */
  unequipableItem: UnequipableItem;
  /** 辛口かつユーモアのある解説文 */
  flavorText: string;
  /** 冒険の書としての詳細レポート */
  analysis: DiagnosisAnalysis;
};

export type DiagnosisRequest = {
  /** 質問文と回答文のペア。Gemini へのプロンプトに利用する */
  answers: {
    id: string;
    question: string;
    answer: string;
  }[];
};

