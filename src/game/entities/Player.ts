import { Entity } from './Entity'
import { InputState } from '../InputManager'
import { Weapon } from '../weapons/Weapon'
import { Wrench } from '../weapons/Wrench'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { SpriteGenerator } from '../utils/SpriteGenerator'
import { getUpgradeManager } from '../systems/UpgradeManager'

export class Player extends Entity {
  // Stats
  public health: number = 100
  public maxHealth: number = 100
  public lives: number = 3
  public score: number = 0
  public money: number = 0 // Separate currency for shop

  // Movement
  private baseSpeed: number = 200

  // Combat
  public weapon: Weapon
  public damageMultiplier: number = 1
  public spreadMultiplier: number = 1
  public fireRateMultiplier: number = 1
  public shield: number = 0
  public maxShield: number = 3
  public invincible: boolean = false
  private invincibleTimer: number = 0
  private readonly INVINCIBLE_DURATION: number = 1

  // Powerup timers
  private damageBoostTimer: number = 0
  private spreadBoostTimer: number = 0

  // Upgrade-based stats
  public pickupRadius: number = 30 // Base pickup collision radius
  public damageReduction: number = 0 // Percentage damage reduction
  private regenTimer: number = 0
  private regenInterval: number = 5 // Seconds between regen ticks

  constructor() {
    super(SpriteGenerator.generatePlayerSprite(), 32, 32)
    this.x = GAME_WIDTH / 2
    this.y = GAME_HEIGHT / 2
    this.weapon = new Wrench()
    this.applyUpgrades()
  }

  /**
   * Apply all purchased upgrades from UpgradeManager
   */
  applyUpgrades(): void {
    const upgrades = getUpgradeManager()

    // Max Health upgrade
    const healthBonus = upgrades.getStatBonus('maxHealth')
    this.maxHealth = 100 + healthBonus
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth
    }

    // Shield capacity upgrade
    const shieldBonus = upgrades.getStatBonus('maxShield')
    this.maxShield = 3 + shieldBonus

    // Damage multiplier upgrade (additive with temporary boost)
    const damageBonus = upgrades.getStatBonus('damageMultiplier')
    // Base multiplier is 1 + upgrade bonus, temporary boost doubles it
    this.damageMultiplier = 1 + damageBonus

    // Fire rate multiplier upgrade
    const fireRateBonus = upgrades.getStatBonus('fireRateMultiplier')
    this.fireRateMultiplier = 1 + fireRateBonus

    // Spread bonus upgrade
    const spreadBonus = upgrades.getStatBonus('bonusSpread')
    this.spreadMultiplier = 1 + (spreadBonus * 0.5) // Each level adds 0.5x spread

    // Pickup radius upgrade
    const pickupBonus = upgrades.getStatBonus('pickupRadius')
    this.pickupRadius = 30 + pickupBonus

    // Damage reduction upgrade
    this.damageReduction = upgrades.getStatBonus('damageReduction')
  }

  /**
   * Get effective movement speed (with upgrades)
   */
  get speed(): number {
    const speedBonus = getUpgradeManager().getStatBonus('moveSpeed')
    return this.baseSpeed * (1 + speedBonus)
  }

  /**
   * Get effective damage multiplier (with temporary boost)
   */
  getEffectiveDamageMultiplier(): number {
    const baseMultiplier = 1 + getUpgradeManager().getStatBonus('damageMultiplier')
    const tempBoost = this.damageBoostTimer > 0 ? 2 : 1
    return baseMultiplier * tempBoost
  }

  /**
   * Get effective spread multiplier (with temporary boost)
   */
  getEffectiveSpreadMultiplier(): number {
    const spreadBonus = getUpgradeManager().getStatBonus('bonusSpread')
    const baseMultiplier = 1 + (spreadBonus * 0.5)
    const tempBoost = this.spreadBoostTimer > 0 ? 2 : 1
    return baseMultiplier * tempBoost
  }

  /**
   * Check if player has piercing shots upgrade
   */
  hasPiercingShots(): boolean {
    return getUpgradeManager().getStatBonus('piercingShots') > 0
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
    }

    if (this.spreadBoostTimer > 0) {
      this.spreadBoostTimer -= dt
    }

    // Health regeneration (from upgrades)
    const regenAmount = getUpgradeManager().getStatBonus('healthRegen')
    if (regenAmount > 0 && this.health < this.maxHealth) {
      this.regenTimer += dt
      if (this.regenTimer >= this.regenInterval) {
        this.regenTimer = 0
        this.heal(regenAmount)
      }
    }

    // Update weapon cooldown
    this.weapon.update(dt)

    this.updateSprite()
  }

  handleInput(input: InputState, dt: number): void {
    // Movement with speed upgrades
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

    // Apply damage reduction from upgrades
    const reducedDamage = Math.max(1, Math.floor(amount * (1 - this.damageReduction)))

    this.health -= reducedDamage
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

  addMoney(amount: number): void {
    // Money goes to the upgrade manager (applies money multiplier there)
    getUpgradeManager().addMoney(amount)
    this.money = getUpgradeManager().money
  }

  applyDamageBoost(duration: number): void {
    this.damageBoostTimer = duration
  }

  applySpreadBoost(duration: number): void {
    this.spreadBoostTimer = duration
  }

  addShield(hits: number): void {
    this.shield = Math.min(this.maxShield, this.shield + hits)
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
    this.regenTimer = 0
  }

  /**
   * Full reset for new game (reapply upgrades)
   */
  fullReset(): void {
    this.applyUpgrades()
    this.health = this.maxHealth
    this.lives = 3
    this.score = 0
    this.shield = 0
    this.damageBoostTimer = 0
    this.spreadBoostTimer = 0
    this.regenTimer = 0
    this.weapon = new Wrench()
    this.reset()
  }

  getDamageBoostTimeRemaining(): number {
    return this.damageBoostTimer
  }

  getSpreadBoostTimeRemaining(): number {
    return this.spreadBoostTimer
  }

  /**
   * Sync money from UpgradeManager
   */
  syncMoney(): void {
    this.money = getUpgradeManager().money
  }
}
