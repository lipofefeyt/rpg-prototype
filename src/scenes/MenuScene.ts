import Phaser from "phaser";
import {
  EQUIPMENT, EQUIP_SLOTS, SLOT_LABELS, canEquip, classOf, describeBonus, sellPrice, slotOpenTo, usableText,
  type EquipLoadout, type EquipSlot,
} from "@/data/equipment";
import { ITEMS } from "@/data/items";
import { computeStats, type BattleCreature, type ComputedStats } from "@/data/creatures";
import {
  addGold, addToInventory, equipItem, getGold, getInventory, getParty, healParty, innCost, partyNeedsRest, setInventory,
} from "@/systems/playerState";
import { autosave } from "@/systems/saveLoad";
import { fillPanel, strokePanel, cut } from "@/gfx/panel";
import { QUESTS, QUEST_ORDER } from "@/data/quests";
import { getQuestLog, progressText, rewardText } from "@/systems/quests";
import type { WorldScene } from "@/scenes/WorldScene";
import { centerFixedLayout } from "@/config";

/**
 * Pause menu (Equipment / Pack) and the merchant's shop, as one list-driven scene.
 * Opened by WorldScene (which pauses itself and UIScene); closing resumes both.
 *
 * Each screen is a factory returning rows + an info panel, re-evaluated on every
 * render so it always reflects current gold / inventory / stats. Works with keyboard
 * (arrows, Z, X) and touch (tap a row, BACK, and the scroll arrows).
 */

const W = 480, H = 320;
/** Panel colour: the old 0.9-alpha fill pre-blended over the opaque scene background (see gfx/panel.ts for how panels are drawn). */
const PANEL_FILL = 0x0b0f2e;
const ROW_H = 24, VISIBLE = 9, LIST_X = 8, LIST_Y = 34, LIST_W = 274;
const INFO_X = 290, INFO_W = 182;

interface Row { label: string; sub?: string; enabled?: boolean; act?: () => void }
interface Screen {
  title: string;
  rows: Row[];
  /** Info-panel lines for the highlighted row (index may be -1 if there are no rows). */
  info: (idx: number) => string[];
}
interface Frame { make: () => Screen; cursor: number; scroll: number }

export interface MenuInit { mode: "pause" | "shop" | "inn"; shop?: string }

const STAT_ROWS: [string, keyof ComputedStats][] = [
  ["HP", "maxHp"], ["ATK", "atk"], ["DEF", "def"], ["SPA", "spAtk"], ["SPD", "spDef"], ["SPE", "speed"],
];

export class MenuScene extends Phaser.Scene {
  private mode: MenuInit["mode"] = "pause";
  private shopId = "village";
  private stack: Frame[] = [];
  private flash = "";
  private readyAt = 0;
  private busy = false; // true during the rest fade: ignore all input

  private gfx!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private footText!: Phaser.GameObjects.Text;
  private upArrow!: Phaser.GameObjects.Text;
  private downArrow!: Phaser.GameObjects.Text;
  private labels: Phaser.GameObjects.Text[] = [];
  private subs: Phaser.GameObjects.Text[] = [];
  private zones: Phaser.GameObjects.Zone[] = [];
  private zoneRow: number[] = []; // list index each zone currently represents
  private keys!: Record<"up" | "down" | "ok" | "back" | "esc" | "m", Phaser.Input.Keyboard.Key>;

  constructor() { super({ key: "MenuScene" }); }

  init(data: MenuInit) { this.mode = data?.mode ?? "pause"; this.shopId = data?.shop ?? "village"; }

  create() {
    this.stack = [];
    this.flash = "";
    this.busy = false;
    this.labels = []; this.subs = []; this.zones = []; this.zoneRow = [];
    this.readyAt = this.time.now + 220; // ignore the key press that opened us

    centerFixedLayout(this, 0x08091a);
    this.add.rectangle(-1000, 0, W + 2000, H, 0x08091a).setOrigin(0);
    this.gfx = this.add.graphics();
    const mono = (size: number, color: string) => ({ fontSize: `${size}px`, color, fontFamily: "monospace" });

    this.titleText = this.add.text(12, 8, "", { ...mono(13, "#ddeeff"), fontStyle: "bold" });
    this.goldText = this.add.text(W - 12, 9, "", mono(12, "#ffdd66")).setOrigin(1, 0);

    for (let i = 0; i < VISIBLE; i++) {
      const y = LIST_Y + 4 + i * ROW_H;
      this.labels.push(this.add.text(LIST_X + 10, y + 5, "", mono(11, "#e8eeff")));
      this.subs.push(this.add.text(LIST_X + LIST_W - 8, y + 6, "", mono(9, "#aabbcc")).setOrigin(1, 0));
      this.zoneRow.push(-1);
      const zone = this.add.zone(LIST_X, y, LIST_W, ROW_H).setOrigin(0).setInteractive();
      zone.on("pointerdown", () => {
        const idx = this.zoneRow[i];
        if (idx >= 0) { this.top().cursor = idx; this.activate(); }
      });
      this.zones.push(zone);
    }

    this.infoText = this.add.text(INFO_X + 8, LIST_Y + 8, "", {
      ...mono(10, "#c8d4f4"), wordWrap: { width: INFO_W - 16 }, lineSpacing: 3,
    });
    this.footText = this.add.text(12, 268, "", { ...mono(11, "#ffdd88"), wordWrap: { width: W - 24 } });

    // Scroll arrows + BACK for touch players.
    const arrow = (x: number, y: number, ch: string, dy: number) => {
      const t = this.add.text(x, y, ch, mono(14, "#6688cc")).setOrigin(0.5).setInteractive();
      t.on("pointerdown", () => this.move(dy));
      return t;
    };
    this.upArrow = arrow(LIST_X + LIST_W - 12, LIST_Y + 12, "▲", -1);
    this.downArrow = arrow(LIST_X + LIST_W - 12, LIST_Y + 222 - 12, "▼", 1);

    const back = this.add.rectangle(W - 12 - 40, H - 22, 80, 26, 0x0d1a3a)
      .setStrokeStyle(1.5, 0x4488ff).setInteractive();
    back.on("pointerdown", () => this.back());
    this.add.text(W - 12 - 40, H - 22, "BACK", mono(11, "#aaccff")).setOrigin(0.5);
    this.add.text(12, H - 18, "↑↓ Move   Z Select   X Back", mono(9, "#3a4668"));

    const KC = Phaser.Input.Keyboard.KeyCodes;
    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey(KC.UP), down: kb.addKey(KC.DOWN), ok: kb.addKey(KC.Z),
      back: kb.addKey(KC.X), esc: kb.addKey(KC.ESC), m: kb.addKey(KC.M),
    };

    const root = this.mode === "shop" ? () => this.shopRoot() : this.mode === "inn" ? () => this.innRoot() : () => this.pauseRoot();
    this.stack.push({ make: root, cursor: 0, scroll: 0 });
    this.render();
  }

  update() {
    if (this.busy || this.time.now < this.readyAt) return;
    const JD = Phaser.Input.Keyboard.JustDown;
    if (JD(this.keys.up)) this.move(-1);
    else if (JD(this.keys.down)) this.move(1);
    else if (JD(this.keys.ok)) this.activate();
    else if (JD(this.keys.back) || JD(this.keys.esc) || JD(this.keys.m)) this.back();
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  private top(): Frame { return this.stack[this.stack.length - 1]; }

  private push(make: () => Screen) {
    this.flash = "";
    this.stack.push({ make, cursor: 0, scroll: 0 });
    this.render();
  }

  private back() {
    if (this.busy) return;
    if (this.stack.length <= 1) { this.close(); return; }
    this.flash = "";
    this.stack.pop();
    this.render();
  }

  private move(dy: number) {
    if (this.busy) return;
    const f = this.top();
    const n = f.make().rows.length;
    if (n === 0) return;
    f.cursor = (f.cursor + dy + n) % n;
    this.render();
  }

  private activate() {
    if (this.busy) return;
    const row = this.top().make().rows[this.top().cursor];
    if (!row || row.enabled === false || !row.act) return;
    row.act();
    this.render(); // act() may have changed gold/inventory/stack
  }

  private close() {
    const world = this.scene.get("WorldScene") as WorldScene;
    autosave(this.game, world.getSaveState());
    this.scene.resume("WorldScene");
    this.scene.resume("UIScene");
    this.scene.stop();
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  private render() {
    const f = this.top();
    const screen = f.make();
    const n = screen.rows.length;
    f.cursor = Math.min(f.cursor, Math.max(0, n - 1));
    if (f.cursor < f.scroll) f.scroll = f.cursor;
    if (f.cursor >= f.scroll + VISIBLE) f.scroll = f.cursor - VISIBLE + 1;
    f.scroll = Math.max(0, Math.min(f.scroll, Math.max(0, n - VISIBLE)));

    this.titleText.setText(screen.title);
    this.goldText.setText(`${getGold(this.game)} gold`);

    const g = this.gfx;
    g.clear();
    for (const [px, pw] of [[LIST_X, LIST_W], [INFO_X, INFO_W]] as [number, number][]) {
      g.fillStyle(PANEL_FILL, 1);    fillPanel(g, px, LIST_Y, pw, 222, cut(6));
      g.fillStyle(0x1e2f88, 0.8);    strokePanel(g, px, LIST_Y, pw, 222, cut(6), 1);
    }

    for (let i = 0; i < VISIBLE; i++) {
      const idx = f.scroll + i;
      const row = screen.rows[idx];
      this.zoneRow[i] = row ? idx : -1;
      this.labels[i].setVisible(!!row);
      this.subs[i].setVisible(!!row);
      if (!row) { this.zones[i].disableInteractive(); continue; }
      this.zones[i].setInteractive();

      const y = LIST_Y + 4 + i * ROW_H;
      const sel = idx === f.cursor;
      if (sel) {
        g.fillStyle(0x1a3a7a, 1); g.fillRect(LIST_X + 4, y, LIST_W - 8, ROW_H - 2);
        g.lineStyle(1.5, 0x4488ff, 1); g.strokeRect(LIST_X + 4, y, LIST_W - 8, ROW_H - 2);
      }
      const on = row.enabled !== false;
      this.labels[i].setText(row.label).setColor(on ? "#e8eeff" : "#5a6482");
      this.subs[i].setText(row.sub ?? "").setColor(on ? "#aabbcc" : "#4a5472");
    }

    this.upArrow.setVisible(f.scroll > 0);
    this.downArrow.setVisible(f.scroll + VISIBLE < n);
    this.infoText.setText(screen.info(n ? f.cursor : -1).join("\n"));
    this.footText.setText(this.flash);
  }

  // ── Shared helpers ──────────────────────────────────────────────────────────

  private party(): BattleCreature[] { return getParty(this.game); }

  /** Stat block for a creature; with [hypo], shows "cur → new (+d)" for each changed stat. */
  private statLines(c: BattleCreature, hypo?: EquipLoadout): string[] {
    const cur = computeStats(c.speciesId, c.level, c.equipment);
    const nxt = hypo ? computeStats(c.speciesId, c.level, hypo) : cur;
    return STAT_ROWS.map(([label, key]) => {
      if (!hypo) return `${label.padEnd(4)} ${key === "maxHp" ? `${c.currentHp}/${cur.maxHp}` : cur[key]}`;
      const d = nxt[key] - cur[key];
      return d === 0 ? `${label.padEnd(4)} ${cur[key]}` : `${label.padEnd(4)} ${cur[key]} → ${nxt[key]} (${d > 0 ? "+" : ""}${d})`;
    });
  }

  private gearName(id: string | undefined): string { return id ? EQUIPMENT[id]?.name ?? id : "—"; }

  private ownedGear(slot?: EquipSlot): string[] {
    const inv = getInventory(this.game);
    return Object.keys(EQUIPMENT).filter(id => (inv[id] ?? 0) > 0 && (!slot || EQUIPMENT[id].slot === slot));
  }

  // ── Pause menu ──────────────────────────────────────────────────────────────

  private pauseRoot(): Screen {
    return {
      title: "MENU",
      rows: [
        { label: "Equipment", sub: "gear up your party", act: () => this.push(() => this.partyPicker()) },
        { label: "Quests", sub: this.questSummary(), act: () => this.push(() => this.questLog()) },
        { label: "Pack", sub: "items & spare gear", act: () => this.push(() => this.pack()) },
        { label: "Close", act: () => this.close() },
      ],
      info: (i) => [
        ["Equip weapons, armor and trinkets. Gear adds flat bonuses to a fighter's stats.",
         "Review the tasks people have given you.",
         "Use healing items, and review spare gear.",
         "Back to the road."][i] ?? "",
      ],
    };
  }

  private questSummary(): string {
    const log = getQuestLog(this.game);
    const active = Object.values(log).filter(s => s.status === "active").length;
    const ready = Object.values(log).filter(s => s.status === "ready").length;
    return ready ? `${ready} ready!` : active ? `${active} active` : "none yet";
  }

  private questLog(): Screen {
    const log = getQuestLog(this.game);
    // Ready first, then active, then done.
    const rank = { ready: 0, active: 1, done: 2 } as const;
    const ids = QUEST_ORDER.filter(id => log[id])
      .sort((a, b) => rank[log[a].status] - rank[log[b].status]);
    const rows: Row[] = ids.map(id => {
      const st = log[id].status;
      return {
        label: QUESTS[id].title,
        sub: st === "ready" ? "ready!" : st === "done" ? "done" : progressText(this.game, QUESTS[id]).replace(/^.*: /, ""),
        enabled: st !== "done",
      };
    });
    if (!rows.length) rows.push({ label: "(no quests yet)", enabled: false });
    return {
      title: "QUESTS",
      rows,
      info: (i) => {
        const q = ids[i] ? QUESTS[ids[i]] : null;
        if (!q) return ["Talk to people with a ! over their head to pick up quests."];
        const st = log[q.id].status;
        return [
          q.title, "", q.summary, "", progressText(this.game, q), "",
          `Reward: ${rewardText(this.game, q)}`,
          st === "ready" ? `Return to ${q.giverName}.` : st === "done" ? "Completed." : `Giver: ${q.giverName}`,
        ];
      },
    };
  }

  private partyPicker(): Screen {
    const party = this.party();
    return {
      title: "EQUIPMENT — Choose a fighter",
      rows: party.map((c, i) => ({
        label: `${c.name}  Lv.${c.level}`,
        sub: `HP ${c.currentHp}/${c.maxHp}`,
        act: () => this.push(() => this.memberScreen(i)),
      })),
      info: (i) => (party[i] ? [party[i].name, "", ...this.statLines(party[i])] : []),
    };
  }

  private memberScreen(idx: number): Screen {
    const c = this.party()[idx];
    return {
      title: `${c?.name ?? "?"} — Gear`,
      rows: EQUIP_SLOTS.map(slot => {
        const open = !c || slotOpenTo(classOf(c.speciesId), slot);
        return {
          label: SLOT_LABELS[slot],
          sub: open ? this.gearName(c?.equipment?.[slot]) : "heroes only",
          enabled: open,
          act: () => this.push(() => this.gearList(idx, slot)),
        };
      }),
      info: (i) => {
        if (!c) return [];
        const slot = EQUIP_SLOTS[i];
        const id = i >= 0 ? c.equipment?.[slot] : undefined;
        const note = slot && !slotOpenTo(classOf(c.speciesId), slot) ? "Beasts can only wear trinkets."
          : id ? `${EQUIPMENT[id].name}: ${describeBonus(EQUIPMENT[id].bonus)}` : "Nothing equipped.";
        return [...this.statLines(c), "", note];
      },
    };
  }

  private gearList(idx: number, slot: EquipSlot): Screen {
    const c = this.party()[idx];
    const inv = getInventory(this.game);
    const equipped = c?.equipment?.[slot];
    const cls = c ? classOf(c.speciesId) : "beast";
    const ids = this.ownedGear(slot).filter(id => canEquip(cls, EQUIPMENT[id]));
    const hidden = this.ownedGear(slot).length - ids.length; // spare gear this fighter can't use

    const rows: Row[] = [];
    const actions: (() => EquipLoadout)[] = []; // hypothetical loadout per row, for the info panel
    if (equipped) {
      rows.push({
        label: "(Unequip)", sub: this.gearName(equipped),
        act: () => { equipItem(this.game, c, slot, null); this.flash = `Removed ${EQUIPMENT[equipped].name}.`; this.stack.pop(); },
      });
      actions.push(() => { const l = { ...c.equipment }; delete l[slot]; return l; });
    }
    for (const id of ids) {
      rows.push({
        label: EQUIPMENT[id].name, sub: `x${inv[id]}  ${describeBonus(EQUIPMENT[id].bonus)}`,
        act: () => { equipItem(this.game, c, slot, id); this.flash = `Equipped ${EQUIPMENT[id].name}.`; this.stack.pop(); },
      });
      actions.push(() => ({ ...c.equipment, [slot]: id }));
    }
    if (!rows.length) rows.push({ label: "(no usable gear)", sub: SLOT_LABELS[slot], enabled: false });

    return {
      title: `${c?.name ?? "?"} — ${SLOT_LABELS[slot]}`,
      rows,
      info: (i) => {
        if (c && actions[i]) return this.statLines(c, actions[i]());
        return [
          "Win fights or visit the merchant to find more gear.",
          ...(hidden > 0 ? ["", `${hidden} spare piece${hidden > 1 ? "s" : ""} in your pack can't be used by ${c?.name ?? "this fighter"}.`] : []),
        ];
      },
    };
  }

  private pack(): Screen {
    const inv = getInventory(this.game);
    const rows: Row[] = [];
    const info: string[][] = [];
    for (const [id, item] of Object.entries(ITEMS)) {
      if ((inv[id] ?? 0) <= 0) continue;
      const usable = item.kind === "heal";
      rows.push({
        label: item.name, sub: usable ? `x${inv[id]}` : `x${inv[id]}  (battle)`, enabled: usable,
        act: () => this.push(() => this.healTarget(id)),
      });
      info.push([item.desc]);
    }
    for (const id of this.ownedGear()) {
      rows.push({ label: EQUIPMENT[id].name, sub: `x${inv[id]}  ${SLOT_LABELS[EQUIPMENT[id].slot]}`, enabled: false });
      info.push([`${EQUIPMENT[id].name}`, describeBonus(EQUIPMENT[id].bonus), `Usable by: ${usableText(EQUIPMENT[id])}`, "", "Equip it from the Equipment menu."]);
    }
    if (!rows.length) { rows.push({ label: "(empty)", enabled: false }); info.push(["Your pack is empty."]); }
    return { title: "PACK", rows, info: (i) => info[i] ?? [] };
  }

  private healTarget(itemId: string): Screen {
    const party = this.party();
    const item = ITEMS[itemId];
    return {
      title: `Use ${item.name} on…`,
      rows: party.map(c => ({
        label: c.name, sub: `HP ${c.currentHp}/${c.maxHp}`,
        enabled: c.currentHp > 0 && c.currentHp < c.maxHp,
        act: () => {
          const inv = getInventory(this.game);
          if ((inv[itemId] ?? 0) <= 0) return;
          inv[itemId]--;
          setInventory(this.game, inv);
          const before = c.currentHp;
          c.currentHp = Math.min(c.maxHp, c.currentHp + (item.healAmount ?? 0));
          this.flash = `${c.name} recovers ${c.currentHp - before} HP.`;
          if ((inv[itemId] ?? 0) <= 0) this.stack.pop();
        },
      })),
      info: (i) => (party[i] ? this.statLines(party[i]) : []),
    };
  }

  // ── Inn ─────────────────────────────────────────────────────────────────────

  private innRoot(): Screen {
    const cost = innCost(this.game);
    const gold = getGold(this.game);
    const needs = partyNeedsRest(this.game);
    const party = this.party();
    return {
      title: "INN — The Wayfarer's Rest",
      rows: [
        {
          label: "Rest", sub: needs ? `${cost}g` : "all rested",
          enabled: needs && gold >= cost,
          act: () => this.rest(cost),
        },
        { label: "Leave", act: () => this.close() },
      ],
      info: (i) => {
        if (i === 1) return ["Safe travels."];
        const lines = party.map(c => `${c.name.padEnd(12).slice(0, 12)} ${c.currentHp}/${c.maxHp}`);
        const note = !needs ? "Everyone is already rested."
          : gold < cost ? `You need ${cost} gold for a room.`
          : `A room costs ${cost} gold. You'll wake at dawn, fully healed.`;
        return [...lines, "", note];
      },
    };
  }

  /** Pay, fade to black, heal everyone, jump the clock to morning, fade back in. */
  private rest(cost: number) {
    this.busy = true;
    const cam = this.cameras.main;
    cam.fadeOut(450, 0, 0, 0);
    cam.once("camerafadeoutcomplete", () => {
      addGold(this.game, -cost);
      healParty(this.game);
      (this.scene.get("WorldScene") as WorldScene).advanceToMorning();
      this.flash = "You sleep soundly and wake at dawn. Everyone is fully healed.";
      this.render();
      cam.fadeIn(450, 0, 0, 0);
      cam.once("camerafadeincomplete", () => { this.busy = false; });
    });
  }

  // ── Shop ────────────────────────────────────────────────────────────────────

  private shopRoot(): Screen {
    return {
      title: this.shopId === "outpost" ? "OUTPOST SMITH" : "MERCHANT",
      rows: [
        { label: "Buy", sub: "supplies & gear", act: () => this.push(() => this.shopBuy()) },
        { label: "Sell", sub: "spare gear for coin", act: () => this.push(() => this.shopSell()) },
        { label: "Leave", act: () => this.close() },
      ],
      info: (i) => [["Charms, draughts and starter gear.", "I'll buy any spare gear at half price.", "Safe travels."][i] ?? ""],
    };
  }

  private shopBuy(): Screen {
    const gold = getGold(this.game);
    interface Good { id: string; name: string; price: number; info: string[] }
    const goods: Good[] = [
      ...Object.values(ITEMS).map(it => ({ id: it.id, name: it.name, price: it.price, info: [it.desc] })),
      ...Object.values(EQUIPMENT).filter(e => e.shop === this.shopId).map(e => ({
        id: e.id, name: e.name, price: e.price,
        info: [SLOT_LABELS[e.slot], describeBonus(e.bonus), `Usable by: ${usableText(e)}`,
          this.party().some(c => canEquip(classOf(c.speciesId), e)) ? "Someone in your party can use it." : "Nobody in your party can use it."],
      })),
    ];
    const inv = getInventory(this.game);
    return {
      title: `${this.shopId === "outpost" ? "SMITH" : "MERCHANT"} — Buy`,
      rows: goods.map(gd => ({
        label: gd.name, sub: `${gd.price}g`, enabled: gold >= gd.price,
        act: () => {
          addGold(this.game, -gd.price);
          addToInventory(this.game, gd.id);
          this.flash = `Bought ${gd.name} for ${gd.price} gold.`;
        },
      })),
      info: (i) => (goods[i] ? [...goods[i].info, "", `You own: ${inv[goods[i].id] ?? 0}`] : []),
    };
  }

  private shopSell(): Screen {
    const inv = getInventory(this.game);
    const ids = this.ownedGear();
    const rows: Row[] = ids.map(id => ({
      label: EQUIPMENT[id].name, sub: `x${inv[id]}  ${sellPrice(id)}g`,
      act: () => {
        const cur = getInventory(this.game);
        cur[id] = Math.max(0, (cur[id] ?? 0) - 1);
        setInventory(this.game, cur);
        addGold(this.game, sellPrice(id));
        this.flash = `Sold ${EQUIPMENT[id].name} for ${sellPrice(id)} gold.`;
      },
    }));
    if (!rows.length) rows.push({ label: "(no spare gear)", enabled: false });
    return {
      title: `${this.shopId === "outpost" ? "SMITH" : "MERCHANT"} — Sell`,
      rows,
      info: (i) => (ids[i]
        ? [EQUIPMENT[ids[i]].name, describeBonus(EQUIPMENT[ids[i]].bonus), `Usable by: ${usableText(EQUIPMENT[ids[i]])}`, "", "Equipped gear can't be sold - unequip it first."]
        : ["Only spare gear can be sold."]),
    };
  }
}
