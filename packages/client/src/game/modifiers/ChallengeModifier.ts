import type { LevelDefinition } from '@grimoire/shared';
import type { ChallengeModifier } from '@grimoire/shared';

/**
 * Returns a modified copy of the level definition with the challenge modifier
 * applied. The original level definition is not mutated.
 */
export function applyChallengeModifiers(
  levelDef: LevelDefinition,
  modifier: ChallengeModifier,
): LevelDefinition {
  const { modifiers } = modifier;

  const startingGold =
    modifiers.startingGoldMultiplier !== undefined
      ? Math.floor(levelDef.startingGold * modifiers.startingGoldMultiplier)
      : levelDef.startingGold;

  const maxNexusHP =
    modifiers.maxNexusHP !== undefined ? modifiers.maxNexusHP : levelDef.maxNexusHP;

  return {
    ...levelDef,
    startingGold,
    maxNexusHP,
  };
}
