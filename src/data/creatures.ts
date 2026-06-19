import type { PkmnType } from "@/types";
import { MOVES } from "@/data/moves";

export type { PkmnType };

export interface BaseStats {
  hp: number; atk: number; def: number;
  spAtk: number; spDef: number; speed: number;
}

export interface CreatureSpecies {
  id: number;
  name: string;
  types: PkmnType[];
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
  types: PkmnType[];
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
}

// ── Species database ──────────────────────────────────────────────────────────

export const SPECIES: Record<number, CreatureSpecies> = {
  1: {
    id: 1, name: "Bulbasaur", types: ["grass", "poison"],
    baseStats: { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, speed: 45 },
    catchRate: 45, baseExp: 64,
    learnset: [[1,"tackle"],[1,"growl"],[7,"vine_whip"],[13,"poison_powder"],[22,"razor_leaf"]],
  },
  4: {
    id: 4, name: "Charmander", types: ["fire"],
    baseStats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, speed: 65 },
    catchRate: 45, baseExp: 62,
    learnset: [[1,"scratch"],[1,"growl"],[7,"ember"],[10,"metal_claw"],[17,"flamethrower"]],
  },
  7: {
    id: 7, name: "Squirtle", types: ["water"],
    baseStats: { hp: 44, atk: 48, def: 65, spAtk: 50, spDef: 64, speed: 43 },
    catchRate: 45, baseExp: 63,
    learnset: [[1,"tackle"],[1,"tail_whip"],[7,"water_gun"],[10,"bite"],[19,"bubble"],[28,"surf"]],
  },
  16: {
    id: 16, name: "Pidgey", types: ["normal", "flying"],
    baseStats: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, speed: 56 },
    catchRate: 255, baseExp: 50,
    learnset: [[1,"tackle"],[1,"sand_attack"],[9,"gust"],[12,"quick_attack"],[19,"wing_attack"]],
  },
  19: {
    id: 19, name: "Rattata", types: ["normal"],
    baseStats: { hp: 30, atk: 56, def: 35, spAtk: 25, spDef: 35, speed: 72 },
    catchRate: 255, baseExp: 51,
    learnset: [[1,"tackle"],[1,"tail_whip"],[7,"quick_attack"],[13,"hyper_fang"],[20,"body_slam"]],
  },
  25: {
    id: 25, name: "Pikachu", types: ["electric"],
    baseStats: { hp: 35, atk: 55, def: 30, spAtk: 50, spDef: 40, speed: 90 },
    catchRate: 190, baseExp: 105,
    learnset: [[1,"thunder_shock"],[1,"growl"],[9,"tail_whip"],[13,"thunder_wave"],[21,"thunderbolt"]],
  },
  41: {
    id: 41, name: "Zubat", types: ["poison", "flying"],
    baseStats: { hp: 40, atk: 45, def: 35, spAtk: 30, spDef: 40, speed: 55 },
    catchRate: 255, baseExp: 49,
    learnset: [[1,"scratch"],[1,"supersonic"],[9,"bite"],[12,"wing_attack"],[19,"mean_look"]],
  },
  54: {
    id: 54, name: "Psyduck", types: ["water"],
    baseStats: { hp: 50, atk: 52, def: 48, spAtk: 65, spDef: 50, speed: 55 },
    catchRate: 190, baseExp: 64,
    learnset: [[1,"scratch"],[1,"tail_whip"],[10,"water_gun"],[13,"confusion"],[22,"surf"]],
  },
  63: {
    id: 63, name: "Abra", types: ["psychic"],
    baseStats: { hp: 25, atk: 20, def: 15, spAtk: 105, spDef: 55, speed: 90 },
    catchRate: 200, baseExp: 73,
    learnset: [[1,"teleport"],[16,"confusion"]],
  },
  74: {
    id: 74, name: "Geodude", types: ["rock", "ground"],
    baseStats: { hp: 40, atk: 80, def: 100, spAtk: 30, spDef: 30, speed: 20 },
    catchRate: 255, baseExp: 60,
    learnset: [[1,"tackle"],[1,"defense_curl"],[11,"rock_throw"],[16,"magnitude"],[21,"rock_slide"]],
  },
  92: {
    id: 92, name: "Gastly", types: ["ghost", "poison"],
    baseStats: { hp: 30, atk: 35, def: 30, spAtk: 100, spDef: 35, speed: 80 },
    catchRate: 190, baseExp: 62,
    learnset: [[1,"lick"],[1,"hypnosis"],[8,"spite"],[12,"mean_look"],[18,"shadow_ball"]],
  },
  129: {
    id: 129, name: "Magikarp", types: ["water"],
    baseStats: { hp: 20, atk: 10, def: 55, spAtk: 15, spDef: 20, speed: 80 },
    catchRate: 255, baseExp: 20,
    learnset: [[1,"splash"],[15,"tackle"]],
  },
};

// ── Battle creature factory ───────────────────────────────────────────────────

export function makeBattleCreature(speciesId: number, level: number): BattleCreature {
  const sp = SPECIES[speciesId];
  if (!sp) throw new Error(`Unknown species id: ${speciesId}`);

  const hp   = (b: number) => Math.floor((2 * b + 15) * level / 100) + level + 10;
  const stat = (b: number) => Math.floor((2 * b + 15) * level / 100) + 5;
  const maxHp = hp(sp.baseStats.hp);

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
    atk:   stat(sp.baseStats.atk),
    def:   stat(sp.baseStats.def),
    spAtk: stat(sp.baseStats.spAtk),
    spDef: stat(sp.baseStats.spDef),
    speed: stat(sp.baseStats.speed),
    moves,
    status: null,
    catchRate: sp.catchRate,
  };
}
