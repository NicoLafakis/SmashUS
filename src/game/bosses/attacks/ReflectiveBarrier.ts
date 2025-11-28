import { BossHazard } from './BossHazard'
import { AABB, distance, angleBetween } from '../../utils/Collision'
import { Projectile } from '../../entities/Projectile'

/**
 * ReflectiveBarrier - Reflects player projectiles
 * Used by President's Veto attack
 *
 * Positioned in front of the boss.
 * Player projectiles that hit it bounce back.
 * Has duration then disappears.
 */
export class ReflectiveBarrier extends BossHazard {
  public angle: number
  public width: number
  public length: number
  public originX: number
  public originY: number
  public offsetDistance: number

  // Track which projectiles have been reflected to avoid double-reflection
  private reflectedProjectiles: Set<Projectile> = new Set()

  // Reference to boss for tracking
  private bossRef: { x: number; y: number } | null = null

  constructor(
    bossX: number,
    bossY: number,
    angle: number,
    width: number,
    length: number,
    offsetDistance: number,
    damage: number,
    duration: number,
    bossRef?: { x: number; y: number }
  ) {
    // Position barrier at offset from boss
    const barrierX = bossX + Math.cos(angle) * offsetDistance
    const barrierY = bossY + Math.sin(angle) * offsetDistance

    super(barrierX, barrierY, damage, duration)

    this.angle = angle
    this.width = width
    this.length = length
    this.originX = bossX
    this.originY = bossY
    this.offsetDistance = offsetDistance
    this.bossRef = bossRef || null

    this.updateVisuals()
  }

  update(dt: number): void {
    super.update(dt)

    // Update position if tracking boss
    if (this.bossRef) {
      this.originX = this.bossRef.x
      this.originY = this.bossRef.y
      this.x = this.originX + Math.cos(this.angle) * this.offsetDistance
      this.y = this.originY + Math.sin(this.angle) * this.offsetDistance
    }
  }

  /**
   * Update the angle the barrier faces
   */
  setAngle(angle: number): void {
    this.angle = angle
    this.x = this.originX + Math.cos(this.angle) * this.offsetDistance
    this.y = this.originY + Math.sin(this.angle) * this.offsetDistance
  }

  updateVisuals(): void {
    this.graphics.clear()

    if (!this.active) return

    // Pulsing shield effect
    const pulse = Math.sin(this.elapsed * 6) * 0.2 + 0.8
    const alpha = 0.7 * pulse

    // Calculate barrier corners
    const halfLength = this.length / 2
    const halfWidth = this.width / 2
    const perpAngle = this.angle + Math.PI / 2

    // Four corners of the barrier
    const corners = [
      {
        x: this.x + Math.cos(perpAngle) * halfLength - Math.cos(this.angle) * halfWidth,
        y: this.y + Math.sin(perpAngle) * halfLength - Math.sin(this.angle) * halfWidth
      },
      {
        x: this.x - Math.cos(perpAngle) * halfLength - Math.cos(this.angle) * halfWidth,
        y: this.y - Math.sin(perpAngle) * halfLength - Math.sin(this.angle) * halfWidth
      },
      {
        x: this.x - Math.cos(perpAngle) * halfLength + Math.cos(this.angle) * halfWidth,
        y: this.y - Math.sin(perpAngle) * halfLength + Math.sin(this.angle) * halfWidth
      },
      {
        x: this.x + Math.cos(perpAngle) * halfLength + Math.cos(this.angle) * halfWidth,
        y: this.y + Math.sin(perpAngle) * halfLength + Math.sin(this.angle) * halfWidth
      }
    ]

    // Draw barrier
    this.graphics.beginFill(0x4488ff, alpha * 0.5)
    this.graphics.moveTo(corners[0].x, corners[0].y)
    for (let i = 1; i < corners.length; i++) {
      this.graphics.lineTo(corners[i].x, corners[i].y)
    }
    this.graphics.closePath()
    this.graphics.endFill()

    // Outline
    this.graphics.lineStyle(3, 0x88ccff, alpha)
    this.graphics.moveTo(corners[0].x, corners[0].y)
    for (let i = 1; i < corners.length; i++) {
      this.graphics.lineTo(corners[i].x, corners[i].y)
    }
    this.graphics.closePath()

    // Center line
    this.graphics.lineStyle(2, 0xffffff, alpha * 0.8)
    this.graphics.moveTo(
      this.x + Math.cos(perpAngle) * halfLength,
      this.y + Math.sin(perpAngle) * halfLength
    )
    this.graphics.lineTo(
      this.x - Math.cos(perpAngle) * halfLength,
      this.y - Math.sin(perpAngle) * halfLength
    )

    // Shine effect
    const shineOffset = ((this.elapsed * 100) % (this.length * 2)) - halfLength
    if (shineOffset > -halfLength && shineOffset < halfLength) {
      this.graphics.lineStyle(4, 0xffffff, 0.6)
      this.graphics.moveTo(
        this.x + Math.cos(perpAngle) * shineOffset,
        this.y + Math.sin(perpAngle) * shineOffset
      )
      this.graphics.lineTo(
        this.x + Math.cos(perpAngle) * (shineOffset + 20),
        this.y + Math.sin(perpAngle) * (shineOffset + 20)
      )
    }
  }

  /**
   * Check collision with player for contact damage
   */
  checkCollision(playerBounds: AABB): boolean {
    const playerCenterX = playerBounds.x + playerBounds.width / 2
    const playerCenterY = playerBounds.y + playerBounds.height / 2

    // Simple distance check to barrier center
    const dist = distance(this.x, this.y, playerCenterX, playerCenterY)
    const playerRadius = Math.max(playerBounds.width, playerBounds.height) / 2

    return dist < Math.max(this.length, this.width) / 2 + playerRadius
  }

  /**
   * Check if a projectile should be reflected
   * Returns true if projectile was reflected
   */
  checkProjectileReflection(projectile: Projectile): boolean {
    // Only reflect player projectiles
    if (!projectile.isPlayerProjectile) return false

    // Don't reflect same projectile twice
    if (this.reflectedProjectiles.has(projectile)) return false

    // Check if projectile is near barrier
    const dist = distance(this.x, this.y, projectile.x, projectile.y)
    const maxDist = Math.max(this.length, this.width) / 2 + 10

    if (dist > maxDist) return false

    // Check if projectile is in front of barrier
    const angleToProjectile = angleBetween(this.x, this.y, projectile.x, projectile.y)
    let angleDiff = angleToProjectile - this.angle
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

    // Projectile must be roughly in front (within 90 degrees)
    if (Math.abs(angleDiff) > Math.PI / 2) return false

    // Reflect the projectile
    this.reflectedProjectiles.add(projectile)

    // Reverse velocity and make it an enemy projectile
    projectile.vx = -projectile.vx
    projectile.vy = -projectile.vy
    projectile.isPlayerProjectile = false

    // Update sprite rotation
    const newAngle = Math.atan2(projectile.vy, projectile.vx)
    projectile.sprite.rotation = newAngle

    return true
  }
}
