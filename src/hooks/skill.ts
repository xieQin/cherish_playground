import {
  Action,
  ICost,
  ISkill,
  Phase,
  PlayerPosition,
  SkillCombatType,
  SummonsID,
} from "@/models";
import { DamageTarget } from "@/models/damage";
import { useGameStore } from "@/stores";
import { isCostDiceValid, NameIDTrans } from "@/utils";

export const useSkill = (pos: PlayerPosition) => {
  const {
    dices: playerDices,
    activeCharacters,
    phase,
    players,
    activeSkills,
    actions,
    addSummon,
    setGameStates,
  } = useGameStore();
  const dices = playerDices[pos];

  const onCastSkill = () => {
    const skill = activeSkills[pos];
    const use_skill =
      players[pos].characters[activeCharacters[pos]].skills[skill];
    setGameStates("actions", [
      Action.CastSkill,
      actions[PlayerPosition.Opponent],
    ]);
    if (use_skill.summons.length > 0) {
      const summons = use_skill.summons;
      addSummon(summons.map(s => NameIDTrans(s)) as SummonsID[], pos);
    }
  };

  const shouldTargetHighlight = (index: number) => {
    if (phase !== Phase.Skill) return false;
    if (pos === PlayerPosition.Own) return index === activeCharacters[pos];
    const enemy = Math.abs(pos - 1);
    const activeSkill = activeSkills[enemy];
    const skill =
      players[enemy].characters[activeCharacters[enemy]].skills[activeSkill];
    const damage = skill.damage;
    for (const d of damage) {
      if (d.target === DamageTarget.Active && index === activeCharacters[pos]) {
        return true;
      }
      if (d.target === DamageTarget.All && d.damage > 0) {
        return true;
      }
      if (d.target === DamageTarget.Back && d.damage > 0) {
        return true;
      }
    }
    return false;
  };

  const isSkillValid = (costs: ICost[] = []) => isCostDiceValid(costs, dices);

  const isEnergyValid = (skill: ISkill) => {
    if (pos === PlayerPosition.Opponent) return false;
    if (skill.type.includes(SkillCombatType.ElementalBurst)) {
      const character = players[pos].characters[activeCharacters[pos]];
      return character.currentEnergy === character.energy;
    }
    return true;
  };

  // todo calculate skill damage
  const calDamage = (idx: number) => {
    const enemy = Math.abs(pos - 1);
    const activeSkill = activeSkills[enemy];
    const skill =
      players[enemy].characters[activeCharacters[enemy]].skills[activeSkill];
    if (idx === activeCharacters[pos]) return skill.damage[0].damage;
    return skill.damage[1].damage;
  };

  const getMessage = (skill: ISkill) => {
    return skill;
  };

  const getSkillAnimation = () => {
    const own = activeCharacters[PlayerPosition.Own];
    const opponent = activeCharacters[PlayerPosition.Opponent];
    if (own === opponent) return 1;
    if (own - opponent === -1) return 2;
    if (own - opponent === 1) return 3;
    if (own - opponent === -2) return 4;
    if (own - opponent === 2) return 5;
    return "";
  };

  return {
    getMessage,
    isSkillValid,
    isEnergyValid,
    onCastSkill,
    shouldTargetHighlight,
    calDamage,
    getSkillAnimation,
  };
};
