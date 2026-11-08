import type Phaser from "phaser";
import { Preferences } from "@capacitor/preferences";
import { getParty, setParty, getInventory, setInventory } from "@/systems/playerState";
import type { Direction } from "@/types";

/**
 * Preferences (not localStorage directly) so the same code path works both
 * in the Vite web build - it falls back to localStorage under the hood -
 * and in the packaged Android app, where it's backed by native
 * SharedPreferences instead of WebView storage.
 */
const SAVE_KEY = "rpgSave";
const SAVE_VERSION = 1;

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
}

export async function saveGame(game: Phaser.Game, world: WorldSaveState): Promise<void> {
  const data: SaveData = {
    version: SAVE_VERSION,
    party: getParty(game),
    inventory: getInventory(game),
    starterSpeciesId: (game.registry.get("starterSpeciesId") as number | undefined) ?? 4,
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
    if (data.version !== SAVE_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

/** Applies loaded party/inventory/starter into the registry; returns the world state to resume into. */
export function applySaveToRegistry(game: Phaser.Game, data: SaveData): WorldSaveState {
  setParty(game, data.party);
  setInventory(game, data.inventory);
  game.registry.set("starterSpeciesId", data.starterSpeciesId);
  return { zoneId: data.zoneId, tileX: data.tileX, tileY: data.tileY, direction: data.direction };
}
