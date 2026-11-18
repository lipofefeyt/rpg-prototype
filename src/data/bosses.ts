/**
 * Boss encounters. A boss is a normal species scaled up (HP / attack multipliers),
 * fought from a visible world NPC. Bosses can't be fled from or tamed, enrage once
 * when worn down, and are one-time fights tracked by a flag (see playerState flags).
 */
export interface BossDef {
  id: string;
  name: string;
  speciesId: number;
  level: number;
  hpMult: number;
  atkMult: number;
  intro: string;            // battle opening line
  enrageAt: number;         // fraction of max HP at which it enrages
  enrageMult: number;       // attack / spAtk multiplier once enraged
  enrageMsg: string;
  defeatMsg: string;
  rewardGold: number;
  rewardExp: number;
  rewardGear: string[];     // one of these is guaranteed on the first win (favouring gear the party can use)
  rewardExtra?: string[];   // always granted on the first win
}

export const BOSSES: Record<string, BossDef> = {
  cavern_warden: {
    id: "cavern_warden",
    name: "Cavern Warden",
    speciesId: 200,
    level: 10,
    hpMult: 1.7,
    atkMult: 0.7,
    intro: "The Cavern Warden grinds awake and bars your path!",
    enrageAt: 0.5,
    enrageMult: 1.25,
    enrageMsg: "The Warden's crystals blaze - it roars with fury!",
    defeatMsg: "The Cavern Warden crumbles into rubble. The cavern falls quiet.",
    rewardGold: 200,
    rewardExp: 160,
    rewardGear: ["runeblade", "dragonscale", "archmage_staff", "archmage_raiment", "windpiercer"],
  },
  briarqueen: {
    id: "briarqueen",
    name: "Briarqueen",
    speciesId: 201,
    level: 15,
    hpMult: 2.0,
    atkMult: 1.0,
    intro: "Brambles knot and twist - the Briarqueen rises to meet you!",
    enrageAt: 0.5,
    enrageMult: 1.25,
    enrageMsg: "Thorns erupt across the Briarqueen's body!",
    defeatMsg: "The Briarqueen withers, and the forest breathes again.",
    rewardGold: 320,
    rewardExp: 300,
    rewardGear: ["runeblade", "dragonscale", "archmage_staff", "archmage_raiment", "windpiercer"],
    rewardExtra: ["heartwood_pendant"],
  },
  warlord_grukk: {
    id: "warlord_grukk",
    name: "Warlord Grukk",
    speciesId: 202,
    level: 18,
    hpMult: 1.8,
    atkMult: 0.8,
    intro: "Warlord Grukk hefts his axe and bellows a challenge!",
    enrageAt: 0.5,
    enrageMult: 1.25,
    enrageMsg: "Grukk roars and swings wild - he's seeing red!",
    defeatMsg: "Warlord Grukk crashes down, his war band scattered.",
    rewardGold: 450,
    rewardExp: 420,
    rewardGear: ["runeblade", "dragonscale", "archmage_staff", "archmage_raiment", "windpiercer"],
    rewardExtra: ["warlords_crest"],
  },
};

export const bossFlag = (id: string) => `boss:${id}`;
