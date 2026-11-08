export type ItemKind = "capture" | "heal";

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  healAmount?: number; // only for kind "heal"
}

export const ITEMS: Record<string, ItemDef> = {
  capture_orb: { id: "capture_orb", name: "Capture Orb", kind: "capture" },
  potion:      { id: "potion",      name: "Potion",      kind: "heal", healAmount: 20 },
};

export type Inventory = Record<string, number>;

export function starterInventory(): Inventory {
  return { capture_orb: 5, potion: 3 };
}
