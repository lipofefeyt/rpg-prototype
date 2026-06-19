import type { PkmnType } from "@/types";

export type MoveCategory = "physical" | "special" | "status";

export interface MoveDef {
  id: string;
  name: string;
  type: PkmnType;
  category: MoveCategory;
  power: number;    // 0 for status
  accuracy: number; // 0-100
  pp: number;
  priority: number; // usually 0
}

export const MOVES: Record<string, MoveDef> = {
  // Normal
  tackle:        { id: "tackle",        name: "Tackle",        type: "normal",   category: "physical", power: 40,  accuracy: 100, pp: 35, priority: 0 },
  scratch:       { id: "scratch",       name: "Scratch",       type: "normal",   category: "physical", power: 40,  accuracy: 100, pp: 35, priority: 0 },
  quick_attack:  { id: "quick_attack",  name: "Quick Attack",  type: "normal",   category: "physical", power: 40,  accuracy: 100, pp: 30, priority: 1 },
  hyper_fang:    { id: "hyper_fang",    name: "Hyper Fang",    type: "normal",   category: "physical", power: 80,  accuracy: 90,  pp: 15, priority: 0 },
  body_slam:     { id: "body_slam",     name: "Body Slam",     type: "normal",   category: "physical", power: 85,  accuracy: 100, pp: 15, priority: 0 },
  growl:         { id: "growl",         name: "Growl",         type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 40, priority: 0 },
  tail_whip:     { id: "tail_whip",     name: "Tail Whip",     type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 30, priority: 0 },
  splash:        { id: "splash",        name: "Splash",        type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 40, priority: 0 },
  defense_curl:  { id: "defense_curl",  name: "Defense Curl",  type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 40, priority: 0 },
  supersonic:    { id: "supersonic",    name: "Supersonic",    type: "normal",   category: "status",   power: 0,   accuracy: 55,  pp: 20, priority: 0 },
  mean_look:     { id: "mean_look",     name: "Mean Look",     type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 5,  priority: 0 },
  // Fire
  ember:         { id: "ember",         name: "Ember",         type: "fire",     category: "special",  power: 40,  accuracy: 100, pp: 25, priority: 0 },
  flamethrower:  { id: "flamethrower",  name: "Flamethrower",  type: "fire",     category: "special",  power: 95,  accuracy: 100, pp: 15, priority: 0 },
  // Water
  water_gun:     { id: "water_gun",     name: "Water Gun",     type: "water",    category: "special",  power: 40,  accuracy: 100, pp: 25, priority: 0 },
  bubble:        { id: "bubble",        name: "Bubble",        type: "water",    category: "special",  power: 40,  accuracy: 100, pp: 30, priority: 0 },
  surf:          { id: "surf",          name: "Surf",          type: "water",    category: "special",  power: 95,  accuracy: 100, pp: 15, priority: 0 },
  // Electric
  thunder_shock: { id: "thunder_shock", name: "ThunderShock",  type: "electric", category: "special",  power: 40,  accuracy: 100, pp: 30, priority: 0 },
  thunderbolt:   { id: "thunderbolt",   name: "Thunderbolt",   type: "electric", category: "special",  power: 95,  accuracy: 100, pp: 15, priority: 0 },
  thunder_wave:  { id: "thunder_wave",  name: "Thunder Wave",  type: "electric", category: "status",   power: 0,   accuracy: 90,  pp: 20, priority: 0 },
  // Grass
  vine_whip:     { id: "vine_whip",     name: "Vine Whip",     type: "grass",    category: "physical", power: 45,  accuracy: 100, pp: 25, priority: 0 },
  razor_leaf:    { id: "razor_leaf",    name: "Razor Leaf",    type: "grass",    category: "physical", power: 55,  accuracy: 95,  pp: 25, priority: 0 },
  // Flying
  gust:          { id: "gust",          name: "Gust",          type: "flying",   category: "special",  power: 40,  accuracy: 100, pp: 35, priority: 0 },
  wing_attack:   { id: "wing_attack",   name: "Wing Attack",   type: "flying",   category: "physical", power: 60,  accuracy: 100, pp: 35, priority: 0 },
  // Rock
  rock_throw:    { id: "rock_throw",    name: "Rock Throw",    type: "rock",     category: "physical", power: 50,  accuracy: 90,  pp: 15, priority: 0 },
  rock_slide:    { id: "rock_slide",    name: "Rock Slide",    type: "rock",     category: "physical", power: 75,  accuracy: 90,  pp: 10, priority: 0 },
  // Ghost
  lick:          { id: "lick",          name: "Lick",          type: "ghost",    category: "physical", power: 30,  accuracy: 100, pp: 30, priority: 0 },
  shadow_ball:   { id: "shadow_ball",   name: "Shadow Ball",   type: "ghost",    category: "special",  power: 80,  accuracy: 100, pp: 15, priority: 0 },
  // Psychic
  confusion:     { id: "confusion",     name: "Confusion",     type: "psychic",  category: "special",  power: 50,  accuracy: 100, pp: 25, priority: 0 },
  teleport:      { id: "teleport",      name: "Teleport",      type: "psychic",  category: "status",   power: 0,   accuracy: 100, pp: 20, priority: 0 },
  hypnosis:      { id: "hypnosis",      name: "Hypnosis",      type: "psychic",  category: "status",   power: 0,   accuracy: 60,  pp: 20, priority: 0 },
  // Dark
  bite:          { id: "bite",          name: "Bite",          type: "dark",     category: "physical", power: 60,  accuracy: 100, pp: 25, priority: 0 },
  // Steel
  metal_claw:    { id: "metal_claw",    name: "Metal Claw",    type: "steel",    category: "physical", power: 50,  accuracy: 95,  pp: 35, priority: 0 },
  // Ground
  sand_attack:   { id: "sand_attack",   name: "Sand Attack",   type: "ground",   category: "status",   power: 0,   accuracy: 100, pp: 15, priority: 0 },
  magnitude:     { id: "magnitude",     name: "Magnitude",     type: "ground",   category: "physical", power: 60,  accuracy: 100, pp: 30, priority: 0 },
  // Poison
  poison_powder: { id: "poison_powder", name: "PoisonPowder",  type: "poison",   category: "status",   power: 0,   accuracy: 75,  pp: 35, priority: 0 },
  spite:         { id: "spite",         name: "Spite",         type: "ghost",    category: "status",   power: 0,   accuracy: 100, pp: 10, priority: 0 },
};
