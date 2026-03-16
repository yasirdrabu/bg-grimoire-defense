import type { World } from '@grimoire/shared';
import { TOWERS, TOWER_UPGRADES, getSellRefund, FIRST_FUSION_ESSENCE } from '@grimoire/shared';
import { useGameStore } from '../../../stores/useGameStore';
import { useUIStore } from '../../../stores/useUIStore';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import { TowerDataComponent } from '../components/TowerData';
import { AttackComponent } from '../components/Attack';
import { PositionComponent } from '../components/Position';
import { canUpgrade, applyUpgrade, getUpgradeCost } from '../../towers/TowerUpgrade';
import { findFusionRecipe, executeFusion } from '../../towers/FusionEngine';

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
        const isTier2 = towerData.tier === 2;
        useGameStore.getState().projectSelectedTower({
          id: towerId,
          name: towerDef.name,
          tier: towerData.tier,
          damage: attack.damage,
          attackSpeed: attack.attackSpeed,
          range: attack.range,
          special: towerDef.special ?? null,
          upgradeCostA: isTier2 ? towerDef.upgradeCostTier3 : null,
          upgradeCostAEssence: isTier2 ? towerDef.essenceCostTier3 : null,
          upgradeCostB: isTier2 ? towerDef.upgradeCostTier3 : null,
          upgradeCostBEssence: isTier2 ? towerDef.essenceCostTier3 : null,
          upgradeNameA: isTier2 ? (upgradeData.tier3A.name) : null,
          upgradeNameB: isTier2 ? (upgradeData.tier3B.name) : null,
          upgradeDescA: isTier2 ? (upgradeData.tier3A.specialAbility ?? null) : null,
          upgradeDescB: isTier2 ? (upgradeData.tier3B.specialAbility ?? null) : null,
          sellRefund: getSellRefund(towerDef.cost, towerData.totalInvestment - towerDef.cost),
        });
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

      case 'FUSE_TOWERS': {
        const { towerIdA, towerIdB } = action;
        const entityA = Number(towerIdA);
        const entityB = Number(towerIdB);

        const dataA = world.getComponent(entityA, TowerDataComponent);
        const dataB = world.getComponent(entityB, TowerDataComponent);
        const posA = world.getComponent(entityA, PositionComponent);
        const posB = world.getComponent(entityB, PositionComponent);

        if (!dataA || !dataB || !posA || !posB) break;

        // Both towers must be Tier 2+
        if (dataA.tier < 2 || dataB.tier < 2) break;

        // Validate orthogonal adjacency
        const dx = Math.abs(posA.gridX - posB.gridX);
        const dy = Math.abs(posA.gridY - posB.gridY);
        const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
        if (!isAdjacent) break;

        // Look up recipe
        const recipe = findFusionRecipe(dataA.towerId, dataB.towerId);
        if (!recipe) break;

        // Check and deduct essence cost
        const gameState = useGameStore.getState();
        if (gameState.essence < recipe.essenceCost) break;
        useGameStore.setState({ essence: gameState.essence - recipe.essenceCost });

        // Check discovery BEFORE executing fusion (recipe.id won't change, but guard is cleaner here)
        const playerState = usePlayerStore.getState();
        const isNewDiscovery = !playerState.discoveredFusions.has(recipe.id);

        // Execute fusion: destroys both towers, creates fusion entity at A's position
        executeFusion(world, entityA, entityB, recipe);

        // Award first-fusion essence bonus and record discovery
        if (isNewDiscovery) {
          playerState.discoverFusion(recipe.id);
          const currentEssence = useGameStore.getState().essence;
          useGameStore.setState({ essence: currentEssence + FIRST_FUSION_ESSENCE });
        }

        // Clear UI selection
        useUIStore.getState().deselectTower();
        useGameStore.getState().clearSelectedTower();
        break;
      }
    }
  }
}
