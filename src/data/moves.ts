import { Type } from "./creatures";

export type MoveCategory = "physical" | "special" | "status";

export interface Move {
  id: string;
  name: string;
  type: Type;
  category: MoveCategory;
  power: number;
  accuracy: number;
  pp: number;
}

export const MOVES: Record<string, Move> = {
  tackle: { id: "tackle", name: "Tackle", type: "normal", category: "physical", power: 40, accuracy: 100, pp: 35 },
  ember:  { id: "ember",  name: "Ember",  type: "fire",   category: "special",  power: 40, accuracy: 100, pp: 25 },
};
