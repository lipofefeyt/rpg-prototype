/**
 * Equippable gear. Each party member has three slots; equipped pieces add flat
 * bonuses on top of the level-based stats (see computeStats in creatures.ts).
 * Owned-but-unequipped gear lives in the shared inventory (same id -> count map
 * as consumables), so it saves/loads with no extra plumbing.
 */

export type EquipSlot = "weapon" | "armor" | "trinket";
export const EQUIP_SLOTS: EquipSlot[] = ["weapon", "armor", "trinket"];
export const SLOT_LABELS: Record<EquipSlot, string> = { weapon: "Weapon", armor: "Armor", trinket: "Trinket" };

export type StatKey = "hp" | "atk" | "def" | "spAtk" | "spDef" | "speed";
export type StatBonus = Partial<Record<StatKey, number>>;
export const STAT_LABELS: Record<StatKey, string> = {
  hp: "HP", atk: "ATK", def: "DEF", spAtk: "SPA", spDef: "SPD", speed: "SPE",
};
const STAT_ORDER: StatKey[] = ["hp", "atk", "def", "spAtk", "spDef", "speed"];

export type EquipLoadout = Partial<Record<EquipSlot, string>>;

export interface EquipDef {
  id: string;
  name: string;
  slot: EquipSlot;
  bonus: StatBonus;
  price: number;      // buy price; sells for half
  tier: 1 | 2 | 3;    // 1 = shop/common drop, 2 = deeper drops, 3 = rare
  inShop: boolean;
}

const E = (id: string, name: string, slot: EquipSlot, bonus: StatBonus, price: number, tier: 1 | 2 | 3, inShop = tier === 1): EquipDef =>
  ({ id, name, slot, bonus, price, tier, inShop });

export const EQUIPMENT: Record<string, EquipDef> = Object.fromEntries([
  // Weapons
  E("rusty_sword",   "Rusty Sword",    "weapon",  { atk: 4 },              40, 1),
  E("oak_staff",     "Oak Staff",      "weapon",  { spAtk: 4 },            40, 1),
  E("short_bow",     "Short Bow",      "weapon",  { atk: 3, speed: 3 },    55, 1),
  E("steel_sword",   "Steel Sword",    "weapon",  { atk: 9 },             160, 2),
  E("ember_staff",   "Ember Staff",    "weapon",  { spAtk: 9 },           160, 2),
  E("hunters_bow",   "Hunter's Bow",   "weapon",  { atk: 7, speed: 6 },   170, 2),
  E("runeblade",     "Runeblade",      "weapon",  { atk: 14, spAtk: 6 },  400, 3),
  // Armor
  E("leather_jerkin","Leather Jerkin", "armor",   { def: 3, hp: 6 },       45, 1),
  E("padded_robe",   "Padded Robe",    "armor",   { spDef: 3, hp: 5 },     45, 1),
  E("chainmail",     "Chainmail",      "armor",   { def: 7, hp: 10 },     170, 2),
  E("warded_cloak",  "Warded Cloak",   "armor",   { spDef: 7, def: 3, hp: 8 }, 170, 2),
  E("dragonscale",   "Dragonscale Mail","armor",  { def: 12, spDef: 8, hp: 18 }, 420, 3),
  // Trinkets
  E("lucky_charm",   "Lucky Charm",    "trinket", { speed: 4 },            50, 1),
  E("vigor_amulet",  "Vigor Amulet",   "trinket", { hp: 14 },              60, 1),
  E("warding_ring",  "Warding Ring",   "trinket", { def: 3, spDef: 3 },   150, 2),
  E("hawks_eye",     "Hawk's Eye",     "trinket", { atk: 4, spAtk: 4, speed: 4 }, 320, 3),
].map(e => [e.id, e]));

export const SELL_RATIO = 0.5;

export function isEquipmentId(id: string): boolean { return id in EQUIPMENT; }

export function sellPrice(id: string): number {
  return Math.floor((EQUIPMENT[id]?.price ?? 0) * SELL_RATIO);
}

/** Sum of all bonuses across a loadout. */
export function totalBonus(loadout: EquipLoadout | undefined): StatBonus {
  const total: StatBonus = {};
  for (const slot of EQUIP_SLOTS) {
    const def = loadout?.[slot] ? EQUIPMENT[loadout[slot]!] : undefined;
    if (!def) continue;
    for (const k of STAT_ORDER) if (def.bonus[k]) total[k] = (total[k] ?? 0) + def.bonus[k]!;
  }
  return total;
}

/** "+4 ATK, +3 SPE" */
export function describeBonus(bonus: StatBonus): string {
  return STAT_ORDER.filter(k => bonus[k]).map(k => `+${bonus[k]} ${STAT_LABELS[k]}`).join(", ") || "no bonus";
}

/** Random gear drop for a defeated monster of [level], or null. Higher levels unlock higher tiers. */
export function rollGearDrop(level: number, rng: () => number = Math.random): string | null {
  if (rng() > 0.15) return null;
  const maxTier = level >= 14 ? 3 : level >= 8 ? 2 : 1;
  const pool: string[] = [];
  for (const def of Object.values(EQUIPMENT)) {
    if (def.tier > maxTier) continue;
    // lower tiers are more common: tier1 x6, tier2 x3, tier3 x1
    const weight = def.tier === 1 ? 6 : def.tier === 2 ? 3 : 1;
    for (let i = 0; i < weight; i++) pool.push(def.id);
  }
  return pool.length ? pool[Math.floor(rng() * pool.length)] : null;
}

/** Gold awarded for defeating a monster of [level]. */
export function goldReward(level: number, rng: () => number = Math.random): number {
  return level * 3 + Math.floor(rng() * (level * 2 + 1));
}
