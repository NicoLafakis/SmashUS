import { BossHazard } from './BossHazard'
import { AABB, distance } from '../../utils/Collision'

/**
 * Explosion - Instant damage in a radius
 * Used after TargetReticle delay and other attack triggers
 *
 * Brief visual effect that deals damage on first frame.
 * Different from projectile because it doesn't move.
 * Has a short duration for the visual effect.
 */
export class Explosion extends BossHazard {
  public radius: number
  public maxRadius: number
  public hasDamaged: boolean = false
  public color: number

  constructor(
    x: number,
    y: number,
    radius: number,
    damage: number,
    duration: number = 0.4,
    color: number = 0xff6600
  ) {
    super(x, y, damage, duration)
    this.radius = 0 // Starts small
    this.maxRadius = radius
    this.color = color

    this.updateVisuals()
  }

  update(dt: number): void {
    super.update(dt)

    // Rapid expansion then fade
    const progress = this.getProgress()

    if (progress < 0.3) {
      // Expand quickly
      this.radius = this.maxRadius * (progress / 0.3)
    } else {
      // Hold at max size then fade
      this.radius = this.maxRadius
    }
  }

  updateVisuals(): void {
    this.graphics.clear()

    if (!this.active) return

    const progress = this.getProgress()

    // Fade out over duration
    const alpha = progress < 0.3 ? 1 : 1 - (progress - 0.3) / 0.7

    // Main explosion circle
    this.graphics.beginFill(this.color, alpha * 0.8)
    this.graphics.drawCircle(this.x, this.y, this.radius)
    this.graphics.endFill()

    // Bright core
    const coreRadius = this.radius * 0.4 * (1 - progress)
    this.graphics.beginFill(0xffffaa, alpha)
    this.graphics.drawCircle(this.x, this.y, coreRadius)
    this.graphics.endFill()

    // Outer ring
    this.graphics.lineStyle(4, 0xffaa00, alpha * 0.6)
    this.graphics.drawCircle(this.x, this.y, this.radius)

    // Particle-like rays
    if (progress < 0.5) {
      this.graphics.lineStyle(3, 0xffff00, alpha * 0.8)
      const rayCount = 8
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + this.elapsed * 2
        const innerDist = this.radius * 0.3
        const outerDist = this.radius * (0.8 + Math.random() * 0.4)

        this.graphics.moveTo(
          this.x + Math.cos(angle) * innerDist,
          this.y + Math.sin(angle) * innerDist
        )
        this.graphics.lineTo(
          this.x + Math.cos(angle) * outerDist,
          this.y + Math.sin(angle) * outerDist
        )
      }
    }
  }

  checkCollision(playerBounds: AABB): boolean {
    // Only deal damage once
    if (this.hasDamaged) return false

    const playerCenterX = playerBounds.x + playerBounds.width / 2
    const playerCenterY = playerBounds.y + playerBounds.height / 2

    const distToPlayer = distance(this.x, this.y, playerCenterX, playerCenterY)
    const playerRadius = Math.max(playerBounds.width, playerBounds.height) / 2

    if (distToPlayer < this.radius + playerRadius) {
      this.hasDamaged = true
      return true
    }

    return false
  }
}
