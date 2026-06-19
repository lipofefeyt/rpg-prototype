export const TILE_SIZE = 16;
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;

export const MAP_COLS = 50;
export const MAP_ROWS = 40;
export const PATH_ROW = 20; // row index of the horizontal path
export const PATH_COL = 25; // col index of the vertical path

// Tile indices — must match the tileset order generated in BootScene
export const TILE_GRASS = 0;
export const TILE_TREE  = 1;
export const TILE_PATH  = 2;
export const TILE_WATER = 3;

// Cave zone dimensions
export const CAVE_COLS     = 25;
export const CAVE_ROWS     = 20;
export const CAVE_EXIT_COL = 12;

// Player/NPC spritesheet — idle frame base per direction (frame = base + 0/1/2)
export const ANIM_BASE = { down: 0, up: 3, left: 6, right: 9 } as const;

// In-game clock speed: how many real milliseconds = 1 in-game minute
export const MS_PER_GAME_MINUTE = 500; // 1 real second = 2 in-game minutes
