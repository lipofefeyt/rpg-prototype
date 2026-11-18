import type { CreatureType } from "@/types";
import { MOVES } from "@/data/moves";
import type { BossDef } from "@/data/bosses";
import { totalBonus, type EquipLoadout } from "@/data/equipment";

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
  /** Equipped gear by slot (absent on creatures from older saves = nothing equipped). */
  equipment?: EquipLoadout;
}

// ── Species database ──────────────────────────────────────────────────────────

export const SPECIES: Record<number, CreatureSpecies> = {
  1: {
    id: 1, name: "Ranger", types: ["grass", "poison"],
    baseStats: { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, speed: 45 },
    catchRate: 45, baseExp: 64,
    learnset: [[1,"tackle"],[1,"growl"],[7,"vine_whip"],[13,"poison_powder"],[22,"razor_leaf"]],
  },
  4: {
    id: 4, name: "Mage", types: ["fire"],
    baseStats: { hp: 39, atk: 52, def: 48, spAtk: 60, spDef: 50, speed: 65 },
    catchRate: 45, baseExp: 62,
    learnset: [[1,"scratch"],[1,"growl"],[3,"ember"],[9,"scorch"],[17,"flamethrower"]],
  },
  7: {
    id: 7, name: "Knight", types: ["steel"],
    baseStats: { hp: 44, atk: 48, def: 65, spAtk: 50, spDef: 64, speed: 43 },
    catchRate: 45, baseExp: 63,
    learnset: [[1,"tackle"],[1,"tail_whip"],[7,"metal_claw"],[10,"bite"],[19,"body_slam"],[28,"smite"]],
  },
  16: {
    id: 16, name: "Carrion Crow", types: ["normal", "flying"],
    baseStats: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, speed: 56 },
    catchRate: 255, baseExp: 50,
    learnset: [[1,"tackle"],[1,"sand_attack"],[9,"gust"],[12,"quick_attack"],[19,"wing_attack"]],
  },
  19: {
    id: 19, name: "Giant Rat", types: ["normal"],
    baseStats: { hp: 30, atk: 56, def: 35, spAtk: 25, spDef: 35, speed: 72 },
    catchRate: 255, baseExp: 51,
    learnset: [[1,"tackle"],[1,"tail_whip"],[7,"quick_attack"],[13,"hyper_fang"],[20,"body_slam"]],
  },
  25: {
    id: 25, name: "Spark Imp", types: ["electric"],
    baseStats: { hp: 35, atk: 55, def: 30, spAtk: 50, spDef: 40, speed: 90 },
    catchRate: 190, baseExp: 105,
    learnset: [[1,"thunder_shock"],[1,"growl"],[9,"tail_whip"],[13,"thunder_wave"],[21,"thunderbolt"]],
  },
  41: {
    id: 41, name: "Cave Bat", types: ["poison", "flying"],
    baseStats: { hp: 40, atk: 45, def: 35, spAtk: 30, spDef: 40, speed: 55 },
    catchRate: 255, baseExp: 49,
    learnset: [[1,"scratch"],[1,"supersonic"],[9,"bite"],[12,"wing_attack"],[19,"mean_look"]],
  },
  54: {
    id: 54, name: "Marsh Duck", types: ["water"],
    baseStats: { hp: 50, atk: 52, def: 48, spAtk: 65, spDef: 50, speed: 55 },
    catchRate: 190, baseExp: 64,
    learnset: [[1,"scratch"],[1,"tail_whip"],[10,"water_gun"],[13,"confusion"],[22,"surf"]],
  },
  63: {
    id: 63, name: "Hedge Sprite", types: ["psychic"],
    baseStats: { hp: 25, atk: 20, def: 15, spAtk: 105, spDef: 55, speed: 90 },
    catchRate: 200, baseExp: 73,
    learnset: [[1,"teleport"],[16,"confusion"]],
  },
  74: {
    id: 74, name: "Stone Golem", types: ["rock", "ground"],
    baseStats: { hp: 40, atk: 80, def: 100, spAtk: 30, spDef: 30, speed: 20 },
    catchRate: 255, baseExp: 60,
    learnset: [[1,"tackle"],[1,"defense_curl"],[11,"rock_throw"],[16,"magnitude"],[21,"rock_slide"]],
  },
  92: {
    id: 92, name: "Wraith", types: ["ghost", "poison"],
    baseStats: { hp: 30, atk: 35, def: 30, spAtk: 100, spDef: 35, speed: 80 },
    catchRate: 190, baseExp: 62,
    learnset: [[1,"lick"],[1,"hypnosis"],[8,"spite"],[12,"mean_look"],[18,"shadow_ball"]],
  },
  200: {
    id: 200, name: "Cavern Warden", types: ["dark"],
    baseStats: { hp: 70, atk: 90, def: 70, spAtk: 60, spDef: 60, speed: 40 },
    catchRate: 0, baseExp: 150,
    learnset: [[1,"rock_throw"],[1,"growl"],[5,"bite"],[8,"magnitude"],[10,"rock_slide"]],
  },
  129: {
    id: 129, name: "River Carp", types: ["water"],
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

// ── Stats (level + equipment) ────────────────────────────────────────────────

export interface ComputedStats {
  maxHp: number; atk: number; def: number; spAtk: number; spDef: number; speed: number;
}

/** Level-based stats plus any flat bonuses from equipped gear. */
export function computeStats(speciesId: number, level: number, equipment?: EquipLoadout): ComputedStats {
  const sp = SPECIES[speciesId];
  const bonus = totalBonus(equipment);
  return {
    maxHp: hpForLevel(sp.baseStats.hp, level) + (bonus.hp ?? 0),
    atk:   statForLevel(sp.baseStats.atk, level)   + (bonus.atk ?? 0),
    def:   statForLevel(sp.baseStats.def, level)   + (bonus.def ?? 0),
    spAtk: statForLevel(sp.baseStats.spAtk, level) + (bonus.spAtk ?? 0),
    spDef: statForLevel(sp.baseStats.spDef, level) + (bonus.spDef ?? 0),
    speed: statForLevel(sp.baseStats.speed, level) + (bonus.speed ?? 0),
  };
}

/**
 * Recomputes a creature's stats from its level + equipment. Current HP moves by the
 * same amount max HP changed (so equipping +HP gear heals that much and removing it
 * can't leave HP above max), never dropping a living creature below 1.
 */
export function refreshStats(c: BattleCreature): void {
  const s = computeStats(c.speciesId, c.level, c.equipment);
  const dHp = s.maxHp - c.maxHp;
  c.maxHp = s.maxHp;
  c.atk = s.atk; c.def = s.def; c.spAtk = s.spAtk; c.spDef = s.spDef; c.speed = s.speed;
  c.currentHp = c.currentHp <= 0 ? 0 : Math.min(c.maxHp, Math.max(1, c.currentHp + dHp));
}

// ── Battle creature factory ───────────────────────────────────────────────────

export function makeBattleCreature(speciesId: number, level: number): BattleCreature {
  const sp = SPECIES[speciesId];
  if (!sp) throw new Error(`Unknown species id: ${speciesId}`);

  const stats = computeStats(speciesId, level);

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
    maxHp: stats.maxHp,
    currentHp: stats.maxHp,
    atk: stats.atk,
    def: stats.def,
    spAtk: stats.spAtk,
    spDef: stats.spDef,
    speed: stats.speed,
    moves,
    status: null,
    catchRate: sp.catchRate,
    exp: expForLevel(level),
    equipment: {},
  };
}

/** A boss-strength creature: the species scaled by the boss's HP / attack multipliers. Can't be tamed. */
export function makeBoss(def: BossDef): BattleCreature {
  const c = makeBattleCreature(def.speciesId, def.level);
  c.maxHp = Math.round(c.maxHp * def.hpMult);
  c.currentHp = c.maxHp;
  c.atk = Math.round(c.atk * def.atkMult);
  c.spAtk = Math.round(c.spAtk * def.atkMult);
  c.catchRate = 0;
  return c;
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
    creature.level++;
    refreshStats(creature);
    messages.push(`${creature.name} grew to Lv.${creature.level}!`);

    for (const [learnLevel, moveId] of sp.learnset) {
      const alreadyKnown = creature.moves.some(m => m.moveId === moveId);
      if (learnLevel !== creature.level || alreadyKnown) continue;
      const mv = MOVES[moveId];
      const slot = { moveId, pp: mv?.pp ?? 10, maxPp: mv?.pp ?? 10 };
      if (creature.moves.length < 4) {
        creature.moves.push(slot);
        messages.push(`${creature.name} learned ${mv?.name ?? moveId}!`);
        continue;
      }
      // Full move list: a stronger damaging move replaces the weakest known move
      // (status moves go first), so higher-level attacks stay reachable.
      const power = (id: string) => MOVES[id]?.power ?? 0;
      const weakest = creature.moves.reduce((w, m) => (power(m.moveId) < power(w.moveId) ? m : w), creature.moves[0]);
      if (mv && mv.power > power(weakest.moveId)) {
        creature.moves[creature.moves.indexOf(weakest)] = slot;
        messages.push(`${creature.name} learned ${mv.name}, forgetting ${MOVES[weakest.moveId]?.name ?? weakest.moveId}!`);
      }
    }
  }

  return messages;
}
