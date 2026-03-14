import type { World, EntityId } from '@grimoire/shared';
import { TOWERS } from '@grimoire/shared';
import { PositionComponent } from '../ecs/components/Position';
import { AttackComponent } from '../ecs/components/Attack';
import { TowerDataComponent } from '../ecs/components/TowerData';
import { RenderableComponent } from '../ecs/components/Renderable';

export function createTowerEntity(
  world: World,
  towerType: string,
  gridX: number,
  gridY: number,
): EntityId {
  const def = TOWERS[towerType];
  if (!def) throw new Error(`Unknown tower type: ${towerType}`);

  const entity = world.createEntity();

  world.addComponent(entity, PositionComponent, { gridX, gridY });

  world.addComponent(entity, AttackComponent, {
    range: def.range,
    damage: def.damage,
    damageType: def.damageType,
    attackSpeed: def.attackSpeed,
    cooldownRemaining: 0,
    targetId: null,
    targetingMode: 'nearest',
    projectileType: def.projectileType,
    canTargetAir: def.canTargetAir,
    statusEffect: def.statusEffect,
    splashRadius: def.splashRadius,
    pierceCount: def.pierceCount,
  });

  world.addComponent(entity, TowerDataComponent, {
    towerId: towerType,
    tier: 1,
    totalInvestment: def.cost,
    isFusion: false,
  });

  world.addComponent(entity, RenderableComponent, {
    spriteKey: towerType,
    visible: true,
  });

  return entity;
}
