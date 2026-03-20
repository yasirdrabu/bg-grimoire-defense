export interface ChallengeModifier {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly modifiers: {
    readonly enemyHPMultiplier?: number;
    readonly enemySpeedMultiplier?: number;
    readonly startingGoldMultiplier?: number;
    readonly maxNexusHP?: number;
    readonly bannedTowerRoles?: string[];
  };
}

export const CHALLENGE_MODIFIERS: Record<string, ChallengeModifier> = {
  no_utility: {
    id: 'no_utility',
    name: 'No Utility Towers',
    description: 'Cannot build utility towers',
    modifiers: { bannedTowerRoles: ['utility'] },
  },
  double_speed: {
    id: 'double_speed',
    name: 'Double Speed Enemies',
    description: 'All enemies move twice as fast',
    modifiers: { enemySpeedMultiplier: 2 },
  },
  limited_gold: {
    id: 'limited_gold',
    name: 'Limited Gold',
    description: 'Start with 50% gold',
    modifiers: { startingGoldMultiplier: 0.5 },
  },
  fragile_nexus: {
    id: 'fragile_nexus',
    name: 'Fragile Nexus',
    description: 'Nexus has only 1 HP',
    modifiers: { maxNexusHP: 1 },
  },
};
