import type Phaser from "phaser";
import type { BattleCreature } from "@/data/creatures";
import { starterInventory, type Inventory } from "@/data/items";

/**
 * Session-lifetime player state (party + inventory), held in the Phaser game
 * registry so it survives scene transitions (StarterScene -> WorldScene ->
 * BattleScene -> back). Not yet persisted to disk - that's save/load (a
 * separate, later milestone), so this resets on a full page reload.
 */

export const MAX_PARTY_SIZE = 4;

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
