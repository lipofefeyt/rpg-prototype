import { type Direction } from "@/types";
import {
  TILE_GRASS as G, TILE_TREE as T, TILE_PATH as P, TILE_WATER as W,
  TILE_TALLGRASS as TG, TILE_CAVE_FLOOR as CF,
  MAP_COLS, MAP_ROWS, PATH_ROW, PATH_COL,
  CAVE_COLS, CAVE_ROWS, CAVE_EXIT_COL,
  SEASIDE_COLS, SEASIDE_ROWS, SEASIDE_PATH_COL,
  FOREST_COLS, FOREST_ROWS, FOREST_PATH_ROW,
  PLAINS_COLS, PLAINS_ROWS, PLAINS_PATH_ROW,
} from "@/constants";

// ── Shared interfaces ────────────────────────────────────────────────────────

export interface NpcDef {
  id: string;
  name: string;
  tileX: number;
  tileY: number;
  facing: Direction;
  scriptId: string;
  tint: number;
  /** Which shop opens after the dialogue ("village" | "outpost"; see equipment.ts). */
  shop?: string;
  /** Quests this NPC gives, checked in order (see systems/quests.ts). */
  questIds?: string[];
  /** Boss id (data/bosses.ts): interacting starts the boss fight until it is defeated. */
  boss?: string;
  /** If true, the dialogue is followed by the inn screen (rest to heal for gold). */
  inn?: boolean;
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
  const m = Array.from({ length: CAVE_ROWS }, () => Array<number>(CAVE_COLS).fill(CF));

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

  m[CAVE_ROWS - 2][CAVE_EXIT_COL] = CF; // exit tile (transition handled by coords)
  return m;
}

function buildSeaside(): number[][] {
  const m = Array.from({ length: SEASIDE_ROWS }, () => Array<number>(SEASIDE_COLS).fill(G));

  // North/west/east border = trees; the south edge opens onto the ocean.
  for (let x = 0; x < SEASIDE_COLS; x++) m[0][x] = T;
  for (let y = 0; y < SEASIDE_ROWS - 1; y++) { m[y][0] = T; m[y][SEASIDE_COLS - 1] = T; }
  for (let x = 0; x < SEASIDE_COLS; x++) m[SEASIDE_ROWS - 1][x] = W;

  // Vertical path down from the overworld entrance to the shore.
  for (let y = 1; y < SEASIDE_ROWS - 1; y++) m[y][SEASIDE_PATH_COL] = P;

  // Tall-grass patches either side of the path, near the water — encounters.
  const tgPatches: [number, number, number, number][] = [
    [9, 13, 3, 8],                        // west patch
    [9, 13, SEASIDE_COLS - 9, SEASIDE_COLS - 4], // east patch
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


/** Small deterministic PRNG so the generated maps are identical every run. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
}

type Grid = number[][];
const fillRect = (m: Grid, x0: number, y0: number, x1: number, y1: number, tile: number) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (m[y]?.[x] !== undefined) m[y][x] = tile;
};

/** Lays a 1-tile path through [waypoints] (straight segments) with a cleared grass margin either side. */
function carvePath(m: Grid, waypoints: [number, number][]): void {
  const cells: [number, number][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [x0, y0] = waypoints[i], [x1, y1] = waypoints[i + 1];
    const sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0);
    for (let x = x0, y = y0; ; x += sx, y += sy) {
      cells.push([x, y]);
      if (x === x1 && y === y1) break;
    }
  }
  for (const [x, y] of cells) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (m[y + dy]?.[x + dx] !== undefined && m[y + dy][x + dx] !== P) m[y + dy][x + dx] = G;
  }
  for (const [x, y] of cells) m[y][x] = P;
}

function buildForest(): Grid {
  const rand = rng(1337);
  const m: Grid = Array.from({ length: FOREST_ROWS }, () => Array<number>(FOREST_COLS).fill(G));
  // dense woodland
  for (let y = 0; y < FOREST_ROWS; y++) for (let x = 0; x < FOREST_COLS; x++) {
    const border = x === 0 || y === 0 || x === FOREST_COLS - 1 || y === FOREST_ROWS - 1;
    if (border || rand() < 0.4) m[y][x] = T;
  }
  const R = FOREST_PATH_ROW;
  // a winding trail from the east entrance to the Briarqueen's grove in the far west
  carvePath(m, [[FOREST_COLS - 2, R], [27, R], [27, 6], [19, 6], [19, 17], [11, 17], [11, R], [7, R]]);
  // tall-grass clearings along the trail (wild encounters)
  for (const [x0, y0, x1, y1] of [[28, 13, 32, 17], [21, 8, 25, 12], [12, 4, 17, 9], [13, 18, 17, 21], [20, 18, 26, 21]] as [number, number, number, number][]) {
    fillRect(m, x0, y0, x1, y1, TG);
  }
  // keep the trail and entrance clear, then the boss grove
  carvePath(m, [[FOREST_COLS - 2, R], [27, R], [27, 6], [19, 6], [19, 17], [11, 17], [11, R], [7, R]]);
  fillRect(m, 2, R - 3, 8, R + 3, G);
  // hermit's clearing near the entrance
  fillRect(m, 28, 8, 31, 10, G);
  m[R][FOREST_COLS - 2] = P;
  return m;
}

function buildPlains(): Grid {
  const rand = rng(4242);
  const m: Grid = Array.from({ length: PLAINS_ROWS }, () => Array<number>(PLAINS_COLS).fill(G));
  for (let y = 0; y < PLAINS_ROWS; y++) for (let x = 0; x < PLAINS_COLS; x++) {
    const border = x === 0 || y === 0 || x === PLAINS_COLS - 1 || y === PLAINS_ROWS - 1;
    if (border) m[y][x] = T;
    else if (rand() < 0.04) m[y][x] = T;      // sparse trees
  }
  const R = PLAINS_PATH_ROW;
  // big tall-grass fields north and south of the road
  fillRect(m, 14, 2, 31, 6, TG);
  fillRect(m, 14, 14, 31, 19, TG);
  fillRect(m, 33, 2, 38, 5, TG);
  // outpost yard (west) and the Grukk's war camp (east) are cleared grass
  fillRect(m, 2, R - 4, 13, R + 4, G);
  fillRect(m, 33, R - 3, 40, R + 3, G);
  carvePath(m, [[1, R], [PLAINS_COLS - 5, R]]);
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
      { id: "elder",    name: "Elder Oak",     tileX: 23, tileY: 18, facing: "right", scriptId: "npc_elder",    tint: 0xffddaa, questIds: ["rats", "scout_cave", "scout_forest", "scout_plains"] },
      { id: "guard",    name: "Guard",         tileX: 27, tileY: 21, facing: "left",  scriptId: "npc_guard",    tint: 0xaabbff, questIds: ["crows"] },
      { id: "innkeeper", name: "Innkeeper Mara", tileX: 27, tileY: 17, facing: "down", scriptId: "npc_innkeeper", tint: 0xffb0b0, inn: true },
      { id: "merchant", name: "Merchant",      tileX: 23, tileY: 23, facing: "right", scriptId: "npc_merchant", tint: 0xaaffbb, shop: "village", questIds: ["imps"] },
    ],
    signs: [
      { tileX: 24, tileY: 19, scriptId: "sign_crossroads" },
      { tileX: 28, tileY: 17, scriptId: "sign_inn" },
      { tileX: PATH_COL, tileY: 3, scriptId: "sign_cave_entrance" },
      { tileX: PATH_COL, tileY: MAP_ROWS - 4, scriptId: "sign_seaside_road" },
    ],
    transitions: [
      { tileX: PATH_COL, tileY: 1, targetZoneId: "cave", spawnX: CAVE_EXIT_COL, spawnY: CAVE_ROWS - 3 },
      { tileX: PATH_COL, tileY: MAP_ROWS - 2, targetZoneId: "seaside", spawnX: SEASIDE_PATH_COL, spawnY: 2 },
      { tileX: 1, tileY: PATH_ROW, targetZoneId: "forest", spawnX: FOREST_COLS - 3, spawnY: FOREST_PATH_ROW },
      { tileX: MAP_COLS - 2, tileY: PATH_ROW, targetZoneId: "plains", spawnX: 3, spawnY: PLAINS_PATH_ROW },
    ],
    encounterRate: 0.15,
    encounterPool: [
      { speciesId: 16,  minLevel: 3, maxLevel: 6,  weight: 30 }, // Flitterwing
      { speciesId: 19,  minLevel: 3, maxLevel: 5,  weight: 25 }, // Nibblerat
      { speciesId: 25,  minLevel: 4, maxLevel: 7,  weight: 10 }, // Sparkit
      { speciesId: 63,  minLevel: 3, maxLevel: 6,  weight: 5  }, // Mindling
      { speciesId: 54,  minLevel: 4, maxLevel: 7,  weight: 15 }, // Quackle
      { speciesId: 129, minLevel: 3, maxLevel: 5,  weight: 15 }, // Finflop
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
      { id: "miner", name: "Miner Cole", tileX: 15, tileY: 8, facing: "left", scriptId: "npc_miner", tint: 0xffcc88, questIds: ["golems", "warden"] },
      { id: "warden", name: "Cavern Warden", tileX: 12, tileY: 6, facing: "down", scriptId: "boss_warden_intro", tint: 0xffffff, boss: "cavern_warden" },
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

  seaside: {
    id: "seaside",
    cols: SEASIDE_COLS,
    rows: SEASIDE_ROWS,
    mapData: buildSeaside(),
    defaultSpawnX: SEASIDE_PATH_COL,
    defaultSpawnY: 2,
    npcs: [
      { id: "innkeeper2", name: "Innkeeper Bram", tileX: SEASIDE_PATH_COL + 4, tileY: 5, facing: "left", scriptId: "npc_innkeeper2", tint: 0xb0d0ff, inn: true },
      { id: "fisherman", name: "Fisherman Tam", tileX: SEASIDE_PATH_COL - 3, tileY: 8,  facing: "right", scriptId: "npc_fisherman", tint: 0xaaccee, questIds: ["carp"] },
      { id: "sailor",    name: "Sailor Reyes",  tileX: SEASIDE_PATH_COL + 3, tileY: 12, facing: "left",  scriptId: "npc_sailor",    tint: 0xeecc88, questIds: ["tame_first"] },
    ],
    signs: [
      { tileX: SEASIDE_PATH_COL, tileY: SEASIDE_ROWS - 3, scriptId: "sign_seaside_shore" },
    ],
    transitions: [
      { tileX: SEASIDE_PATH_COL, tileY: 1, targetZoneId: "overworld", spawnX: PATH_COL, spawnY: MAP_ROWS - 3 },
    ],
    encounterRate: 0.15,
    encounterPool: [
      { speciesId: 129, minLevel: 6, maxLevel: 10, weight: 30 }, // Finflop
      { speciesId: 54,  minLevel: 6, maxLevel: 9,  weight: 25 }, // Quackle
      { speciesId: 16,  minLevel: 5, maxLevel: 9,  weight: 25 }, // Flitterwing
      { speciesId: 74,  minLevel: 6, maxLevel: 10, weight: 20 }, // Rockling
    ],
  },
  forest: {
    id: "forest",
    cols: FOREST_COLS,
    rows: FOREST_ROWS,
    mapData: buildForest(),
    defaultSpawnX: FOREST_COLS - 3,
    defaultSpawnY: FOREST_PATH_ROW,
    npcs: [
      { id: "hermit", name: "Hermit Elm", tileX: 30, tileY: 9, facing: "down", scriptId: "npc_hermit", tint: 0xa8d89a, questIds: ["wolves", "briar"] },
      { id: "briarqueen", name: "Briarqueen", tileX: 5, tileY: FOREST_PATH_ROW, facing: "right", scriptId: "boss_briarqueen_intro", tint: 0xffffff, boss: "briarqueen" },
    ],
    signs: [
      { tileX: FOREST_COLS - 4, tileY: FOREST_PATH_ROW + 1, scriptId: "sign_forest_entrance" },
    ],
    transitions: [
      { tileX: FOREST_COLS - 2, tileY: FOREST_PATH_ROW, targetZoneId: "overworld", spawnX: 2, spawnY: PATH_ROW },
    ],
    encounterRate: 0.18,
    encounterPool: [
      { speciesId: 210, minLevel: 7, maxLevel: 11, weight: 30 }, // Dire Wolf
      { speciesId: 211, minLevel: 7, maxLevel: 10, weight: 30 }, // Briar Sprite
      { speciesId: 16,  minLevel: 6, maxLevel: 9,  weight: 15 }, // Carrion Crow
      { speciesId: 92,  minLevel: 8, maxLevel: 11, weight: 10 }, // Wraith
    ],
  },
  plains: {
    id: "plains",
    cols: PLAINS_COLS,
    rows: PLAINS_ROWS,
    mapData: buildPlains(),
    defaultSpawnX: 3,
    defaultSpawnY: PLAINS_PATH_ROW,
    npcs: [
      { id: "smith",     name: "Smith Hild",    tileX: 7,  tileY: PLAINS_PATH_ROW - 2, facing: "down", scriptId: "npc_smith",     tint: 0xd0a070, shop: "outpost", questIds: ["hawks"] },
      { id: "innkeeper3", name: "Innkeeper Odo", tileX: 10, tileY: PLAINS_PATH_ROW + 2, facing: "up",   scriptId: "npc_innkeeper3", tint: 0xb0ffb0, inn: true },
      { id: "scout",     name: "Scout Alder",   tileX: 12, tileY: PLAINS_PATH_ROW - 2, facing: "down", scriptId: "npc_scout",     tint: 0xc0c0ff, questIds: ["boars", "grukk"] },
      { id: "grukk",     name: "Warlord Grukk", tileX: 37, tileY: PLAINS_PATH_ROW, facing: "left", scriptId: "boss_grukk_intro", tint: 0xffffff, boss: "warlord_grukk" },
    ],
    signs: [
      { tileX: 5, tileY: PLAINS_PATH_ROW + 1, scriptId: "sign_plains_outpost" },
      { tileX: 31, tileY: PLAINS_PATH_ROW + 1, scriptId: "sign_plains_camp" },
    ],
    transitions: [
      { tileX: 1, tileY: PLAINS_PATH_ROW, targetZoneId: "overworld", spawnX: MAP_COLS - 3, spawnY: PATH_ROW },
    ],
    encounterRate: 0.16,
    encounterPool: [
      { speciesId: 212, minLevel: 9,  maxLevel: 13, weight: 30 }, // Tusked Boar
      { speciesId: 213, minLevel: 9,  maxLevel: 13, weight: 30 }, // Dust Hawk
      { speciesId: 210, minLevel: 10, maxLevel: 13, weight: 15 }, // Dire Wolf
      { speciesId: 25,  minLevel: 9,  maxLevel: 12, weight: 15 }, // Spark Imp
      { speciesId: 74,  minLevel: 10, maxLevel: 13, weight: 10 }, // Stone Golem
    ],
  },
};
