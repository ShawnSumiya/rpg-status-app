"use client";

import type { ReactNode } from "react";
import type { DiagnosisResult } from "@/lib/types";
import { CHARACTER_IMAGES } from "@/lib/characters";
import { AI_CONFIG, SITE_CONFIG } from "@/config/site.config";
import {
  ShieldHalf,
  Swords,
  Brain,
  Zap,
  Clover,
  ScrollText,
  Skull,
  DownloadCloud,
  Handshake
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type StatusCardProps = {
  result: DiagnosisResult;
};

const VALID_CHARACTER_IDS = new Set(CHARACTER_IMAGES.map((c) => c.id));

/**
 * 診断結果をRPGキャラカード形式で表示するコンポーネント
 * ステータス、スキル、呪いアイテム、冒険の書（詳細レポート）を表示し、
 * X（Twitter）シェア・OG画像生成リンクを提供する。
 * @param result - 診断APIから返却された診断結果
 */
export function StatusCard({ result }: StatusCardProps) {
  const {
    characterId,
    className,
    level,
    stats,
    passiveSkill,
    unequipableItem,
    flavorText,
    analysis
  } = result;

  const safeCharacterId =
    characterId && VALID_CHARACTER_IDS.has(characterId) ? characterId : "hero";

  /** 冒険の書セクション用の Markdown カスタムコンポーネント（スタイル適用） */
  const adventureMarkdownComponents = {
    p: ({ children }: { children?: ReactNode }) => (
      <p className="mb-4 leading-loose text-gray-200">{children}</p>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-4 list-disc list-inside space-y-2 pl-4 leading-loose text-gray-200">
        {children}
      </ul>
    ),
    li: ({ children }: { children?: ReactNode }) => (
      <li className="my-1">{children}</li>
    ),
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="text-yellow-400 font-semibold">{children}</strong>
    )
  };

  const ogUrl = new URLSearchParams({
    className,
    level: String(level),
    str: String(stats.str),
    vit: String(stats.vit),
    int: String(stats.int),
    agi: String(stats.agi),
    luk: String(stats.luk),
    passiveName: passiveSkill.name,
    unequipableName: unequipableItem.name,
    characterId: safeCharacterId
  }).toString();

  const twitterMention =
    SITE_CONFIG.twitterAccount && SITE_CONFIG.twitterAccount.trim()
      ? ` ${SITE_CONFIG.twitterAccount}`
      : "";
  const shareText = `私のRPG性格タイプは...【${className}】\nLv.${level} / 武器: ${passiveSkill.name} / 弱点: ${unequipableItem.name}\n\n${SITE_CONFIG.shareHashtag}${twitterMention}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}?${new URLSearchParams({
          level: level.toString(),
          str: stats.str.toString(),
          vit: stats.vit.toString(),
          int: stats.int.toString(),
          agi: stats.agi.toString(),
          luk: stats.luk.toString(),
          title: className,
          className,
          passiveName: passiveSkill.name,
          unequipableName: unequipableItem.name,
          characterId: safeCharacterId
        }).toString()}`
      : "";
  const xShareLink =
    shareUrl &&
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <section className="rpg-panel w-full max-w-3xl mx-auto p-6 md:p-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="rpg-label">RESULT / CHARACTER CARD</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl rpg-gradient-text">
              {className}
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full border border-amber-400/60 bg-black/60 px-3 py-0.5 text-[11px] tracking-wide text-amber-200 whitespace-nowrap">
              LV.&nbsp;{level}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-300/80 max-w-xl">
            あなたの性格をもとに生成された、
            <span className="text-amber-300"> 一人分のRPGステータス</span>
            です。
            <br className="hidden md:inline" />
            パーティに加入させるかどうかは、あなた次第。
          </p>
        </div>
        <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/60 bg-black/40 shadow-rpg-glow">
          <ShieldHalf className="h-6 w-6 text-purple-200" />
        </div>
      </header>

      {/* 2カラム構成：左＝キャラ＋ステータス＋スキル／右＝呪い＋説明文 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* 左カラム */}
        <div className="flex flex-col gap-6">
          {/* キャラクター画像 */}
          <div
            className="flex justify-center"
            style={{
              filter:
                "drop-shadow(0 0 24px rgba(147, 51, 234, 0.6)) drop-shadow(0 0 48px rgba(250, 204, 21, 0.25))"
            }}
          >
            <img
              src={`/images/chars/${safeCharacterId}.png`}
              alt={className}
              className="h-64 w-auto object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          {/* BASIC STATUS */}
          <div className="rounded-lg border border-border/80 bg-black/40 p-4">
            <p className="rpg-label mb-3">BASIC STATUS</p>
            <dl className="grid grid-cols-2 gap-3 text-xs md:text-sm">
              <StatusRow
                icon={Swords}
                label={AI_CONFIG.statusLabels.str}
                value={stats.str}
              />
              <StatusRow
                icon={ShieldHalf}
                label={AI_CONFIG.statusLabels.vit}
                value={stats.vit}
              />
              <StatusRow
                icon={Brain}
                label={AI_CONFIG.statusLabels.int}
                value={stats.int}
              />
              <StatusRow
                icon={Zap}
                label={AI_CONFIG.statusLabels.agi}
                value={stats.agi}
              />
              <StatusRow
                icon={Clover}
                label={AI_CONFIG.statusLabels.luk}
                value={stats.luk}
              />
            </dl>
          </div>
          {/* PASSIVE SKILL */}
          <div className="rounded-lg border border-purple-600/70 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-950/80 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-purple-200" />
              <p className="rpg-label">PASSIVE SKILL</p>
            </div>
            <p className="text-sm font-semibold text-purple-100">
              {passiveSkill.name}
            </p>
            <div className="text-xs md:text-sm leading-relaxed md:leading-loose text-slate-100/95 space-y-1.5">
              <ReactMarkdown>{passiveSkill.description}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* 右カラム */}
        <div className="flex flex-col gap-6">
          {/* CURSED / 装備不可アイテム */}
          <div className="rounded-lg border border-red-700/70 bg-gradient-to-br from-red-950/80 via-black/80 to-slate-950/80 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skull className="h-4 w-4 text-red-200" />
              <p className="rpg-label">CURSED / 装備不可アイテム</p>
            </div>
            <p className="text-sm font-semibold text-red-100">
              {unequipableItem.name}
            </p>
            <div className="text-xs md:text-sm leading-relaxed md:leading-loose text-red-100/95 space-y-1.5">
              <ReactMarkdown>{unequipableItem.reason}</ReactMarkdown>
            </div>
          </div>
          {/* FLAVOR TEXT */}
          <div className="rounded-lg border border-border/70 bg-black/50 p-4 space-y-2">
            <p className="rpg-label flex items-center gap-2">
              <ScrollText className="h-3 w-3" />
              FLAVOR TEXT
            </p>
            <div className="text-xs md:text-sm leading-relaxed md:leading-loose text-slate-100/95 space-y-1.5">
              <ReactMarkdown>{flavorText}</ReactMarkdown>
            </div>
          </div>
          {/* シェア・画像保存ボタン */}
          <div className="flex flex-col gap-3">
            <a
              href={xShareLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={
                  !xShareLink
                  ? (e) => {
                      e.preventDefault();
                      if (typeof window !== "undefined") {
                        const s = `私のRPG性格タイプは...【${className}】\nLv.${level} / 武器: ${passiveSkill.name} / 弱点: ${unequipableItem.name}\n\n${SITE_CONFIG.shareHashtag}${twitterMention}`;
                        const u = `${window.location.origin}?${new URLSearchParams({
                          level: level.toString(),
                          str: stats.str.toString(),
                          vit: stats.vit.toString(),
                          int: stats.int.toString(),
                          agi: stats.agi.toString(),
                          luk: stats.luk.toString(),
                          title: className,
                          className,
                          passiveName: passiveSkill.name,
                          unequipableName: unequipableItem.name,
                          characterId: safeCharacterId
                        }).toString()}`;
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(s)}&url=${encodeURIComponent(u)}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }
                    }
                  : undefined
              }
              className="flex items-center justify-center gap-2 w-full bg-black hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg border border-gray-700 transition-all duration-300"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>結果をXでポストする</span>
            </a>
            <Link
              href={`/api/og?${ogUrl}`}
              target="_blank"
              className="rpg-button-ghost justify-center text-[11px] md:text-xs"
            >
              <DownloadCloud className="h-4 w-4" />
              このステータス画面を画像として開く（右クリックで保存）
            </Link>
            <p className="text-[10px] text-slate-500">
              ※ 画像はブラウザで開いたあと、右クリックや長押しで保存・SNSシェアが可能です。
            </p>
          </div>
        </div>
      </div>

      {/* 冒険の書（詳細レポート） */}
      <div className="mt-2 rounded-lg border border-amber-700/70 bg-[#1b1308] bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.16),_transparent_55%),repeating-linear-gradient(0deg,rgba(148,119,63,0.22),rgba(148,119,63,0.22)_1px,transparent_1px,transparent_3px)] px-4 py-4 md:px-6 md:py-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-amber-200" />
          <p className="rpg-label">ADVENTURER&apos;S LOG / 冒険の書（詳細レポート）</p>
        </div>
        <div className="flex flex-col space-y-6 text-xs md:text-sm text-gray-200">
          {/* STRATEGY */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-3 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/5">
              <Swords className="h-5 w-5 text-amber-200" />
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                STRATEGY
              </p>
            </div>
            <div>
              <ReactMarkdown components={adventureMarkdownComponents}>
                {analysis.strategy}
              </ReactMarkdown>
            </div>
          </div>

          {/* WEAKNESS */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-3 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/5">
              <Skull className="h-5 w-5 text-red-200" />
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
                WEAKNESS / DEBUFF
              </p>
            </div>
            <div>
              <ReactMarkdown components={adventureMarkdownComponents}>
                {analysis.weakness}
              </ReactMarkdown>
            </div>
          </div>

          {/* BEST PARTNER */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-3 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/5">
              <Handshake className="h-5 w-5 text-emerald-200" />
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                BEST PARTNER
              </p>
            </div>
            <div>
              <ReactMarkdown components={adventureMarkdownComponents}>
                {analysis.bestPartner ?? analysis.match}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type StatusRowProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
};

/**
 * ステータス1行を表示する内部コンポーネント（STR/VIT/INT/AGI/LUK）
 * 0〜100の値をプログレスバーと数値で表示する。
 */
function StatusRow({ icon: Icon, label, value }: StatusRowProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const percent = `${clamped}%`;

  return (
    <div className="space-y-1.5">
      <dt className="flex items-center gap-1.5 text-[11px] text-slate-300">
        <Icon className="h-3.5 w-3.5 text-amber-200" />
        <span>{label}</span>
      </dt>
      <dd className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-purple-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]"
            style={{ width: percent }}
          />
        </div>
        <span className="w-10 text-right text-[11px] tabular-nums text-amber-200">
          {clamped}
        </span>
      </dd>
    </div>
  );
}

