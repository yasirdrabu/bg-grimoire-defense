import type { World } from '@grimoire/shared';
import { PositionComponent } from '../components/Position';
import { AttackComponent } from '../components/Attack';
import { TowerDataComponent } from '../components/TowerData';
import { EnemyDataComponent } from '../components/EnemyData';
import { HealthComponent } from '../components/Health';

export function targetingSystem(world: World, _dt: number): void {
  const towers = world.query(PositionComponent, AttackComponent, TowerDataComponent);
  const enemies = world.query(PositionComponent, HealthComponent, EnemyDataComponent);

  for (const towerId of towers) {
    const towerPos = world.getComponent(towerId, PositionComponent)!;
    const attack = world.getComponent(towerId, AttackComponent)!;

    // Check if current target is still valid
    if (attack.targetId !== null) {
      const targetPos = world.getComponent(attack.targetId, PositionComponent);
      const targetHealth = world.getComponent(attack.targetId, HealthComponent);
      if (targetPos && targetHealth && targetHealth.current > 0) {
        const dist = Math.sqrt(
          (targetPos.gridX - towerPos.gridX) ** 2 +
          (targetPos.gridY - towerPos.gridY) ** 2,
        );
        if (dist <= attack.range) continue; // Keep current target
      }
      attack.targetId = null;
    }

    // Find nearest enemy within range
    let bestDist = Infinity;
    let bestEnemy: number | null = null;

    for (const enemyId of enemies) {
      const enemyPos = world.getComponent(enemyId, PositionComponent)!;
      const enemyHealth = world.getComponent(enemyId, HealthComponent)!;
      const enemyData = world.getComponent(enemyId, EnemyDataComponent)!;

      if (enemyHealth.current <= 0) continue;
      if (enemyData.isFlying && !attack.canTargetAir) continue;

      const dist = Math.sqrt(
        (enemyPos.gridX - towerPos.gridX) ** 2 +
        (enemyPos.gridY - towerPos.gridY) ** 2,
      );

      if (dist <= attack.range && dist < bestDist) {
        bestDist = dist;
        bestEnemy = enemyId;
      }
    }

    attack.targetId = bestEnemy;
  }
}
