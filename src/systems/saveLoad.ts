import type Phaser from "phaser";
import { Preferences } from "@capacitor/preferences";
import { getParty, setParty, getInventory, setInventory, getGold, setGold, STARTING_GOLD } from "@/systems/playerState";
import { getQuestLog, setQuestLog, type QuestLog } from "@/systems/quests";
import type { Direction } from "@/types";

/**
 * Preferences (not localStorage directly) so the same code path works both
 * in the Vite web build - it falls back to localStorage under the hood -
 * and in the packaged Android app, where it's backed by native
 * SharedPreferences instead of WebView storage.
 */
const SAVE_KEY = "rpgSave";
const SAVE_VERSION = 2; // v2 added gold; v1 saves still load (gold defaults)

export interface WorldSaveState {
  zoneId: string;
  tileX: number;
  tileY: number;
  direction: Direction;
}

interface SaveData extends WorldSaveState {
  version: number;
  party: ReturnType<typeof getParty>;
  inventory: ReturnType<typeof getInventory>;
  starterSpeciesId: number;
  gold: number;
  quests?: QuestLog; // absent in saves from before quests existed
}

export async function saveGame(game: Phaser.Game, world: WorldSaveState): Promise<void> {
  const data: SaveData = {
    version: SAVE_VERSION,
    party: getParty(game),
    inventory: getInventory(game),
    starterSpeciesId: (game.registry.get("starterSpeciesId") as number | undefined) ?? 4,
    gold: getGold(game),
    quests: getQuestLog(game),
    ...world,
  };
  await Preferences.set({ key: SAVE_KEY, value: JSON.stringify(data) });
}

/** Fire-and-forget variant for autosave call sites that can't await. */
export function autosave(game: Phaser.Game, world: WorldSaveState): void {
  saveGame(game, world).catch(() => { /* best-effort autosave */ });
}

export async function loadGame(): Promise<SaveData | null> {
  const { value } = await Preferences.get({ key: SAVE_KEY });
  if (!value) return null;
  try {
    const data = JSON.parse(value) as SaveData;
    if (data.version !== SAVE_VERSION && data.version !== 1) return null;
    if (typeof data.gold !== "number") data.gold = STARTING_GOLD; // v1 save
    return data;
  } catch {
    return null;
  }
}

/** Applies loaded party/inventory/starter into the registry; returns the world state to resume into. */
export function applySaveToRegistry(game: Phaser.Game, data: SaveData): WorldSaveState {
  setParty(game, data.party);
  setInventory(game, data.inventory);
  setGold(game, data.gold);
  setQuestLog(game, data.quests ?? {});
  game.registry.set("starterSpeciesId", data.starterSpeciesId);
  return { zoneId: data.zoneId, tileX: data.tileX, tileY: data.tileY, direction: data.direction };
}
