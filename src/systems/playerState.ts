import type Phaser from "phaser";
import { refreshStats, type BattleCreature } from "@/data/creatures";
import { EQUIPMENT, canEquip, classOf, type EquipSlot } from "@/data/equipment";
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
 * (changing nothing) if the player doesn't own the item or the creature's class can't use it.
 */
export function equipItem(game: Phaser.Game, creature: BattleCreature, slot: EquipSlot, itemId: string | null): boolean {
  const inv = getInventory(game);
  if (itemId && (inv[itemId] ?? 0) <= 0) return false;
  if (itemId && !(EQUIPMENT[itemId] && EQUIPMENT[itemId].slot === slot && canEquip(classOf(creature.speciesId), EQUIPMENT[itemId]))) return false;

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

/** One-off world flags (e.g. defeated bosses), kept in the registry and saved. */
export type Flags = Record<string, boolean>;

export function getFlags(game: Phaser.Game): Flags {
  let f = game.registry.get("flags") as Flags | undefined;
  if (!f) { f = {}; game.registry.set("flags", f); }
  return f;
}

export function setFlags(game: Phaser.Game, flags: Flags): void {
  game.registry.set("flags", flags);
}

export function hasFlag(game: Phaser.Game, key: string): boolean {
  return !!getFlags(game)[key];
}

export function setFlag(game: Phaser.Game, key: string): void {
  const f = getFlags(game);
  f[key] = true;
  setFlags(game, f);
}

/** Fully restores every party member (HP, status, PP), including fainted ones. */
export function healParty(game: Phaser.Game): void {
  for (const c of getParty(game)) {
    c.currentHp = c.maxHp;
    c.status = null;
    for (const m of c.moves) m.pp = m.maxPp;
  }
}

/** True if anyone is hurt, afflicted, or low on PP (so a rest would do something). */
export function partyNeedsRest(game: Phaser.Game): boolean {
  return getParty(game).some(c => c.currentHp < c.maxHp || c.status !== null || c.moves.some(m => m.pp < m.maxPp));
}

/** Inn price: a base fee plus a little per extra party member. */
export function innCost(game: Phaser.Game): number {
  return 10 + 5 * Math.max(0, getParty(game).length - 1);
}

/** Party wipe: everyone is healed and cured, at the cost of a quarter of the gold. Returns gold lost. */
export function blackout(game: Phaser.Game): number {
  healParty(game);
  const lost = Math.floor(getGold(game) * 0.25);
  addGold(game, -lost);
  return lost;
}
