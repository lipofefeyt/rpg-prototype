import type { CreatureType } from "@/types";
import { MOVES } from "@/data/moves";

export type { CreatureType };

export interface BaseStats {
  hp: number; atk: number; def: number;
  spAtk: number; spDef: number; speed: number;
}

export interface CreatureSpecies {
  id: number;
  name: string;
  types: CreatureType[];
  baseStats: BaseStats;
  catchRate: number;
  baseExp: number;
  learnset: [number, string][]; // [minLevel, moveId]
}

export interface BattleMoveSlot {
  moveId: string;
  pp: number;
  maxPp: number;
}

export type StatusCondition = "burn" | "paralysis" | "poison" | "sleep" | "freeze";

export interface BattleCreature {
  speciesId: number;
  name: string;
  level: number;
  types: CreatureType[];
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  spAtk: number;
  spDef: number;
  speed: number;
  moves: BattleMoveSlot[];
  status: StatusCondition | null;
  catchRate: number;
  exp: number;
}

// ── Species database ──────────────────────────────────────────────────────────

export const SPECIES: Record<number, CreatureSpecies> = {
  1: {
    id: 1, name: "Budleaf", types: ["grass", "poison"],
    baseStats: { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, speed: 45 },
    catchRate: 45, baseExp: 64,
    learnset: [[1,"tackle"],[1,"growl"],[7,"vine_whip"],[13,"poison_powder"],[22,"razor_leaf"]],
  },
  4: {
    id: 4, name: "Cindertail", types: ["fire"],
    baseStats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, speed: 65 },
    catchRate: 45, baseExp: 62,
    learnset: [[1,"scratch"],[1,"growl"],[7,"ember"],[10,"metal_claw"],[17,"flamethrower"]],
  },
  7: {
    id: 7, name: "Aquashell", types: ["water"],
    baseStats: { hp: 44, atk: 48, def: 65, spAtk: 50, spDef: 64, speed: 43 },
    catchRate: 45, baseExp: 63,
    learnset: [[1,"tackle"],[1,"tail_whip"],[7,"water_gun"],[10,"bite"],[19,"bubble"],[28,"surf"]],
  },
  16: {
    id: 16, name: "Flitterwing", types: ["normal", "flying"],
    baseStats: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, speed: 56 },
    catchRate: 255, baseExp: 50,
    learnset: [[1,"tackle"],[1,"sand_attack"],[9,"gust"],[12,"quick_attack"],[19,"wing_attack"]],
  },
  19: {
    id: 19, name: "Nibblerat", types: ["normal"],
    baseStats: { hp: 30, atk: 56, def: 35, spAtk: 25, spDef: 35, speed: 72 },
    catchRate: 255, baseExp: 51,
    learnset: [[1,"tackle"],[1,"tail_whip"],[7,"quick_attack"],[13,"hyper_fang"],[20,"body_slam"]],
  },
  25: {
    id: 25, name: "Sparkit", types: ["electric"],
    baseStats: { hp: 35, atk: 55, def: 30, spAtk: 50, spDef: 40, speed: 90 },
    catchRate: 190, baseExp: 105,
    learnset: [[1,"thunder_shock"],[1,"growl"],[9,"tail_whip"],[13,"thunder_wave"],[21,"thunderbolt"]],
  },
  41: {
    id: 41, name: "Murkwing", types: ["poison", "flying"],
    baseStats: { hp: 40, atk: 45, def: 35, spAtk: 30, spDef: 40, speed: 55 },
    catchRate: 255, baseExp: 49,
    learnset: [[1,"scratch"],[1,"supersonic"],[9,"bite"],[12,"wing_attack"],[19,"mean_look"]],
  },
  54: {
    id: 54, name: "Quackle", types: ["water"],
    baseStats: { hp: 50, atk: 52, def: 48, spAtk: 65, spDef: 50, speed: 55 },
    catchRate: 190, baseExp: 64,
    learnset: [[1,"scratch"],[1,"tail_whip"],[10,"water_gun"],[13,"confusion"],[22,"surf"]],
  },
  63: {
    id: 63, name: "Mindling", types: ["psychic"],
    baseStats: { hp: 25, atk: 20, def: 15, spAtk: 105, spDef: 55, speed: 90 },
    catchRate: 200, baseExp: 73,
    learnset: [[1,"teleport"],[16,"confusion"]],
  },
  74: {
    id: 74, name: "Rockling", types: ["rock", "ground"],
    baseStats: { hp: 40, atk: 80, def: 100, spAtk: 30, spDef: 30, speed: 20 },
    catchRate: 255, baseExp: 60,
    learnset: [[1,"tackle"],[1,"defense_curl"],[11,"rock_throw"],[16,"magnitude"],[21,"rock_slide"]],
  },
  92: {
    id: 92, name: "Gloomist", types: ["ghost", "poison"],
    baseStats: { hp: 30, atk: 35, def: 30, spAtk: 100, spDef: 35, speed: 80 },
    catchRate: 190, baseExp: 62,
    learnset: [[1,"lick"],[1,"hypnosis"],[8,"spite"],[12,"mean_look"],[18,"shadow_ball"]],
  },
  129: {
    id: 129, name: "Finflop", types: ["water"],
    baseStats: { hp: 20, atk: 10, def: 55, spAtk: 15, spDef: 20, speed: 80 },
    catchRate: 255, baseExp: 20,
    learnset: [[1,"splash"],[15,"tackle"]],
  },
};

// ── Stat / experience formulas ────────────────────────────────────────────────
// Module-level (not nested in makeBattleCreature) so gainExp() can reuse them
// when recomputing stats on a level-up.

function hpForLevel(base: number, level: number): number {
  return Math.floor((2 * base + 15) * level / 100) + level + 10;
}

function statForLevel(base: number, level: number): number {
  return Math.floor((2 * base + 15) * level / 100) + 5;
}

/** "Medium Fast" cubic growth curve - total exp needed to reach [level]. */
export function expForLevel(level: number): number {
  return level ** 3;
}

// ── Battle creature factory ───────────────────────────────────────────────────

export function makeBattleCreature(speciesId: number, level: number): BattleCreature {
  const sp = SPECIES[speciesId];
  if (!sp) throw new Error(`Unknown species id: ${speciesId}`);

  const maxHp = hpForLevel(sp.baseStats.hp, level);

  // Last 4 moves the creature would know at this level
  const moveIds = sp.learnset
    .filter(([lv]) => lv <= Math.max(level, 1))
    .slice(-4)
    .map(([, id]) => id);
  if (!moveIds.length) moveIds.push("tackle");

  const moves: BattleMoveSlot[] = moveIds.map(id => ({
    moveId: id,
    pp: MOVES[id]?.pp ?? 10,
    maxPp: MOVES[id]?.pp ?? 10,
  }));

  return {
    speciesId,
    name: sp.name,
    level,
    types: sp.types,
    maxHp,
    currentHp: maxHp,
    atk:   statForLevel(sp.baseStats.atk, level),
    def:   statForLevel(sp.baseStats.def, level),
    spAtk: statForLevel(sp.baseStats.spAtk, level),
    spDef: statForLevel(sp.baseStats.spDef, level),
    speed: statForLevel(sp.baseStats.speed, level),
    moves,
    status: null,
    catchRate: sp.catchRate,
    exp: expForLevel(level),
  };
}

/**
 * Adds [amount] exp to [creature], applying any level-ups (recomputing stats,
 * growing current HP by the same amount max HP grew, and learning any new
 * moves the learnset unlocks, up to the existing 4-move-slot cap). Returns the
 * sequence of messages to show, in order ("grew to Lv.X!", "learned Y!", ...).
 */
export function gainExp(creature: BattleCreature, amount: number): string[] {
  const messages: string[] = [];
  creature.exp += amount;
  const sp = SPECIES[creature.speciesId];

  while (creature.level < 100 && creature.exp >= expForLevel(creature.level + 1)) {
    const oldMaxHp = creature.maxHp;
    creature.level++;
    creature.maxHp = hpForLevel(sp.baseStats.hp, creature.level);
    creature.currentHp += creature.maxHp - oldMaxHp;
    creature.atk   = statForLevel(sp.baseStats.atk, creature.level);
    creature.def   = statForLevel(sp.baseStats.def, creature.level);
    creature.spAtk = statForLevel(sp.baseStats.spAtk, creature.level);
    creature.spDef = statForLevel(sp.baseStats.spDef, creature.level);
    creature.speed = statForLevel(sp.baseStats.speed, creature.level);
    messages.push(`${creature.name} grew to Lv.${creature.level}!`);

    for (const [learnLevel, moveId] of sp.learnset) {
      const alreadyKnown = creature.moves.some(m => m.moveId === moveId);
      if (learnLevel === creature.level && !alreadyKnown && creature.moves.length < 4) {
        const mv = MOVES[moveId];
        creature.moves.push({ moveId, pp: mv?.pp ?? 10, maxPp: mv?.pp ?? 10 });
        messages.push(`${creature.name} learned ${mv?.name ?? moveId}!`);
      }
    }
  }

  return messages;
}
