// All dialogue scripts — each key maps to an array of "pages" (one textbox per entry).
// Newlines within a page create line breaks inside the box.
export const SCRIPTS: Record<string, string[]> = {
  // ── Overworld NPCs ──────────────────────────────────────────────────────
  npc_elder: [
    "Welcome, young hero, to Crossroads Village!",
    "Four paths lead from here.\nThe cave road runs north along the main path...",
    "Beware — wild beasts and worse lurk in the tall grass.\nStay on the roads when you can.",
  ],
  npc_guard: [
    "Halt! ...Oh, you're the new adventurer everyone\nhas been talking about. The Captain sends his regards.",
    "Stay on marked paths. The tall grass hides wolves,\nbandits and worse for the unprepared.",
  ],
  npc_merchant: [
    "Welcome, traveller! I stock the finest charms,\ndraughts and gear in the whole kingdom.",
    "Restocking today, I'm afraid. Come back tomorrow\nand I'll have plenty of draughts and Taming Charms!",
  ],

  // ── Cave NPCs ────────────────────────────────────────────────────────────
  npc_miner: [
    "You made it inside! I've been mapping these\ntunnels for three years now.",
    "The underground lake at the far end is stunning.\nJust watch your step near the edge!",
  ],

  // ── Seaside Town NPCs ────────────────────────────────────────────────────
  npc_fisherman: [
    "Mornin'! The water's full of River Carp and\nMarsh Ducks today — good signs for a catch.",
    "Stone Golems like to hide in the shallows near\nthe tide pools. Worth a look if you're patient — and armed.",
  ],
  npc_sailor: [
    "Just got back from a run up the coast.\nNothing but open water past the horizon, far as I've seen.",
    "Someday I'll chart what's out there properly.\nFor now, Seaside Town suits me fine.",
  ],

  // ── Signs ────────────────────────────────────────────────────────────────
  sign_crossroads: [
    "── CROSSROADS ──\n↑ Cave Road    ↓ Seaside Town\n← Deep Forest  → Eastern Plains",
  ],
  sign_cave_entrance: [
    "LIMESTONE CAVERN\nDepth: unknown\n\nEnter at your own risk.",
  ],
  sign_cave_exit: [
    "EXIT ↓\nCrossroads Village — 5 min walk",
  ],
  sign_seaside_road: [
    "↓ SEASIDE TOWN\nFollow the path south to the coast.",
  ],
  sign_seaside_shore: [
    "The shoreline stretches out of sight in both\ndirections. The water glitters in the sun.",
  ],
};
