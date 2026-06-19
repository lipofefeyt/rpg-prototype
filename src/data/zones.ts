import { type Direction } from "@/types";
import {
  TILE_GRASS as G, TILE_TREE as T, TILE_PATH as P, TILE_WATER as W, TILE_TALLGRASS as TG,
  MAP_COLS, MAP_ROWS, PATH_ROW, PATH_COL,
  CAVE_COLS, CAVE_ROWS, CAVE_EXIT_COL,
} from "@/constants";

// ── Shared interfaces ────────────────────────────────────────────────────────

export interface NpcDef {
  id: string;
  tileX: number;
  tileY: number;
  facing: Direction;
  scriptId: string;
  tint: number;
}

export interface SignDef {
  tileX: number;
  tileY: number;
  scriptId: string;
}

export interface ZoneTransition {
  tileX: number;
  tileY: number;
  targetZoneId: string;
  spawnX: number;
  spawnY: number;
}

export interface EncounterEntry {
  speciesId: number;
  minLevel: number;
  maxLevel: number;
  weight: number; // relative frequency
}

export interface ZoneDef {
  id: string;
  cols: number;
  rows: number;
  mapData: number[][];
  defaultSpawnX: number;
  defaultSpawnY: number;
  npcs: NpcDef[];
  signs: SignDef[];
  transitions: ZoneTransition[];
  encounterRate: number;        // probability per tall grass step (0 = none)
  encounterPool: EncounterEntry[];
}

// ── Map builders ──────────────────────────────────────────────────────────────

function buildOverworld(): number[][] {
  const m = Array.from({ length: MAP_ROWS }, () => Array<number>(MAP_COLS).fill(G));

  // Solid border
  for (let x = 0; x < MAP_COLS; x++) { m[0][x] = T; m[MAP_ROWS - 1][x] = T; }
  for (let y = 0; y < MAP_ROWS; y++) { m[y][0] = T; m[y][MAP_COLS - 1] = T; }

  // Crossroads paths
  for (let x = 1; x < MAP_COLS - 1; x++) m[PATH_ROW][x] = P;
  for (let y = 1; y < MAP_ROWS - 1; y++) m[y][PATH_COL] = P;

  // Tree groves — corners + scattered clusters
  const trees: [number, number][] = [
    [3,3],[4,3],[5,3],[3,4],[5,4],[3,5],[4,5],[5,5],
    [43,3],[44,3],[45,3],[43,4],[45,4],[43,5],[44,5],[45,5],
    [3,33],[4,33],[5,33],[3,34],[5,34],[3,35],[4,35],[5,35],
    [43,33],[44,33],[45,33],[43,34],[45,34],[43,35],[44,35],[45,35],
    [10,6],[11,6],[10,7],[11,7],[12,7],
    [30,8],[31,8],[30,9],
    [13,27],[14,27],[13,28],[14,28],[13,29],
    [35,26],[36,26],[35,27],
    [8,14],[9,14],[8,15],[8,16],
    [40,22],[41,22],[40,23],[41,23],
  ];
  for (const [tx, ty] of trees) {
    if (ty > 0 && ty < MAP_ROWS - 1 && tx > 0 && tx < MAP_COLS - 1 && m[ty][tx] !== P)
      m[ty][tx] = T;
  }

  // Water lakes
  for (let y = 3; y <= 12; y++)
    for (let x = 32; x <= 41; x++)
      if (m[y][x] !== T && m[y][x] !== P) m[y][x] = W;

  for (let y = 27; y <= 32; y++)
    for (let x = 8; x <= 16; x++)
      if (m[y][x] !== T && m[y][x] !== P) m[y][x] = W;

  // Tall grass patches — 4 quadrants, away from paths
  const tgPatches: [number, number, number, number][] = [
    [9, 17,  4,  9],  // NW quadrant
    [6, 14, 27, 31],  // NE quadrant
    [22, 26,  3,  7], // SW quadrant
    [22, 27, 28, 36], // SE quadrant
  ];
  for (const [r0, r1, c0, c1] of tgPatches) {
    for (let y = r0; y <= r1; y++) {
      for (let x = c0; x <= c1; x++) {
        if (m[y][x] === G) m[y][x] = TG;
      }
    }
  }

  return m;
}

function buildCave(): number[][] {
  const m = Array.from({ length: CAVE_ROWS }, () => Array<number>(CAVE_COLS).fill(P));

  // Border walls
  for (let x = 0; x < CAVE_COLS; x++) { m[0][x] = T; m[CAVE_ROWS - 1][x] = T; }
  for (let y = 0; y < CAVE_ROWS; y++) { m[y][0] = T; m[y][CAVE_COLS - 1] = T; }

  // Interior rock formations
  const rocks: [number, number][] = [
    [3,3],[4,3],[3,4],
    [20,3],[21,3],[21,4],
    [6,7],[7,7],[6,8],[7,8],[6,9],
    [16,7],[17,7],[16,8],[17,8],[17,9],
    [10,12],[11,12],[10,13],
    [18,13],[19,13],[19,12],
  ];
  for (const [tx, ty] of rocks) {
    if (ty > 0 && ty < CAVE_ROWS - 1 && tx > 0 && tx < CAVE_COLS - 1)
      m[ty][tx] = T;
  }

  // Underground lake
  for (let y = 2; y <= 5; y++)
    for (let x = 9; x <= 14; x++)
      m[y][x] = W;

  m[CAVE_ROWS - 2][CAVE_EXIT_COL] = P; // exit walkable
  return m;
}

// ── Zone registry ─────────────────────────────────────────────────────────────

export const ZONES: Record<string, ZoneDef> = {
  overworld: {
    id: "overworld",
    cols: MAP_COLS,
    rows: MAP_ROWS,
    mapData: buildOverworld(),
    defaultSpawnX: PATH_COL,
    defaultSpawnY: PATH_ROW,
    npcs: [
      { id: "elder",    tileX: 23, tileY: 18, facing: "right", scriptId: "npc_elder",    tint: 0xffddaa },
      { id: "guard",    tileX: 27, tileY: 21, facing: "left",  scriptId: "npc_guard",    tint: 0xaabbff },
      { id: "merchant", tileX: 23, tileY: 23, facing: "right", scriptId: "npc_merchant", tint: 0xaaffbb },
    ],
    signs: [
      { tileX: 24, tileY: 19, scriptId: "sign_crossroads" },
      { tileX: PATH_COL, tileY: 3, scriptId: "sign_cave_entrance" },
    ],
    transitions: [
      { tileX: PATH_COL, tileY: 1, targetZoneId: "cave", spawnX: CAVE_EXIT_COL, spawnY: CAVE_ROWS - 3 },
    ],
    encounterRate: 0.15,
    encounterPool: [
      { speciesId: 16,  minLevel: 3, maxLevel: 6,  weight: 30 }, // Pidgey
      { speciesId: 19,  minLevel: 3, maxLevel: 5,  weight: 25 }, // Rattata
      { speciesId: 25,  minLevel: 4, maxLevel: 7,  weight: 10 }, // Pikachu
      { speciesId: 63,  minLevel: 3, maxLevel: 6,  weight: 5  }, // Abra
      { speciesId: 54,  minLevel: 4, maxLevel: 7,  weight: 15 }, // Psyduck
      { speciesId: 129, minLevel: 3, maxLevel: 5,  weight: 15 }, // Magikarp
    ],
  },

  cave: {
    id: "cave",
    cols: CAVE_COLS,
    rows: CAVE_ROWS,
    mapData: buildCave(),
    defaultSpawnX: CAVE_EXIT_COL,
    defaultSpawnY: CAVE_ROWS - 3,
    npcs: [
      { id: "miner", tileX: 15, tileY: 8, facing: "left", scriptId: "npc_miner", tint: 0xffcc88 },
    ],
    signs: [
      { tileX: CAVE_EXIT_COL, tileY: CAVE_ROWS - 4, scriptId: "sign_cave_exit" },
    ],
    transitions: [
      { tileX: CAVE_EXIT_COL, tileY: CAVE_ROWS - 2, targetZoneId: "overworld", spawnX: PATH_COL, spawnY: 2 },
    ],
    encounterRate: 0,
    encounterPool: [],
  },
};
