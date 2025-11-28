import { BossHazard } from './BossHazard'
import { AABB } from '../../utils/Collision'

/**
 * TargetReticle - Shows where an attack will land
 * Used by President's Air Strike attack
 *
 * Displays a targeting indicator that fills up over time.
 * After delay, triggers an explosion at that spot.
 * The reticle itself doesn't deal damage - the explosion does.
 */
export class TargetReticle extends BossHazard {
  public radius: number
  public delay: number
  public hasExploded: boolean = false
  public explosionCallback: ((x: number, y: number, radius: number) => void) | null = null

  constructor(
    x: number,
    y: number,
    radius: number,
    delay: number,
    explosionCallback?: (x: number, y: number, radius: number) => void
  ) {
    // Duration is the delay before explosion
    super(x, y, 0, delay) // No direct damage
    this.radius = radius
    this.delay = delay
    this.explosionCallback = explosionCallback || null

    this.updateVisuals()
  }

  update(dt: number): void {
    this.elapsed += dt

    // Trigger explosion at the end
    if (this.elapsed >= this.delay && !this.hasExploded) {
      this.hasExploded = true
      if (this.explosionCallback) {
        this.explosionCallback(this.x, this.y, this.radius)
      }
      this.active = false
    }

    this.updateVisuals()
  }

  updateVisuals(): void {
    this.graphics.clear()

    if (!this.active) return

    const progress = Math.min(this.elapsed / this.delay, 1)

    // Flashing increases as explosion approaches
    const flashRate = 4 + progress * 16
    const flash = Math.sin(this.elapsed * flashRate) > 0

    // Color transitions from yellow to red as time runs out
    const r = 255
    const g = Math.floor(255 * (1 - progress))
    const color = (r << 16) | (g << 8)

    // Outer ring
    this.graphics.lineStyle(3, flash ? 0xffffff : color, 0.9)
    this.graphics.drawCircle(this.x, this.y, this.radius)

    // Inner filling circle (shows progress)
    const fillRadius = this.radius * progress
    this.graphics.beginFill(color, 0.3)
    this.graphics.drawCircle(this.x, this.y, fillRadius)
    this.graphics.endFill()

    // Crosshair lines
    this.graphics.lineStyle(2, color, 0.8)

    // Horizontal line
    this.graphics.moveTo(this.x - this.radius - 10, this.y)
    this.graphics.lineTo(this.x - this.radius * 0.3, this.y)
    this.graphics.moveTo(this.x + this.radius * 0.3, this.y)
    this.graphics.lineTo(this.x + this.radius + 10, this.y)

    // Vertical line
    this.graphics.moveTo(this.x, this.y - this.radius - 10)
    this.graphics.lineTo(this.x, this.y - this.radius * 0.3)
    this.graphics.moveTo(this.x, this.y + this.radius * 0.3)
    this.graphics.lineTo(this.x, this.y + this.radius + 10)

    // Center dot
    this.graphics.beginFill(color, 0.8)
    this.graphics.drawCircle(this.x, this.y, 4)
    this.graphics.endFill()

    // Rotating indicator
    const rotateAngle = this.elapsed * 3
    for (let i = 0; i < 4; i++) {
      const angle = rotateAngle + (i * Math.PI) / 2
      const innerDist = this.radius * 0.5
      const outerDist = this.radius * 0.7

      this.graphics.lineStyle(2, color, 0.6)
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

  // Reticle doesn't deal damage directly
  checkCollision(_playerBounds: AABB): boolean {
    return false
  }
}
