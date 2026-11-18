import type Phaser from "phaser";
import { QUESTS, targetCount, type QuestDef } from "@/data/quests";
import { EQUIPMENT } from "@/data/equipment";
import { ITEMS } from "@/data/items";
import { addGold, addToInventory } from "@/systems/playerState";

/** Quest progress, held in the game registry (and saved with the game). */
export type QuestStatus = "active" | "ready" | "done";
export interface QuestState { status: QuestStatus; progress: number }
export type QuestLog = Record<string, QuestState>;

export function getQuestLog(game: Phaser.Game): QuestLog {
  let log = game.registry.get("quests") as QuestLog | undefined;
  if (!log) { log = {}; game.registry.set("quests", log); }
  return log;
}

export function setQuestLog(game: Phaser.Game, log: QuestLog): void {
  game.registry.set("quests", log);
}

export function isAvailable(game: Phaser.Game, q: QuestDef): boolean {
  const log = getQuestLog(game);
  if (log[q.id]) return false;
  return !q.requires || log[q.requires]?.status === "done";
}

export function progressText(game: Phaser.Game, q: QuestDef): string {
  const st = getQuestLog(game)[q.id];
  if (q.objective.kind === "visit") return st?.status === "active" ? "Not yet visited" : "Visited";
  return `${q.objective.label}: ${Math.min(st?.progress ?? 0, targetCount(q))}/${targetCount(q)}`;
}

export function rewardText(q: QuestDef): string {
  const parts = [`${q.reward.gold} gold`];
  for (const [id, n] of Object.entries(q.reward.items ?? {})) {
    parts.push(`${n > 1 ? `${n}x ` : ""}${EQUIPMENT[id]?.name ?? ITEMS[id]?.name ?? id}`);
  }
  return parts.join(", ");
}

export function acceptQuest(game: Phaser.Game, id: string): void {
  const log = getQuestLog(game);
  if (!log[id]) log[id] = { status: "active", progress: 0 };
  setQuestLog(game, log);
}

/** Pays out a ready quest and marks it done. Returns the summary line to show. */
export function turnInQuest(game: Phaser.Game, id: string): string {
  const q = QUESTS[id];
  const log = getQuestLog(game);
  if (!q || log[id]?.status !== "ready") return "";
  log[id].status = "done";
  setQuestLog(game, log);
  addGold(game, q.reward.gold);
  for (const [item, n] of Object.entries(q.reward.items ?? {})) addToInventory(game, item, n);
  return `Quest complete: ${q.title}\nReceived ${rewardText(q)}.`;
}

/** What an NPC with these quest ids has to say right now (ready > active > offer). */
export function pickNpcQuest(game: Phaser.Game, questIds: string[] | undefined):
  { kind: "ready" | "active" | "offer"; def: QuestDef } | null {
  if (!questIds?.length) return null;
  const log = getQuestLog(game);
  const defs = questIds.map(id => QUESTS[id]).filter(Boolean);
  const ready = defs.find(q => log[q.id]?.status === "ready");
  if (ready) return { kind: "ready", def: ready };
  const active = defs.find(q => log[q.id]?.status === "active");
  if (active) return { kind: "active", def: active };
  const offer = defs.find(q => isAvailable(game, q));
  return offer ? { kind: "offer", def: offer } : null;
}

/** Marker shown over a giver: "!" new quest, "?" ready to turn in. */
export function markerFor(game: Phaser.Game, questIds: string[] | undefined): "!" | "?" | null {
  const pick = pickNpcQuest(game, questIds);
  if (!pick) return null;
  return pick.kind === "ready" ? "?" : pick.kind === "offer" ? "!" : null;
}

// ── Progress hooks ──────────────────────────────────────────────────────────

/** Bumps matching active quests; returns player-facing messages. */
function bump(game: Phaser.Game, match: (q: QuestDef) => boolean): string[] {
  const log = getQuestLog(game);
  const msgs: string[] = [];
  for (const q of Object.values(QUESTS)) {
    const st = log[q.id];
    if (st?.status !== "active" || !match(q)) continue;
    st.progress++;
    if (st.progress >= targetCount(q)) {
      st.status = "ready";
      msgs.push(`Quest ready: ${q.title}!\nReturn to ${q.giverName}.`);
    } else {
      msgs.push(`Quest: ${q.title} (${st.progress}/${targetCount(q)})`);
    }
  }
  setQuestLog(game, log);
  return msgs;
}

export function recordDefeat(game: Phaser.Game, speciesId: number): string[] {
  return bump(game, q => q.objective.kind === "defeat" && q.objective.speciesId === speciesId);
}

export function recordTame(game: Phaser.Game, speciesId: number): string[] {
  return bump(game, q => q.objective.kind === "tame" && (q.objective.speciesId === undefined || q.objective.speciesId === speciesId));
}

export function recordBoss(game: Phaser.Game, bossId: string): string[] {
  return bump(game, q => q.objective.kind === "boss" && q.objective.bossId === bossId);
}

export function recordVisit(game: Phaser.Game, zoneId: string): string[] {
  return bump(game, q => q.objective.kind === "visit" && q.objective.zoneId === zoneId);
}
