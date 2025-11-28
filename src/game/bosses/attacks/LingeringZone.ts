import { BossHazard } from './BossHazard'
import { AABB, distance } from '../../utils/Collision'

/**
 * LingeringZone - A damage zone on the floor
 * Used by Senator Pair's Filibuster attack
 *
 * Area that damages player while they stand in it.
 * Pulses visually to indicate danger.
 * Has position, radius, and duration.
 */
export class LingeringZone extends BossHazard {
  public radius: number
  public damageInterval: number
  public lastDamageTime: number = 0
  public color: number
  public warningDuration: number
  public isWarning: boolean = true

  constructor(
    x: number,
    y: number,
    radius: number,
    damage: number,
    duration: number,
    damageInterval: number = 0.5,
    color: number = 0xff4400,
    warningDuration: number = 0.5
  ) {
    super(x, y, damage, duration + warningDuration)
    this.radius = radius
    this.damageInterval = damageInterval
    this.color = color
    this.warningDuration = warningDuration

    this.updateVisuals()
  }

  update(dt: number): void {
    super.update(dt)

    // Transition from warning to active
    if (this.elapsed >= this.warningDuration) {
      this.isWarning = false
    }
  }

  updateVisuals(): void {
    this.graphics.clear()

    if (!this.active) return

    const activeProgress = this.isWarning
      ? 0
      : (this.elapsed - this.warningDuration) / (this.duration - this.warningDuration)

    // Pulsing effect
    const pulse = Math.sin(this.elapsed * 8) * 0.2 + 0.6
    const alpha = this.isWarning ? 0.3 : pulse * (1 - activeProgress * 0.5)

    if (this.isWarning) {
      // Warning phase - flashing outline
      const flash = Math.floor(this.elapsed * 6) % 2 === 0
      this.graphics.lineStyle(3, flash ? 0xffff00 : this.color, 0.8)
      this.graphics.drawCircle(this.x, this.y, this.radius)

      // Dashed fill
      this.graphics.beginFill(this.color, 0.2)
      this.graphics.drawCircle(this.x, this.y, this.radius)
      this.graphics.endFill()
    } else {
      // Active zone - solid fill with pulse
      this.graphics.beginFill(this.color, alpha * 0.6)
      this.graphics.drawCircle(this.x, this.y, this.radius)
      this.graphics.endFill()

      // Edge glow
      this.graphics.lineStyle(4, this.color, alpha)
      this.graphics.drawCircle(this.x, this.y, this.radius)

      // Inner pattern
      this.graphics.lineStyle(1, 0xffffff, alpha * 0.3)
      for (let i = 0; i < 3; i++) {
        this.graphics.drawCircle(this.x, this.y, this.radius * (0.3 + i * 0.25))
      }
    }
  }

  checkCollision(playerBounds: AABB): boolean {
    // No damage during warning phase
    if (this.isWarning) return false

    const playerCenterX = playerBounds.x + playerBounds.width / 2
    const playerCenterY = playerBounds.y + playerBounds.height / 2

    const distToPlayer = distance(this.x, this.y, playerCenterX, playerCenterY)
    const playerRadius = Math.max(playerBounds.width, playerBounds.height) / 2

    return distToPlayer < this.radius + playerRadius
  }

  /**
   * Check if enough time has passed to deal damage again
   * Returns true if damage should be applied
   */
  canDealDamage(): boolean {
    if (this.isWarning) return false

    const timeSinceLastDamage = this.elapsed - this.lastDamageTime
    if (timeSinceLastDamage >= this.damageInterval) {
      this.lastDamageTime = this.elapsed
      return true
    }
    return false
  }
}
