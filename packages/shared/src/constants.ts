// Isometric tile dimensions (2:1 ratio)
export const TILE_W = 128;
export const TILE_H = 64;

// Grid defaults
export const DEFAULT_GRID_COLS = 20;
export const DEFAULT_GRID_ROWS = 15;

// Rendering
export const FLYING_DEPTH_OFFSET = 10000;

// Layer depths
export const LAYER_TERRAIN = 0;
export const LAYER_GRID_OVERLAY = 100;
export const LAYER_GROUND_EFFECTS = 200;
export const LAYER_ENTITIES_BASE = 300;
export const LAYER_PROJECTILES = 400;
export const LAYER_VFX = 500;
export const LAYER_HEALTH_BARS = 600;

// Economy
export const SELL_REFUND_RATIO = 0.75;
export const INTEREST_RATE = 0.1;
export const INTEREST_CAP = 50;
export const STARTING_GOLD: Record<number, number> = { 1: 650, 2: 800, 3: 1000 };
export const PERFECT_WAVE_ESSENCE = 10;
export const COMBO_ESSENCE_REWARD = 5;
export const COMBO_ESSENCE_THRESHOLD = 25;
export const FIRST_FUSION_ESSENCE = 25;

// Scoring
export const COMBO_WINDOW_MS = 2500;
export const MAX_GAME_SPEED = 3;

// Waves
export const WAVE_CLEAR_PAUSE_MS = 2000;
export const MIN_COUNTDOWN_SECONDS = 8;

// Scene transitions
export const SCENE_FADE_MS = 300;

// Pathfinding
export const PATH_REQUEST_TIMEOUT_MS = 500;
export const PATH_WORKER_WATCHDOG_MS = 2000;
export const BUILD_HOVER_DEBOUNCE_MS = 100;

// Steering
export const SEPARATION_WEIGHT = 0.2;
export const PATH_FOLLOWING_WEIGHT = 0.8;
export const SEPARATION_RADIUS = 0.6; // grid cells
export const WAYPOINT_THRESHOLD = 0.1; // grid cells
