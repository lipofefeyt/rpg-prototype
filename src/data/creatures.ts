export type Type =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface CreatureSpecies {
  id: number;
  name: string;
  types: [Type] | [Type, Type];
  baseStats: BaseStats;
  catchRate: number;
  /** [level, moveId] */
  learnset: [number, string][];
  evolvesAt?: { level: number; intoId: number };
}

export const SPECIES: Record<number, CreatureSpecies> = {
  // Placeholder entries — populate from game data in M4
  1: {
    id: 1,
    name: "Embrit",
    types: ["fire"],
    baseStats: { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, speed: 45 },
    catchRate: 45,
    learnset: [[1, "tackle"], [7, "ember"]],
    evolvesAt: { level: 16, intoId: 2 },
  },
};
