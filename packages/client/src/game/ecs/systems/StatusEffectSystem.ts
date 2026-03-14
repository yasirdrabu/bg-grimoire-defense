import type { World } from '@grimoire/shared';
import { MovementComponent } from '../components/Movement';
import { HealthComponent } from '../components/Health';
import { StatusEffectsComponent } from '../components/StatusEffects';

export function statusEffectSystem(world: World, dt: number): void {
  const entities = world.query(StatusEffectsComponent);

  for (const id of entities) {
    const effects = world.getComponent(id, StatusEffectsComponent)!;
    const movement = world.getComponent(id, MovementComponent);

    // Reset slow multiplier each frame (recomputed from active effects)
    if (movement) {
      movement.slowMultiplier = 1;
    }

    // Tick effects
    for (let i = effects.effects.length - 1; i >= 0; i--) {
      const effect = effects.effects[i]!;
      effect.remainingMs -= dt;

      if (effect.remainingMs <= 0) {
        effects.effects.splice(i, 1);
        continue;
      }

      switch (effect.type) {
        case 'slow':
          if (movement) {
            movement.slowMultiplier *= (1 - effect.magnitude);
          }
          break;

        case 'burn':
        case 'poison': {
          // DoT damage
          const health = world.getComponent(id, HealthComponent);
          if (health) {
            health.current -= effect.magnitude * (dt / 1000);
          }
          break;
        }

        case 'stun':
          if (movement) {
            movement.slowMultiplier = 0;
          }
          break;

        case 'fear':
        case 'curse':
          // Handled by specific ability systems
          break;
      }
    }
  }
}
