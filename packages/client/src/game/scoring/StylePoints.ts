import { STYLE_POINTS } from '@grimoire/shared';
import type { StyleAction } from '@grimoire/shared';

/**
 * Returns the point value for the given style action type.
 */
export function getStylePoints(type: StyleAction['type']): number {
  return STYLE_POINTS[type];
}

/**
 * Creates a frozen StyleAction object for the given type with the corresponding point value.
 */
export function createStyleAction(type: StyleAction['type']): StyleAction {
  return Object.freeze({ type, points: STYLE_POINTS[type] });
}
