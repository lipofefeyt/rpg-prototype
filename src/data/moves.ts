import type { CreatureType } from "@/types";

export type MoveCategory = "physical" | "special" | "status";

export interface MoveDef {
  id: string;
  name: string;
  type: CreatureType;
  category: MoveCategory;
  power: number;    // 0 for status
  accuracy: number; // 0-100
  pp: number;
  priority: number; // usually 0
}

export const MOVES: Record<string, MoveDef> = {
  // Normal
  tackle:        { id: "tackle",        name: "Charge",        type: "normal",   category: "physical", power: 40,  accuracy: 100, pp: 35, priority: 0 },
  scratch:       { id: "scratch",       name: "Slash",       type: "normal",   category: "physical", power: 40,  accuracy: 100, pp: 35, priority: 0 },
  quick_attack:  { id: "quick_attack",  name: "Lunge",  type: "normal",   category: "physical", power: 40,  accuracy: 100, pp: 30, priority: 1 },
  hyper_fang:    { id: "hyper_fang",    name: "Rending Bite",    type: "normal",   category: "physical", power: 80,  accuracy: 90,  pp: 15, priority: 0 },
  body_slam:     { id: "body_slam",     name: "Shield Bash",     type: "normal",   category: "physical", power: 85,  accuracy: 100, pp: 15, priority: 0 },
  growl:         { id: "growl",         name: "Snarl",         type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 40, priority: 0 },
  tail_whip:     { id: "tail_whip",     name: "Intimidate",     type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 30, priority: 0 },
  splash:        { id: "splash",        name: "Flounder",        type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 40, priority: 0 },
  defense_curl:  { id: "defense_curl",  name: "Brace",  type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 40, priority: 0 },
  supersonic:    { id: "supersonic",    name: "Shriek",    type: "normal",   category: "status",   power: 0,   accuracy: 55,  pp: 20, priority: 0 },
  mean_look:     { id: "mean_look",     name: "Evil Eye",     type: "normal",   category: "status",   power: 0,   accuracy: 100, pp: 5,  priority: 0 },
  // Fire
  ember:         { id: "ember",         name: "Firebolt",         type: "fire",     category: "special",  power: 40,  accuracy: 100, pp: 25, priority: 0 },
  flamethrower:  { id: "flamethrower",  name: "Inferno",  type: "fire",     category: "special",  power: 95,  accuracy: 100, pp: 15, priority: 0 },
  // Water
  water_gun:     { id: "water_gun",     name: "Water Jet",     type: "water",    category: "special",  power: 40,  accuracy: 100, pp: 25, priority: 0 },
  bubble:        { id: "bubble",        name: "Foam Burst",        type: "water",    category: "special",  power: 40,  accuracy: 100, pp: 30, priority: 0 },
  surf:          { id: "surf",          name: "Tidal Surge",          type: "water",    category: "special",  power: 95,  accuracy: 100, pp: 15, priority: 0 },
  // Electric
  thunder_shock: { id: "thunder_shock", name: "Static Jolt",  type: "electric", category: "special",  power: 40,  accuracy: 100, pp: 30, priority: 0 },
  thunderbolt:   { id: "thunderbolt",   name: "Lightning Strike",   type: "electric", category: "special",  power: 95,  accuracy: 100, pp: 15, priority: 0 },
  thunder_wave:  { id: "thunder_wave",  name: "Paralyzing Hex",  type: "electric", category: "status",   power: 0,   accuracy: 90,  pp: 20, priority: 0 },
  // Grass
  vine_whip:     { id: "vine_whip",     name: "Snaring Shot",     type: "grass",    category: "physical", power: 45,  accuracy: 100, pp: 25, priority: 0 },
  razor_leaf:    { id: "razor_leaf",    name: "Barbed Arrow",    type: "grass",    category: "physical", power: 55,  accuracy: 95,  pp: 25, priority: 0 },
  // Flying
  gust:          { id: "gust",          name: "Gale",          type: "flying",   category: "special",  power: 40,  accuracy: 100, pp: 35, priority: 0 },
  wing_attack:   { id: "wing_attack",   name: "Talon Rake",   type: "flying",   category: "physical", power: 60,  accuracy: 100, pp: 35, priority: 0 },
  // Rock
  rock_throw:    { id: "rock_throw",    name: "Hurled Stone",    type: "rock",     category: "physical", power: 50,  accuracy: 90,  pp: 15, priority: 0 },
  rock_slide:    { id: "rock_slide",    name: "Rockfall",    type: "rock",     category: "physical", power: 75,  accuracy: 90,  pp: 10, priority: 0 },
  // Ghost
  lick:          { id: "lick",          name: "Chill Touch",          type: "ghost",    category: "physical", power: 30,  accuracy: 100, pp: 30, priority: 0 },
  shadow_ball:   { id: "shadow_ball",   name: "Shadow Bolt",   type: "ghost",    category: "special",  power: 80,  accuracy: 100, pp: 15, priority: 0 },
  // Psychic
  confusion:     { id: "confusion",     name: "Mind Spike",     type: "psychic",  category: "special",  power: 50,  accuracy: 100, pp: 25, priority: 0 },
  teleport:      { id: "teleport",      name: "Blink",      type: "psychic",  category: "status",   power: 0,   accuracy: 100, pp: 20, priority: 0 },
  hypnosis:      { id: "hypnosis",      name: "Lullaby",      type: "psychic",  category: "status",   power: 0,   accuracy: 60,  pp: 20, priority: 0 },
  // Dark
  bite:          { id: "bite",          name: "Fang Strike",          type: "dark",     category: "physical", power: 60,  accuracy: 100, pp: 25, priority: 0 },
  // Steel
  smite:         { id: "smite",         name: "Smite",         type: "steel",    category: "physical", power: 90,  accuracy: 100, pp: 15, priority: 0 },
  metal_claw:    { id: "metal_claw",    name: "Sword Slash",    type: "steel",    category: "physical", power: 50,  accuracy: 95,  pp: 35, priority: 0 },
  // Ground
  sand_attack:   { id: "sand_attack",   name: "Dust Cloud",   type: "ground",   category: "status",   power: 0,   accuracy: 100, pp: 15, priority: 0 },
  magnitude:     { id: "magnitude",     name: "Earthquake",     type: "ground",   category: "physical", power: 60,  accuracy: 100, pp: 30, priority: 0 },
  // Poison
  poison_powder: { id: "poison_powder", name: "Poison Tip",  type: "poison",   category: "status",   power: 0,   accuracy: 75,  pp: 35, priority: 0 },
  spite:         { id: "spite",         name: "Curse",         type: "ghost",    category: "status",   power: 0,   accuracy: 100, pp: 10, priority: 0 },
};
