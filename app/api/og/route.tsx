import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import { CHARACTER_IMAGES } from "@/lib/characters";
import { AI_CONFIG } from "@/config/site.config";

export const runtime = "edge";

const VALID_CHARACTER_IDS = new Set(CHARACTER_IMAGES.map((c) => c.id));

/**
 * OGP用画像生成エンドポイント
 * クエリパラメータ（className, level, stats, passiveName, unequipableName, characterId）を受け取り、
 * 1200×630px のRPG風ステータスカード画像を返す。
 * SNSシェア時のプレビュー画像として使用される。
 * @see lib/characters.ts - キャラクター画像の追加・変更は characters を編集。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const className = searchParams.get("className") ?? "？？？";
  const level = searchParams.get("level") ?? "1";
  const rawCharacterId = searchParams.get("characterId");
  const characterId =
    rawCharacterId && VALID_CHARACTER_IDS.has(rawCharacterId)
      ? rawCharacterId
      : "hero";

  const stats = {
    str: searchParams.get("str") ?? "-",
    vit: searchParams.get("vit") ?? "-",
    int: searchParams.get("int") ?? "-",
    agi: searchParams.get("agi") ?? "-",
    luk: searchParams.get("luk") ?? "-"
  };

  const passiveName = searchParams.get("passiveName") ?? "？？？";
  const unequipableName = searchParams.get("unequipableName") ?? "？？？";

  const baseUrl = new URL(req.url).origin;
  const charImageUrl = `${baseUrl}/images/chars/${characterId}.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "radial-gradient(circle at top left, #6d28d9 0, #020617 40%), radial-gradient(circle at bottom right, #f59e0b 0, #020617 45%)",
          color: "#e5e7eb",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div
          style={{
            borderRadius: "24px",
            border: "2px solid rgba(251, 191, 36, 0.7)",
            boxShadow: "0 0 40px rgba(147, 51, 234, 0.7)",
            width: "1000px",
            padding: "32px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(209,213,219,0.8)",
                  display: "flex"
                }}
              >
                RPG PERSONALITY CARD
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: "#facc15",
                  maxWidth: 720,
                  display: "flex",
                  flexWrap: "wrap"
                }}
              >
                {className}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 16,
                  color: "rgba(209,213,219,0.85)",
                  display: "flex",
                  flexWrap: "wrap"
                }}
              >
                あなたの性格をもとに生成された、RPG風ステータスカード。
              </div>
            </div>
            <div
              style={{
                borderRadius: 999,
                border: "1px solid rgba(251, 191, 36, 0.7)",
                padding: "6px 14px",
                fontSize: 14,
                fontWeight: 600,
                color: "#fef3c7",
                background:
                  "radial-gradient(circle at 0 0, rgba(251,191,36,0.8), transparent 60%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              LV. {level}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 20,
              alignItems: "flex-end"
            }}
          >
          <div
            style={{
              borderRadius: 16,
              border: "1px solid rgba(88,28,135,0.8)",
              padding: "16px 18px",
              background:
                "radial-gradient(circle at top, rgba(76,29,149,0.55), transparent 55%)",
              display: "flex",
              flexDirection: "column",
              gap: 6
            }}
          >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  color: "rgba(196,181,253,0.95)",
                  marginBottom: 10,
                  display: "flex"
                }}
              >
                STATUS
              </div>
              {[
                [AI_CONFIG.statusLabels.str, stats.str],
                [AI_CONFIG.statusLabels.vit, stats.vit],
                [AI_CONFIG.statusLabels.int, stats.int],
                [AI_CONFIG.statusLabels.agi, stats.agi],
                [AI_CONFIG.statusLabels.luk, stats.luk]
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 140,
                      fontSize: 13,
                      color: "rgba(209,213,219,0.95)"
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: "rgba(15,23,42,1)",
                      overflow: "hidden",
                      boxShadow: "inset 0 0 8px rgba(15,23,42,1)"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width:
                          typeof value === "string"
                            ? `${Math.min(100, Number(value) || 0)}%`
                            : `${value}%`,
                        height: "100%",
                        borderRadius: 999,
                        background:
                          "linear-gradient(90deg, #facc15, #fb923c, #a855f7)",
                        boxShadow: "0 0 12px rgba(250,204,21,0.8)"
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: 36,
                      textAlign: "right",
                      fontSize: 12,
                      color: "#fbbf24",
                      fontVariantNumeric: "tabular-nums"
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(55,65,81,0.9)",
                  padding: "12px 14px",
                  background:
                    "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(17,24,39,0.9))",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    color: "rgba(156,163,175,0.95)",
                    marginBottom: 4
                  }}
                >
                  PASSIVE
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "rgba(233,213,255,1)"
                  }}
                >
                  {passiveName}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(185,28,28,0.9)",
                  padding: "12px 14px",
                  background:
                    "radial-gradient(circle at top left, rgba(127,29,29,0.85), rgba(15,23,42,0.95))",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    color: "rgba(254,202,202,0.95)",
                    marginBottom: 4
                  }}
                >
                  CURSED / 装備不可
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#fee2e2"
                  }}
                >
                  {unequipableName}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "flex-end",
                justifyContent: "flex-end",
                minWidth: 200
              }}
            >
              <img
                src={charImageUrl}
                alt=""
                width={180}
                height={240}
                style={{
                  objectFit: "contain",
                  imageRendering: "pixelated",
                  filter: "drop-shadow(0 0 20px rgba(147, 51, 234, 0.6)) drop-shadow(0 0 30px rgba(250, 204, 21, 0.3))"
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "rgba(148,163,184,0.9)",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <span>Generated by Gemini × RPG Personality Status App</span>
            <span>rpg-status.app</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}

