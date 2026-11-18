/**
 * Quest definitions. Givers are NPCs (zones.ts lists their quest ids); progress is
 * tracked in systems/quests.ts. Dialogue pages are shown in the usual dialogue box.
 */

export type Objective =
  | { kind: "defeat"; speciesId: number; count: number; label: string }
  | { kind: "tame";   speciesId?: number; count: number; label: string }  // any species when omitted
  | { kind: "visit";  zoneId: string; label: string }
  | { kind: "boss";   bossId: string; label: string };

export interface QuestReward {
  gold: number;
  items?: Record<string, number>; // item or gear ids
}

export interface QuestDef {
  id: string;
  title: string;
  giverName: string;
  summary: string;        // one-liner shown in the log
  objective: Objective;
  reward: QuestReward;
  requires?: string;      // quest id that must be done first
  offer: string[];        // dialogue when first offered (quest is accepted afterwards)
  active: string[];       // dialogue while in progress
  ready: string[];        // dialogue on turn-in
}

export const QUESTS: Record<string, QuestDef> = Object.fromEntries(([
  {
    id: "rats", title: "Vermin of the Road", giverName: "Elder Oak",
    summary: "Defeat 4 Giant Rats on the roads.",
    objective: { kind: "defeat", speciesId: 19, count: 4, label: "Giant Rats defeated" },
    reward: { gold: 60, items: { leather_jerkin: 1 } },
    offer: ["Giant Rats have been gnawing our grain stores.\nCould you thin their numbers?", "Four should do. Hunt them in the tall grass\nalong the roads."],
    active: ["The rats still plague us. Keep at it,\nhero."],
    ready: ["Splendid! The granaries are safe again.", "Take this - a small thanks from the village."],
  },
  {
    id: "crows", title: "Crows over the Fields", giverName: "Guard",
    summary: "Defeat 3 Carrion Crows.",
    objective: { kind: "defeat", speciesId: 16, count: 3, label: "Carrion Crows defeated" },
    reward: { gold: 50, items: { lucky_charm: 1 } },
    offer: ["Carrion Crows are picking the fields bare\nand frightening the children.", "Drive off three and I'll make it worth\nyour while."],
    active: ["Still hearing crows overhead. Three, remember."],
    ready: ["Quiet at last! You've earned this.", "A lucky charm - may it bring you better\nluck than it brought me."],
  },
  {
    id: "imps", title: "Stolen Stock", giverName: "Merchant",
    summary: "Defeat 2 Spark Imps raiding the merchant's cart.",
    objective: { kind: "defeat", speciesId: 25, count: 2, label: "Spark Imps defeated" },
    reward: { gold: 90, items: { vigor_amulet: 1 } },
    offer: ["Spark Imps keep snatching goods from my\ncart and zapping my customers!", "Teach two of them a lesson and I'll pay\nyou well."],
    active: ["Those imps are still at it. Two, I'm\ncounting on you."],
    ready: ["Ha! Business is safe. Here - my best amulet,\nat no charge."],
  },
  {
    id: "scout_cave", title: "Into the Cavern", giverName: "Elder Oak",
    summary: "Scout the Limestone Cavern to the north.",
    objective: { kind: "visit", zoneId: "cave" },
    reward: { gold: 70, items: { steel_sword: 1 } },
    requires: "rats",
    offer: ["Now that the grain is safe, I have a bolder\nrequest.", "Lights have been seen in the Limestone\nCavern, north along the main path.\nScout it and report back."],
    active: ["The cavern lies north of the village,\nalong the main road."],
    ready: ["You've seen it with your own eyes. Good.\nThe miners will want to hear of it.", "This blade belonged to a hero of old.\nMay it serve you better than the dust."],
  },
  {
    id: "carp", title: "Carp Season", giverName: "Fisherman Tam",
    summary: "Defeat 3 River Carp tangling the nets.",
    objective: { kind: "defeat", speciesId: 129, count: 3, label: "River Carp defeated" },
    reward: { gold: 70, items: { padded_robe: 1 } },
    offer: ["The carp are thick as thieves today and\nthey're tearing my nets to ribbons.", "Clear out three and the robe's yours."],
    active: ["Nets are still shredded. Three carp!"],
    ready: ["Smooth water at last! Here's the robe I\npromised."],
  },
  {
    id: "golems", title: "Stone Samples", giverName: "Miner Cole",
    summary: "Defeat 2 Stone Golems and bring proof of their toughness.",
    objective: { kind: "defeat", speciesId: 74, count: 2, label: "Stone Golems defeated" },
    reward: { gold: 120, items: { warding_ring: 1 } },
    offer: ["Stone Golems wander the shore - they come\nfrom the same rock as these tunnels.", "Defeat two and I'll learn what makes them\ntick. I'll reward you handsomely."],
    active: ["The golems are down on the Seaside shore.\nTwo of them, mind."],
    ready: ["Remarkable! Cracked clean through - just as\nI suspected.", "Take this ring. It's warded against the\nkind of rot that eats stone."],
  },
  {
    id: "tame_first", title: "A Loyal Beast", giverName: "Sailor Reyes",
    summary: "Tame any monster with a Taming Charm.",
    objective: { kind: "tame", count: 1, label: "Monsters tamed" },
    reward: { gold: 100, items: { hunters_bow: 1 } },
    offer: ["A good hand at sea trusts the beasts around\nhim. Ever tamed one?", "Weaken a monster, then use a Taming Charm\nfrom your pack. Bring one to heel and I'll\nhelp you out."],
    active: ["Weaken one first - a Taming Charm works\nbest on wounded monsters."],
    ready: ["There's a bond! You're a true beastmaster.", "This bow has served me well. Use it."],
  },
  {
    id: "warden", title: "Heart of the Cavern", giverName: "Miner Cole",
    summary: "Defeat the Cavern Warden guarding the underground lake.",
    objective: { kind: "boss", bossId: "cavern_warden", label: "Cavern Warden defeated" },
    reward: { gold: 150, items: { hawks_eye: 1 } },
    requires: "scout_cave",
    offer: ["Something huge sleeps by the underground lake -\nthe Cavern Warden. It's walled off every\ntunnel past it.", "Take it down and the whole cavern opens up.\nBring healing, and bring friends - it hits\nhard and gets worse when wounded."],
    active: ["The Warden sleeps by the lake, north of\nhere. Good luck."],
    ready: ["The tunnels are free! I knew you could do it.", "Take this - I found it deep in the rock.\nIt sees what others miss."],
  },
] as QuestDef[]).map(q => [q.id, q]));

export const QUEST_ORDER = Object.keys(QUESTS);

export function targetCount(q: QuestDef): number {
  return "count" in q.objective ? q.objective.count : 1;
}
