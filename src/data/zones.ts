import { type Direction } from "@/types";
import {
  TILE_GRASS as G, TILE_TREE as T, TILE_PATH as P, TILE_WATER as W,
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
}

// ── Map builders ──────────────────────────────────────────────────────────────

function buildOverworld(): number[][] {
  const m = Array.from({ length: MAP_ROWS }, () => Array<number>(MAP_COLS).fill(G));

  // Solid border
  for (let x = 0; x < MAP_COLS; x++) { m[0][x] = T; m[MAP_ROWS - 1][x] = T; }
  for (let y = 0; y < MAP_ROWS; y++) { m[y][0] = T; m[y][MAP_COLS - 1] = T; }

  // Cross-roads paths
  for (let x = 1; x < MAP_COLS - 1; x++) m[PATH_ROW][x] = P;
  for (let y = 1; y < MAP_ROWS - 1; y++) m[y][PATH_COL] = P;

  // Tree groves — corners + scattered
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

  return m;
}

function buildCave(): number[][] {
  // 25×20 cave interior — floor is PATH, walls are TREE
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

  // Exit corridor at bottom (CAVE_EXIT_COL stays as floor)
  // The rest of the bottom wall is already T; the exit tile is carved open
  m[CAVE_ROWS - 2][CAVE_EXIT_COL] = P; // always walkable — exit trigger fires here

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
      // Walk to the top edge of the map → enter cave
      { tileX: PATH_COL, tileY: 1, targetZoneId: "cave", spawnX: CAVE_EXIT_COL, spawnY: CAVE_ROWS - 3 },
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
      // Walk to the bottom exit tile → return to overworld
      { tileX: CAVE_EXIT_COL, tileY: CAVE_ROWS - 2, targetZoneId: "overworld", spawnX: PATH_COL, spawnY: 2 },
    ],
  },
};
