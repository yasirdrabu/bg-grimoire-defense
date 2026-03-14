import type { World } from '@grimoire/shared';
import { PositionComponent } from '../components/Position';
import { ProjectileComponent } from '../components/Projectile';
import { HealthComponent } from '../components/Health';
import { StatusEffectsComponent } from '../components/StatusEffects';

const HIT_THRESHOLD = 0.3; // grid cells

export function projectileSystem(world: World, dt: number): void {
  const dtSec = dt / 1000;
  const projectiles = world.query(PositionComponent, ProjectileComponent);

  for (const projId of projectiles) {
    const projPos = world.getComponent(projId, PositionComponent)!;
    const proj = world.getComponent(projId, ProjectileComponent)!;

    // Get target position
    const targetPos = world.getComponent(proj.targetId, PositionComponent);
    if (!targetPos) {
      // Target destroyed — remove projectile
      world.destroyEntity(projId);
      continue;
    }

    // Move toward target
    const dx = targetPos.gridX - projPos.gridX;
    const dy = targetPos.gridY - projPos.gridY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < HIT_THRESHOLD) {
      // Hit! Apply damage
      const health = world.getComponent(proj.targetId, HealthComponent);
      if (health) {
        health.current -= proj.damage;
      }

      // Apply status effect
      if (proj.statusEffect) {
        const effects = world.getComponent(proj.targetId, StatusEffectsComponent);
        if (effects) {
          effects.effects.push({
            type: proj.statusEffect.type,
            remainingMs: proj.statusEffect.duration,
            magnitude: proj.statusEffect.magnitude,
          });
        }
      }

      // Destroy projectile
      world.destroyEntity(projId);
    } else {
      // Move
      const speed = proj.speed * dtSec;
      projPos.gridX += (dx / dist) * speed;
      projPos.gridY += (dy / dist) * speed;
    }
  }
}
