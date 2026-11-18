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
    "Welcome, traveller! Blades, bows, charms and\ndraughts - everything a hero needs.",
    "Monsters carry coin, and sometimes a good\nweapon. Bring me what you find, or buy fresh.",
  ],

  npc_innkeeper: [
    "Welcome to the Wayfarer's Rest! Hot meals,\nsoft beds, and no questions about the mud.",
    "A night's sleep will patch up you and your\ncompanions - bruises, poisons and all.",
  ],

  // ── Cave NPCs ────────────────────────────────────────────────────────────
  npc_miner: [
    "You made it inside! I've been mapping these\ntunnels for three years now.",
    "The underground lake at the far end is stunning.\nJust watch your step near the edge!",
  ],

  // ── Bosses ──────────────────────────────────────────────────────────────
  boss_warden_intro: [
    "A colossus of stone and violet crystal sits\nbeside the lake, utterly still...",
    "Its eyes flare red. The Cavern Warden rises!",
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

  npc_innkeeper2: [
    "Evening, traveller. The sea air does wonders\nfor weary bones.",
    "Take a bed and I'll have your whole party\nback on their feet by morning.",
  ],

  // ── Deep Forest ─────────────────────────────────────────────────────────
  npc_hermit: [
    "The forest is quieter when you listen. Lately it\nhas been... holding its breath.",
    "Stay on the trail, hero. The Briarqueen's\nthorns reach further every season.",
  ],
  boss_briarqueen_intro: [
    "Brambles knot into the shape of a woman,\ncrowned in thorns and a single red rose...",
    "\"Trespasser. The forest is mine. Turn back, or\nbe woven into it.\"",
  ],
  sign_forest_entrance: [
    "DEEP FOREST\nThe trail winds west. Beware wolves, brambles -\nand whatever sleeps in the grove.",
  ],

  // ── Eastern Plains ──────────────────────────────────────────────────────
  npc_smith: [
    "Smith Hild's the name. I forge what the road\nbreaks - blades, bows, mail, all of it.",
    "My stock's a step above the village merchant's.\nCome and look.",
  ],
  npc_innkeeper3: [
    "Welcome to the outpost! Beds are clean and the\nstew is hot.",
    "Rest up. Grukk's warband won't wait forever.",
  ],
  npc_scout: [
    "I watch the camp from here. Grukk's warband\ngrows bolder every week.",
    "The plains are wide, but all roads east lead to\nhis axe.",
  ],
  boss_grukk_intro: [
    "A towering warlord looms over a ring of stolen\ncarts, a great axe across his shoulders.",
    "\"Another little hero wants my head? Come, then.\nGrukk likes a challenge!\"",
  ],
  sign_plains_outpost: [
    "EASTERN OUTPOST\nSmith - Inn - Scout post",
  ],
  sign_plains_camp: [
    "WARCAMP AHEAD\nTurn back unless you want trouble.",
  ],

  // ── Signs ────────────────────────────────────────────────────────────────
  sign_crossroads: [
    "── CROSSROADS ──\n↑ Cave Road    ↓ Seaside Town\n← Deep Forest  → Eastern Plains",
  ],
  sign_inn: [
    "THE WAYFARER'S REST\nBeds & hot meals - rest heals your whole party.",
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
