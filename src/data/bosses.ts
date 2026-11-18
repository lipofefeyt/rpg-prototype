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
};

export const bossFlag = (id: string) => `boss:${id}`;
