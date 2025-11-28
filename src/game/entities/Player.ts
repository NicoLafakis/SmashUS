import { Entity } from './Entity'
import { InputState } from '../InputManager'
import { Weapon } from '../weapons/Weapon'
import { Wrench } from '../weapons/Wrench'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { SpriteGenerator } from '../utils/SpriteGenerator'

export class Player extends Entity {
  // Stats
  public health: number = 100
  public maxHealth: number = 100
  public lives: number = 3
  public score: number = 0

  // Movement
  private speed: number = 200

  // Combat
  public weapon: Weapon
  public damageMultiplier: number = 1
  public spreadMultiplier: number = 1
  public shield: number = 0
  public invincible: boolean = false
  private invincibleTimer: number = 0
  private readonly INVINCIBLE_DURATION: number = 1

  // Powerup timers
  private damageBoostTimer: number = 0
  private spreadBoostTimer: number = 0

  constructor() {
    super(SpriteGenerator.generatePlayerSprite(), 28, 28)
    this.x = GAME_WIDTH / 2
    this.y = GAME_HEIGHT / 2
    this.weapon = new Wrench()
  }

  update(dt: number): void {
    // Handle invincibility
    if (this.invincible) {
      this.invincibleTimer -= dt
      if (this.invincibleTimer <= 0) {
        this.invincible = false
        this.sprite.alpha = 1
      } else {
        // Flash effect
        this.sprite.alpha = Math.sin(this.invincibleTimer * 20) > 0 ? 1 : 0.3
      }
    }

    // Handle powerup timers
    if (this.damageBoostTimer > 0) {
      this.damageBoostTimer -= dt
      if (this.damageBoostTimer <= 0) {
        this.damageMultiplier = 1
      }
    }

    if (this.spreadBoostTimer > 0) {
      this.spreadBoostTimer -= dt
      if (this.spreadBoostTimer <= 0) {
        this.spreadMultiplier = 1
      }
    }

    // Update weapon cooldown
    this.weapon.update(dt)

    this.updateSprite()
  }

  handleInput(input: InputState, dt: number): void {
    // Movement
    this.vx = input.moveX * this.speed
    this.vy = input.moveY * this.speed

    this.x += this.vx * dt
    this.y += this.vy * dt

    // Clamp to arena bounds
    const halfWidth = this.width / 2
    const halfHeight = this.height / 2
    this.x = Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, this.x))
    this.y = Math.max(halfHeight, Math.min(GAME_HEIGHT - halfHeight, this.y))

    // Face aim direction
    const dx = input.aimX - this.x
    if (dx < 0) {
      this.sprite.scale.x = -1
    } else {
      this.sprite.scale.x = 1
    }
  }

  takeDamage(amount: number): boolean {
    if (this.invincible) return false

    // Check shield first
    if (this.shield > 0) {
      this.shield--
      this.invincible = true
      this.invincibleTimer = 0.5
      return false
    }

    this.health -= amount
    this.invincible = true
    this.invincibleTimer = this.INVINCIBLE_DURATION

    if (this.health <= 0) {
      this.lives--
      if (this.lives > 0) {
        this.health = this.maxHealth
        return false
      }
      return true // Player died completely
    }
    return false
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount)
  }

  addScore(points: number): void {
    this.score += points
  }

  applyDamageBoost(duration: number): void {
    this.damageMultiplier = 2
    this.damageBoostTimer = duration
  }

  applySpreadBoost(duration: number): void {
    this.spreadMultiplier = 2
    this.spreadBoostTimer = duration
  }

  addShield(hits: number): void {
    this.shield = Math.min(3, this.shield + hits)
  }

  addLife(): void {
    this.lives++
  }

  setWeapon(weapon: Weapon): void {
    this.weapon = weapon
  }

  reset(): void {
    this.x = GAME_WIDTH / 2
    this.y = GAME_HEIGHT / 2
    this.health = this.maxHealth
    this.invincible = true
    this.invincibleTimer = this.INVINCIBLE_DURATION
    this.vx = 0
    this.vy = 0
  }

  getDamageBoostTimeRemaining(): number {
    return this.damageBoostTimer
  }

  getSpreadBoostTimeRemaining(): number {
    return this.spreadBoostTimer
  }
}
