import { Entity } from './Entity'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { SpriteGenerator } from '../utils/SpriteGenerator'

export interface ProjectileConfig {
  damage: number
  speed: number
  piercing: boolean
  type: string
  isPlayerProjectile: boolean
}

export class Projectile extends Entity {
  public damage: number
  public speed: number
  public piercing: boolean
  public type: string
  public isPlayerProjectile: boolean
  private hitEntities: Set<number> = new Set()

  constructor(config: ProjectileConfig, x: number, y: number, angle: number) {
    super(SpriteGenerator.generateProjectileSprite(config.type), 8, 8)
    this.x = x
    this.y = y
    this.damage = config.damage
    this.speed = config.speed
    this.piercing = config.piercing
    this.type = config.type
    this.isPlayerProjectile = config.isPlayerProjectile

    this.vx = Math.cos(angle) * this.speed
    this.vy = Math.sin(angle) * this.speed

    this.sprite.rotation = angle

    // Adjust size based on type
    if (config.type === 'laser') {
      this.width = 20
      this.height = 4
    } else if (config.type === 'wrench') {
      this.width = 16
      this.height = 16
    }
  }

  update(dt: number): void {
    this.x += this.vx * dt
    this.y += this.vy * dt

    // Rotate wrench
    if (this.type === 'wrench') {
      this.sprite.rotation += dt * 15
    }

    // Deactivate if out of bounds
    if (
      this.x < -50 ||
      this.x > GAME_WIDTH + 50 ||
      this.y < -50 ||
      this.y > GAME_HEIGHT + 50
    ) {
      this.active = false
    }

    this.updateSprite()
  }

  hasHit(entityId: number): boolean {
    return this.hitEntities.has(entityId)
  }

  markHit(entityId: number): void {
    this.hitEntities.add(entityId)
    if (!this.piercing) {
      this.active = false
    }
  }

  reset(config: ProjectileConfig, x: number, y: number, angle: number): void {
    this.x = x
    this.y = y
    this.damage = config.damage
    this.speed = config.speed
    this.piercing = config.piercing
    this.type = config.type
    this.isPlayerProjectile = config.isPlayerProjectile
    this.active = true

    this.vx = Math.cos(angle) * this.speed
    this.vy = Math.sin(angle) * this.speed
    this.sprite.rotation = angle

    this.hitEntities.clear()

    // Update texture
    this.sprite.texture = SpriteGenerator.generateProjectileSprite(config.type)
  }
}
