import type { World } from '@grimoire/shared';
import { PositionComponent } from '../components/Position';
import { AttackComponent } from '../components/Attack';
import { TowerDataComponent } from '../components/TowerData';
import { ProjectileComponent } from '../components/Projectile';
import { RenderableComponent } from '../components/Renderable';
import { TowerDisabledComponent } from '../components/TowerDisabled';

export function attackSystem(world: World, dt: number): void {
  const dtSec = dt / 1000;
  const towers = world.query(PositionComponent, AttackComponent, TowerDataComponent);

  for (const towerId of towers) {
    // Skip disabled towers (e.g. stunned by Cave Troll's Tower Smash)
    const disabled = world.getComponent(towerId, TowerDisabledComponent);
    if (disabled && disabled.remainingMs > 0) continue;

    const attack = world.getComponent(towerId, AttackComponent)!;
    const towerPos = world.getComponent(towerId, PositionComponent)!;

    // Tick cooldown
    if (attack.cooldownRemaining > 0) {
      attack.cooldownRemaining -= dtSec;
      continue;
    }

    // Fire if target locked
    if (attack.targetId === null) continue;

    // Spawn projectile entity
    const projectile = world.createEntity();
    world.addComponent(projectile, PositionComponent, {
      gridX: towerPos.gridX,
      gridY: towerPos.gridY,
    });
    world.addComponent(projectile, ProjectileComponent, {
      targetId: attack.targetId,
      speed: 8, // grid cells per second
      damage: attack.damage,
      damageType: attack.damageType,
      statusEffect: attack.statusEffect,
    });
    world.addComponent(projectile, RenderableComponent, {
      spriteKey: `proj_${attack.projectileType}`,
      visible: true,
    });

    // Reset cooldown
    attack.cooldownRemaining = attack.attackSpeed;
  }
}
