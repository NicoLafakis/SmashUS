import { BossHazard } from './BossHazard'
import { AABB, distance, angleBetween } from '../../utils/Collision'

/**
 * BeamSweep - A rotating beam attached to the boss
 * Used by IRS Commissioner's Audit Beam Sweep attack
 *
 * The beam rotates from startAngle to endAngle over its duration.
 * It's rendered as a rectangle extending from the boss position.
 */
export class BeamSweep extends BossHazard {
  public startAngle: number
  public endAngle: number
  public currentAngle: number
  public length: number
  public width: number
  public originX: number
  public originY: number

  // For updating position if boss moves
  private bossRef: { x: number; y: number } | null = null

  constructor(
    bossX: number,
    bossY: number,
    startAngle: number,
    endAngle: number,
    length: number,
    width: number,
    damage: number,
    duration: number,
    bossRef?: { x: number; y: number }
  ) {
    super(bossX, bossY, damage, duration)
    this.startAngle = startAngle
    this.endAngle = endAngle
    this.currentAngle = startAngle
    this.length = length
    this.width = width
    this.originX = bossX
    this.originY = bossY
    this.bossRef = bossRef || null

    this.updateVisuals()
  }

  update(dt: number): void {
    super.update(dt)

    // Update origin if tracking boss
    if (this.bossRef) {
      this.originX = this.bossRef.x
      this.originY = this.bossRef.y
      this.x = this.bossRef.x
      this.y = this.bossRef.y
    }

    // Interpolate angle based on progress
    const progress = this.getProgress()
    this.currentAngle = this.startAngle + (this.endAngle - this.startAngle) * progress
  }

  updateVisuals(): void {
    this.graphics.clear()

    if (!this.active) return

    // Draw beam as a rotated rectangle
    const progress = this.getProgress()

    // Beam color: red with pulsing intensity
    const pulse = Math.sin(this.elapsed * 15) * 0.3 + 0.7
    const alpha = 0.8 * pulse

    // Warning phase (first 20%) - yellow flashing
    if (progress < 0.2) {
      const flash = Math.floor(this.elapsed * 10) % 2 === 0
      this.graphics.beginFill(flash ? 0xffff00 : 0xff8800, 0.5)
    } else {
      // Active beam - red
      this.graphics.beginFill(0xff0000, alpha)
    }

    // Draw beam from origin
    this.graphics.moveTo(this.originX, this.originY)

    // Calculate beam endpoints
    const halfWidth = this.width / 2
    const perpAngle = this.currentAngle + Math.PI / 2

    // Four corners of the beam
    const x1 = this.originX + Math.cos(perpAngle) * halfWidth
    const y1 = this.originY + Math.sin(perpAngle) * halfWidth
    const x2 = this.originX - Math.cos(perpAngle) * halfWidth
    const y2 = this.originY - Math.sin(perpAngle) * halfWidth
    const x3 = x2 + Math.cos(this.currentAngle) * this.length
    const y3 = y2 + Math.sin(this.currentAngle) * this.length
    const x4 = x1 + Math.cos(this.currentAngle) * this.length
    const y4 = y1 + Math.sin(this.currentAngle) * this.length

    this.graphics.moveTo(x1, y1)
    this.graphics.lineTo(x2, y2)
    this.graphics.lineTo(x3, y3)
    this.graphics.lineTo(x4, y4)
    this.graphics.closePath()
    this.graphics.endFill()

    // Add glow effect
    this.graphics.lineStyle(4, 0xff4444, 0.3)
    this.graphics.moveTo(this.originX, this.originY)
    this.graphics.lineTo(
      this.originX + Math.cos(this.currentAngle) * this.length,
      this.originY + Math.sin(this.currentAngle) * this.length
    )
  }

  checkCollision(playerBounds: AABB): boolean {
    // Only damage after warning phase
    if (this.getProgress() < 0.2) return false

    // Check if player center is within beam
    const playerCenterX = playerBounds.x + playerBounds.width / 2
    const playerCenterY = playerBounds.y + playerBounds.height / 2

    // Distance from origin to player
    const distToPlayer = distance(this.originX, this.originY, playerCenterX, playerCenterY)

    // If player is beyond beam length, no collision
    if (distToPlayer > this.length) return false

    // Angle from origin to player
    const angleToPlayer = angleBetween(this.originX, this.originY, playerCenterX, playerCenterY)

    // Normalize angle difference
    let angleDiff = angleToPlayer - this.currentAngle
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

    // Check if player is within beam width (using angle approximation)
    const maxAngleDiff = Math.atan2(this.width / 2, distToPlayer)

    return Math.abs(angleDiff) < maxAngleDiff
  }
}
