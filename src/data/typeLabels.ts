import type { CreatureType } from "@/types";

/** Player-facing names for the (internal) damage types, themed as medieval elements. */
export const TYPE_LABELS: Record<CreatureType, string> = {
  normal: "Mundane", fire: "Fire",    water: "Tide",   electric: "Storm", grass: "Nature", ice: "Frost",
  fighting: "Martial", poison: "Venom", ground: "Earth", flying: "Wind",  psychic: "Arcane", bug: "Vermin",
  rock: "Stone",   ghost: "Spirit",   dragon: "Dragon", dark: "Shadow",   steel: "Iron",   fairy: "Holy",
};
