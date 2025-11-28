import { BossHazard } from './BossHazard'
import { AABB, distance } from '../../utils/Collision'

/**
 * Shockwave - An expanding ring from a point
 * Used by Speaker's Gavel Slam attack
 *
 * The ring starts small and expands outward.
 * Damages player when the ring touches them.
 * Ring has a thickness so player can be inside the safe zone.
 */
export class Shockwave extends BossHazard {
  public maxRadius: number
  public currentRadius: number
  public ringThickness: number
  public expansionSpeed: number
  public color: number

  constructor(
    x: number,
    y: number,
    maxRadius: number,
    ringThickness: number,
    expansionSpeed: number,
    damage: number,
    color: number = 0xffaa00
  ) {
    // Calculate duration based on max radius and speed
    const duration = maxRadius / expansionSpeed
    super(x, y, damage, duration)

    this.maxRadius = maxRadius
    this.currentRadius = 0
    this.ringThickness = ringThickness
    this.expansionSpeed = expansionSpeed
    this.color = color

    this.updateVisuals()
  }

  update(dt: number): void {
    // Don't call super.update() - we handle duration differently
    this.elapsed += dt

    // Expand the ring
    this.currentRadius += this.expansionSpeed * dt

    if (this.currentRadius >= this.maxRadius) {
      this.active = false
    }

    this.updateVisuals()
  }

  updateVisuals(): void {
    this.graphics.clear()

    if (!this.active) return

    const progress = this.currentRadius / this.maxRadius

    // Fade out as ring expands
    const alpha = 0.8 * (1 - progress * 0.5)

    // Draw ring (outer circle minus inner circle)
    const innerRadius = Math.max(0, this.currentRadius - this.ringThickness)

    // Outer circle
    this.graphics.beginFill(this.color, alpha)
    this.graphics.drawCircle(this.x, this.y, this.currentRadius)
    this.graphics.endFill()

    // Cut out inner circle to make ring
    this.graphics.beginFill(0x000000, 0)
    this.graphics.drawCircle(this.x, this.y, innerRadius)
    this.graphics.endFill()

    // Use a hole to create the ring effect
    this.graphics.clear()
    this.graphics.lineStyle(this.ringThickness, this.color, alpha)
    this.graphics.drawCircle(this.x, this.y, this.currentRadius - this.ringThickness / 2)

    // Add inner glow
    this.graphics.lineStyle(2, 0xffffff, alpha * 0.5)
    this.graphics.drawCircle(this.x, this.y, innerRadius)
  }

  checkCollision(playerBounds: AABB): boolean {
    const playerCenterX = playerBounds.x + playerBounds.width / 2
    const playerCenterY = playerBounds.y + playerBounds.height / 2

    const distToPlayer = distance(this.x, this.y, playerCenterX, playerCenterY)

    // Player hitbox radius approximation
    const playerRadius = Math.max(playerBounds.width, playerBounds.height) / 2

    // Inner edge of ring
    const innerRadius = Math.max(0, this.currentRadius - this.ringThickness)

    // Check if player overlaps with the ring
    // Player is hit if their edge is within the ring's thickness
    const playerInnerEdge = distToPlayer - playerRadius
    const playerOuterEdge = distToPlayer + playerRadius

    // Collision if player overlaps ring band
    return playerOuterEdge >= innerRadius && playerInnerEdge <= this.currentRadius
  }
}
