export type ItemKind = "capture" | "heal";

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  healAmount?: number; // only for kind "heal"
  price: number;       // shop buy price
  desc: string;
}

export const ITEMS: Record<string, ItemDef> = {
  capture_orb: { id: "capture_orb", name: "Taming Charm", kind: "capture", price: 40, desc: "Binds a weakened monster to your service. Works best on wounded foes. Battle only." },
  potion:      { id: "potion",      name: "Healing Draught",      kind: "heal", healAmount: 20, price: 25, desc: "Restores 20 HP. Use in battle or from the menu." },
};

export type Inventory = Record<string, number>;

export function starterInventory(): Inventory {
  return { capture_orb: 5, potion: 3 };
}
