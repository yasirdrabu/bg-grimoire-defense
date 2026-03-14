import type { World, EntityId } from '@grimoire/shared';
import { ENEMIES, getScaledHP } from '@grimoire/shared';
import { PositionComponent } from '../ecs/components/Position';
import { HealthComponent } from '../ecs/components/Health';
import { MovementComponent } from '../ecs/components/Movement';
import { EnemyDataComponent } from '../ecs/components/EnemyData';
import { RenderableComponent } from '../ecs/components/Renderable';
import { StatusEffectsComponent } from '../ecs/components/StatusEffects';

export function createEnemyEntity(
  world: World,
  enemyType: string,
  spawnX: number,
  spawnY: number,
  path: [number, number][],
  act: number,
  levelIndex: number,
): EntityId {
  const def = ENEMIES[enemyType];
  if (!def) throw new Error(`Unknown enemy type: ${enemyType}`);

  const hp = getScaledHP(def.baseHP, act, levelIndex);
  const entity = world.createEntity();

  world.addComponent(entity, PositionComponent, { gridX: spawnX, gridY: spawnY });
  world.addComponent(entity, HealthComponent, { current: hp, max: hp });
  world.addComponent(entity, MovementComponent, {
    speed: def.speed,
    path,
    pathIndex: 0,
    slowMultiplier: 1,
    gridVersion: 0,
  });
  world.addComponent(entity, EnemyDataComponent, {
    enemyId: enemyType,
    goldReward: def.goldReward,
    scoreValue: def.scoreValue,
    abilityType: def.abilityType,
    isFlying: def.isFlying,
    isBoss: def.isBoss,
  });
  world.addComponent(entity, RenderableComponent, {
    spriteKey: enemyType,
    visible: true,
  });
  world.addComponent(entity, StatusEffectsComponent, {
    effects: [],
  });

  return entity;
}
