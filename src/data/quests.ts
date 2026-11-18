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
  /** Gear that depends on the player's hero class (so a Mage isn't handed a sword). */
  classItems?: Partial<Record<"knight" | "mage" | "ranger", string>>;
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
    reward: { gold: 70, classItems: { knight: "steel_sword", mage: "ember_staff", ranger: "hunters_bow" } },
    requires: "rats",
    offer: ["Now that the grain is safe, I have a bolder\nrequest.", "Lights have been seen in the Limestone\nCavern, north along the main path.\nScout it and report back."],
    active: ["The cavern lies north of the village,\nalong the main road."],
    ready: ["You've seen it with your own eyes. Good.\nThe miners will want to hear of it.", "This belonged to a hero of old, like you.\nMay it serve you better than the dust."],
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
    reward: { gold: 100, classItems: { knight: "chainmail", mage: "warded_cloak", ranger: "chainmail" } },
    offer: ["A good hand at sea trusts the beasts around\nhim. Ever tamed one?", "Weaken a monster, then use a Taming Charm\nfrom your pack. Bring one to heel and I'll\nhelp you out."],
    active: ["Weaken one first - a Taming Charm works\nbest on wounded monsters."],
    ready: ["There's a bond! You're a true beastmaster.", "This gear has served me well at sea.\nNow it's yours."],
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
  {
    id: "scout_forest", title: "Into the Deep Forest", giverName: "Elder Oak",
    summary: "Scout the Deep Forest to the west.",
    objective: { kind: "visit", zoneId: "forest", label: "Forest scouted" },
    reward: { gold: 90, items: { potion: 3 } },
    requires: "scout_cave",
    offer: ["Good work in the cavern. Now the west road -\nthe Deep Forest.", "Travellers say the trees there seem to... lean\nin. Go and look, and take care."],
    active: ["The Deep Forest is west of here, along the\nroad past the village edge."],
    ready: ["You went in and came back unscathed. Wise\nand lucky!", "Take these draughts. You'll want them out\nthere."],
  },
  {
    id: "scout_plains", title: "Across the Plains", giverName: "Elder Oak",
    summary: "Scout the Eastern Plains.",
    objective: { kind: "visit", zoneId: "plains", label: "Plains scouted" },
    reward: { gold: 110, classItems: { knight: "chainmail", mage: "warded_cloak", ranger: "chainmail" } },
    requires: "scout_forest",
    offer: ["One road remains: east, across the Plains.", "A warband has been seen gathering out there.\nI need to know how bad it is."],
    active: ["East along the main road. The Plains are\nwide and open."],
    ready: ["So it's true - a proper warband. Thank you for\nlooking.", "Armor for the road ahead. You'll need it."],
  },
  {
    id: "wolves", title: "Wolves at the Door", giverName: "Hermit Elm",
    summary: "Defeat 4 Dire Wolves hunting the trail.",
    objective: { kind: "defeat", speciesId: 210, count: 4, label: "Dire Wolves defeated" },
    reward: { gold: 110, items: { potion: 3 } },
    offer: ["Dire Wolves have taken to hunting the trail.\nThey'll have me next.", "Thin the pack - four of them - and I'll make\nit worth your while."],
    active: ["The wolves still prowl the trail. Four,\nhero."],
    ready: ["The howling has stopped. Bless you.", "Take these draughts - brewed from the forest's\nown herbs."],
  },
  {
    id: "briar", title: "The Briarqueen", giverName: "Hermit Elm",
    summary: "Defeat the Briarqueen in her grove in the far west.",
    objective: { kind: "boss", bossId: "briarqueen", label: "Briarqueen defeated" },
    reward: { gold: 250, items: { warding_ring: 1 } },
    requires: "wolves",
    offer: ["The Briarqueen was a guardian once. Now her\nthorns choke everything.", "She sleeps in the grove at the trail's far\nwest end. Fire and venom bite her hardest;\nplain arrows barely scratch her. Be ready."],
    active: ["The grove is at the far west end of the\ntrail. Heal up first."],
    ready: ["The forest feels... lighter already. You did it.", "This ring was my master's. May it keep you\nwhole."],
  },
  {
    id: "hawks", title: "Hawks on the Rooftops", giverName: "Smith Hild",
    summary: "Defeat 3 Dust Hawks stealing from the forge.",
    objective: { kind: "defeat", speciesId: 213, count: 3, label: "Dust Hawks defeated" },
    reward: { gold: 120, items: { lucky_charm: 1 } },
    offer: ["Dust Hawks keep snatching my tools off the\nanvil! Shiny thieves.", "Drive off three and I'll give you something\nlucky."],
    active: ["Still losing tongs to those hawks. Three,\nplease."],
    ready: ["Quiet skies! Take this charm - I made it\nmyself."],
  },
  {
    id: "boars", title: "Boars in the Barley", giverName: "Scout Alder",
    summary: "Defeat 4 Tusked Boars trampling the plains.",
    objective: { kind: "defeat", speciesId: 212, count: 4, label: "Tusked Boars defeated" },
    reward: { gold: 140, items: { potion: 2 } },
    offer: ["Tusked Boars are stampeding through the\nfields, driven by the warband's war-drums.", "Cull four and the herds may settle."],
    active: ["The boars are still stampeding. Four to go."],
    ready: ["The herds are calming. Good hunting!", "Here - spare draughts for the road."],
  },
  {
    id: "grukk", title: "The Warlord", giverName: "Scout Alder",
    summary: "Defeat Warlord Grukk at the war camp in the far east.",
    objective: { kind: "boss", bossId: "warlord_grukk", label: "Warlord Grukk defeated" },
    reward: { gold: 350, items: { potion: 5 } },
    requires: "boars",
    offer: ["Grukk himself holds the camp at the east end\nof the road. Break him and the warband breaks.", "He hits like a landslide - and worse when he's\nhurt. Bring everything you have."],
    active: ["The war camp is at the far east end of the\nroad. Don't go in underprepared."],
    ready: ["The warband's scattering! The plains are safe\nagain.", "You've earned every coin. Spend it wisely."],
  },
] as QuestDef[]).map(q => [q.id, q]));

export const QUEST_ORDER = Object.keys(QUESTS);

export function targetCount(q: QuestDef): number {
  return "count" in q.objective ? q.objective.count : 1;
}
