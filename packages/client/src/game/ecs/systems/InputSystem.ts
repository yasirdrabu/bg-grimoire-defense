import type { World } from '@grimoire/shared';
import { TOWERS, TOWER_UPGRADES, getSellRefund } from '@grimoire/shared';
import { useGameStore } from '../../../stores/useGameStore';
import { useUIStore } from '../../../stores/useUIStore';
import { TowerDataComponent } from '../components/TowerData';
import { AttackComponent } from '../components/Attack';
import { canUpgrade, applyUpgrade, getUpgradeCost } from '../../towers/TowerUpgrade';

export function inputSystem(world: World, _dt: number): void {
  const actions = useGameStore.getState().drainActions();

  for (const action of actions) {
    switch (action.type) {
      case 'SET_SPEED':
        useGameStore.setState({ gameSpeed: action.speed });
        break;

      case 'TOGGLE_PAUSE':
        useGameStore.setState((state) => ({ isPaused: !state.isPaused }));
        break;

      case 'BUILD_TOWER':
        // Handled by GameScene directly (needs PathManager + grid access)
        break;

      case 'SEND_WAVE_EARLY':
        useGameStore.setState({ sendWaveEarlyFlag: true });
        break;

      case 'UPGRADE_TOWER': {
        const { towerId, branch } = action;

        // Find the tower entity whose TowerData.towerId matches the string id
        // NOTE: towerId in the action is the EntityId (as string), not the tower type
        const entityId = Number(towerId);
        const towerData = world.getComponent(entityId, TowerDataComponent);
        const attack = world.getComponent(entityId, AttackComponent);

        if (!towerData || !attack) break;

        const towerDef = TOWERS[towerData.towerId];
        const upgradeData = TOWER_UPGRADES[towerData.towerId];

        if (!towerDef || !upgradeData) break;

        const state = useGameStore.getState();
        const upgradeBranch = towerData.tier === 1 ? undefined : branch;

        if (!canUpgrade(towerData, state.gold, state.essence, towerDef, upgradeBranch)) break;

        const cost = getUpgradeCost(towerData, towerDef);

        // Deduct resources
        useGameStore.setState({
          gold: state.gold - cost.gold,
          essence: state.essence - cost.essence,
        });

        // Apply stat changes and advance tier
        applyUpgrade(attack, towerData, towerDef, upgradeData, upgradeBranch);

        // Update totalInvestment
        towerData.totalInvestment += cost.gold;

        // Re-project selected tower data to store
        const nextState = useGameStore.getState();
        useGameStore.getState().projectSelectedTower({
          id: towerId,
          name: towerDef.name,
          tier: towerData.tier,
          damage: attack.damage,
          attackSpeed: attack.attackSpeed,
          range: attack.range,
          special: towerDef.special ?? null,
          upgradeCostA: towerData.tier < 3 ? towerDef.upgradeCostTier3 : null,
          upgradeCostB: towerData.tier < 3 ? towerDef.upgradeCostTier3 : null,
          sellRefund: getSellRefund(towerDef.cost, towerData.totalInvestment - towerDef.cost),
        });
        void nextState; // suppress unused variable warning
        break;
      }

      case 'SELL_TOWER': {
        const { towerId } = action;
        const entityId = Number(towerId);
        const towerData = world.getComponent(entityId, TowerDataComponent);

        if (!towerData) break;

        const towerDef = TOWERS[towerData.towerId];
        const refund = getSellRefund(towerDef?.cost ?? 0, towerData.totalInvestment - (towerDef?.cost ?? 0));

        // Award sell refund
        const state = useGameStore.getState();
        useGameStore.setState({ gold: state.gold + refund });

        // Destroy entity from ECS
        world.destroyEntity(entityId);

        // Clear selected tower in UI
        useUIStore.getState().deselectTower();
        useGameStore.getState().clearSelectedTower();

        // TODO: GameScene must also mark the tower's grid cell as walkable
        // (gridData[gridY][gridX] = 0) and recompute the path, since
        // InputSystem has no access to the grid or PathManager.
        // Mechanism: GameScene should listen for selectedTowerData becoming null
        // after a SELL_TOWER action, or a dedicated sellTowerFlag could be added
        // to the store for GameScene to consume.
        break;
      }

      case 'FUSE_TOWERS':
        // Will be handled in Phase 2
        break;
    }
  }
}
