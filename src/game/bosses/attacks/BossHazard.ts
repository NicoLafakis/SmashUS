import * as PIXI from 'pixi.js'
import { AABB } from '../../utils/Collision'

/**
 * Base class for boss attack hazards.
 * These are special attack effects that don't behave like standard projectiles.
 * Each hazard has its own collision detection and rendering logic.
 */
export abstract class BossHazard {
  public x: number
  public y: number
  public active: boolean = true
  public damage: number
  public duration: number
  public elapsed: number = 0

  // Graphics container for complex visuals
  public graphics: PIXI.Graphics

  constructor(x: number, y: number, damage: number, duration: number) {
    this.x = x
    this.y = y
    this.damage = damage
    this.duration = duration
    this.graphics = new PIXI.Graphics()
  }

  /**
   * Update hazard state
   * @param dt Delta time in seconds
   */
  update(dt: number): void {
    this.elapsed += dt

    if (this.elapsed >= this.duration) {
      this.active = false
    }

    this.updateVisuals()
  }

  /**
   * Update visual representation
   * Override in subclasses
   */
  abstract updateVisuals(): void

  /**
   * Check if this hazard hits the player
   * @param playerBounds Player AABB bounds
   * @returns true if player is hit
   */
  abstract checkCollision(playerBounds: AABB): boolean

  /**
   * Get the progress of this hazard (0 to 1)
   */
  getProgress(): number {
    return Math.min(this.elapsed / this.duration, 1)
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.graphics.destroy()
    this.active = false
  }
}
