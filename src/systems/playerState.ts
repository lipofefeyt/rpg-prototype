import type Phaser from "phaser";
import { refreshStats, type BattleCreature } from "@/data/creatures";
import type { EquipSlot } from "@/data/equipment";
import { starterInventory, type Inventory } from "@/data/items";

/**
 * Session-lifetime player state (party + inventory), held in the Phaser game
 * registry so it survives scene transitions (StarterScene -> WorldScene ->
 * BattleScene -> back). Not yet persisted to disk - that's save/load (a
 * separate, later milestone), so this resets on a full page reload.
 */

export const MAX_PARTY_SIZE = 4;
export const STARTING_GOLD = 60;

export function getParty(game: Phaser.Game): BattleCreature[] {
  return (game.registry.get("party") as BattleCreature[] | undefined) ?? [];
}

export function setParty(game: Phaser.Game, party: BattleCreature[]): void {
  game.registry.set("party", party);
}

export function getInventory(game: Phaser.Game): Inventory {
  let inv = game.registry.get("inventory") as Inventory | undefined;
  if (!inv) {
    inv = starterInventory();
    game.registry.set("inventory", inv);
  }
  return inv;
}

export function setInventory(game: Phaser.Game, inventory: Inventory): void {
  game.registry.set("inventory", inventory);
}

export function getGold(game: Phaser.Game): number {
  return (game.registry.get("gold") as number | undefined) ?? STARTING_GOLD;
}

export function setGold(game: Phaser.Game, gold: number): void {
  game.registry.set("gold", Math.max(0, Math.floor(gold)));
}

export function addGold(game: Phaser.Game, delta: number): number {
  const next = Math.max(0, getGold(game) + delta);
  setGold(game, next);
  return next;
}

/** Adds [count] of an item (consumable or gear) to the inventory. */
export function addToInventory(game: Phaser.Game, id: string, count = 1): void {
  const inv = getInventory(game);
  inv[id] = (inv[id] ?? 0) + count;
  setInventory(game, inv);
}

/**
 * Equips [itemId] (or unequips, when null) in [slot] of [creature]. The gear comes from
 * the shared inventory and any piece it replaces goes back into it. Returns false
 * (changing nothing) if the player doesn't own the item.
 */
export function equipItem(game: Phaser.Game, creature: BattleCreature, slot: EquipSlot, itemId: string | null): boolean {
  const inv = getInventory(game);
  if (itemId && (inv[itemId] ?? 0) <= 0) return false;

  const current = creature.equipment?.[slot];
  if (itemId) inv[itemId]--;
  if (current) inv[current] = (inv[current] ?? 0) + 1;

  const next = { ...creature.equipment };
  if (itemId) next[slot] = itemId; else delete next[slot];
  creature.equipment = next;

  refreshStats(creature);
  setInventory(game, inv);
  return true;
}
