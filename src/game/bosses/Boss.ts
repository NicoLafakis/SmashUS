import * as PIXI from 'pixi.js'
import { Entity } from '../entities/Entity'
import { Player } from '../entities/Player'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { angleBetween, distance } from '../utils/Collision'
import { EnemyConfig } from '../entities/Enemy'

/**
 * Boss state machine states
 */
export enum BossState {
  IDLE = 'idle',
  ATTACKING = 'attacking',
  RECOVERING = 'recovering',
  TRANSITIONING = 'transitioning', // Phase transition state
}

/**
 * Boss phases based on health percentage
 * Phase 1: 100% to 76% health
 * Phase 2: 75% to 51% health
 * Phase 3: 50% to 26% health
 * Phase 4: 25% to 0% health
 */
export enum BossPhase {
  PHASE_1 = 1,
  PHASE_2 = 2,
  PHASE_3 = 3,
  PHASE_4 = 4,
}

/**
 * Configuration for a boss attack pattern
 */
export interface BossAttack {
  name: string
  duration: number // How long the attack lasts
  cooldown: number // Recovery time after attack
  minPhase: BossPhase // Minimum phase required to use this attack
  execute: (boss: Boss, player: Player, dt: number) => void
}

/**
 * Configuration for boss entity
 */
export interface BossConfig {
  type: string
  name: string // Display name for health bar
  maxHealth: number
  speed: number
  contactDamage: number
  scoreValue: number
  width: number
  height: number
  attacks: BossAttack[]
}

/**
 * Request for the boss to spawn a projectile
 * GameScene will handle actual projectile creation
 */
export interface BossProjectileRequest {
  x: number
  y: number
  angle: number
  speed: number
  damage: number
  type: string
}

/**
 * Request for the boss to spawn a minion enemy
 * GameScene will handle actual enemy creation
 */
export interface BossMinionRequest {
  type: string // Enemy type from ENEMY_CONFIGS
  x: number
  y: number
}

let bossIdCounter = 0

/**
 * Base class for all boss enemies.
 * Extends Entity and provides:
 * - Phase tracking based on health percentage
 * - State machine for attack patterns
 * - Projectile spawn requests
 * - Minion spawn requests
 * - Larger hitbox and sprite than regular enemies
 */
export abstract class Boss extends Entity {
  public id: number
  public config: BossConfig
  public health: number
  public maxHealth: number

  // Phase tracking
  protected currentPhase: BossPhase = BossPhase.PHASE_1
  protected previousPhase: BossPhase = BossPhase.PHASE_1
  protected phaseJustChanged: boolean = false

  // State machine
  protected state: BossState = BossState.IDLE
  protected stateTimer: number = 0
  protected idleDuration: number = 1.0 // Time between attacks

  // Attack management
  protected currentAttack: BossAttack | null = null
  protected attackTimer: number = 0
  protected recoveryTimer: number = 0
  protected attackIndex: number = -1

  // Spawn requests (consumed by GameScene each frame)
  public projectileRequests: BossProjectileRequest[] = []
  public minionRequests: BossMinionRequest[] = []

  // Visual feedback
  protected flashTimer: number = 0
  protected isFlashing: boolean = false

  // Movement
  protected targetX: number = GAME_WIDTH / 2
  protected targetY: number = GAME_HEIGHT / 2

  constructor(config: BossConfig, x: number, y: number, texture: PIXI.Texture) {
    super(texture, config.width, config.height)
    this.id = ++bossIdCounter
    this.config = config
    this.health = config.maxHealth
    this.maxHealth = config.maxHealth
    this.x = x
    this.y = y

    // Scale sprite to match hitbox if needed
    this.sprite.scale.set(config.width / this.sprite.texture.width)
  }

  /**
   * Main update loop - handles state machine and phase tracking
   */
  update(dt: number): void {
    // Update phase based on health
    this.updatePhase()

    // Handle flash effect
    if (this.isFlashing) {
      this.flashTimer -= dt
      if (this.flashTimer <= 0) {
        this.isFlashing = false
        this.sprite.tint = 0xffffff
      }
    }

    this.updateSprite()
  }

  /**
   * AI update - called separately to allow player reference
   * Handles state machine transitions and attack execution
   */
  updateAI(dt: number, player: Player): void {
    // Clear spawn requests from previous frame
    this.projectileRequests = []
    this.minionRequests = []

    // Handle phase transition
    if (this.phaseJustChanged) {
      this.onPhaseChange(this.currentPhase)
      this.phaseJustChanged = false
    }

    // State machine
    switch (this.state) {
      case BossState.IDLE:
        this.updateIdleState(dt, player)
        break
      case BossState.ATTACKING:
        this.updateAttackingState(dt, player)
        break
      case BossState.RECOVERING:
        this.updateRecoveringState(dt, player)
        break
      case BossState.TRANSITIONING:
        this.updateTransitioningState(dt, player)
        break
    }

    // Face player
    if (player.x < this.x) {
      this.sprite.scale.x = -Math.abs(this.sprite.scale.x)
    } else {
      this.sprite.scale.x = Math.abs(this.sprite.scale.x)
    }
  }

  /**
   * Calculate current phase based on health percentage
   */
  protected updatePhase(): void {
    const healthPercent = this.health / this.maxHealth

    let newPhase: BossPhase
    if (healthPercent > 0.75) {
      newPhase = BossPhase.PHASE_1
    } else if (healthPercent > 0.5) {
      newPhase = BossPhase.PHASE_2
    } else if (healthPercent > 0.25) {
      newPhase = BossPhase.PHASE_3
    } else {
      newPhase = BossPhase.PHASE_4
    }

    if (newPhase !== this.currentPhase) {
      this.previousPhase = this.currentPhase
      this.currentPhase = newPhase
      this.phaseJustChanged = true
    }
  }

  /**
   * Called when boss enters a new phase
   * Override in subclasses for phase-specific behavior
   */
  protected onPhaseChange(_phase: BossPhase): void {
    // Enter transition state briefly
    this.state = BossState.TRANSITIONING
    this.stateTimer = 0.5 // Brief pause during phase transition

    // Flash white to indicate phase change
    this.sprite.tint = 0xffffff
    this.isFlashing = true
    this.flashTimer = 0.3
  }

  /**
   * Idle state - wait before next attack
   */
  protected updateIdleState(dt: number, player: Player): void {
    this.stateTimer -= dt

    // Optional: Move during idle
    this.updateMovement(dt, player)

    if (this.stateTimer <= 0) {
      this.selectAndStartAttack(player)
    }
  }

  /**
   * Attacking state - execute current attack
   */
  protected updateAttackingState(dt: number, player: Player): void {
    if (!this.currentAttack) {
      this.state = BossState.IDLE
      this.stateTimer = this.idleDuration
      return
    }

    this.attackTimer -= dt

    // Execute attack logic
    this.currentAttack.execute(this, player, dt)

    if (this.attackTimer <= 0) {
      // Attack finished, enter recovery
      this.state = BossState.RECOVERING
      this.recoveryTimer = this.currentAttack.cooldown
    }
  }

  /**
   * Recovering state - cooldown after attack
   */
  protected updateRecoveringState(dt: number, player: Player): void {
    this.recoveryTimer -= dt

    // Optional: Move during recovery
    this.updateMovement(dt, player)

    if (this.recoveryTimer <= 0) {
      this.state = BossState.IDLE
      this.stateTimer = this.idleDuration
      this.currentAttack = null
    }
  }

  /**
   * Transitioning state - brief pause during phase change
   */
  protected updateTransitioningState(dt: number, _player: Player): void {
    this.stateTimer -= dt

    if (this.stateTimer <= 0) {
      this.state = BossState.IDLE
      this.stateTimer = this.idleDuration * 0.5 // Shorter idle after transition
    }
  }

  /**
   * Select an attack based on current phase and start it
   */
  protected selectAndStartAttack(player: Player): void {
    // Get attacks available in current phase
    const availableAttacks = this.config.attacks.filter(
      (attack) => attack.minPhase <= this.currentPhase
    )

    if (availableAttacks.length === 0) {
      // No attacks available, stay idle
      this.stateTimer = this.idleDuration
      return
    }

    // Select attack (can be overridden for specific patterns)
    this.currentAttack = this.selectAttack(availableAttacks, player)

    if (this.currentAttack) {
      this.state = BossState.ATTACKING
      this.attackTimer = this.currentAttack.duration
    } else {
      this.stateTimer = this.idleDuration
    }
  }

  /**
   * Select which attack to use from available attacks
   * Default: random selection. Override for specific patterns.
   */
  protected selectAttack(availableAttacks: BossAttack[], _player: Player): BossAttack | null {
    if (availableAttacks.length === 0) return null

    // Avoid repeating the same attack twice in a row if possible
    let filteredAttacks = availableAttacks
    if (availableAttacks.length > 1 && this.currentAttack) {
      filteredAttacks = availableAttacks.filter((a) => a.name !== this.currentAttack!.name)
    }

    const index = Math.floor(Math.random() * filteredAttacks.length)
    return filteredAttacks[index]
  }

  /**
   * Default movement behavior - override in subclasses
   */
  protected updateMovement(dt: number, player: Player): void {
    // Default: slowly move toward center of arena
    this.moveToward(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.config.speed * 0.5, dt)
  }

  /**
   * Move toward a target position
   */
  protected moveToward(targetX: number, targetY: number, speed: number, dt: number): void {
    const dist = distance(this.x, this.y, targetX, targetY)
    if (dist < 5) return // Close enough

    const angle = angleBetween(this.x, this.y, targetX, targetY)
    this.x += Math.cos(angle) * speed * dt
    this.y += Math.sin(angle) * speed * dt

    // Clamp to arena bounds (with margin for boss size)
    const margin = Math.max(this.width, this.height) / 2
    this.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.x))
    this.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.y))
  }

  /**
   * Take damage and check for death
   * Returns true if boss was killed
   */
  takeDamage(amount: number): boolean {
    this.health -= amount

    // Flash red
    this.sprite.tint = 0xff0000
    this.isFlashing = true
    this.flashTimer = 0.1

    if (this.health <= 0) {
      this.health = 0
      this.active = false
      return true
    }
    return false
  }

  /**
   * Request a projectile spawn
   * Called during attack execution
   */
  protected spawnProjectile(
    offsetX: number,
    offsetY: number,
    angle: number,
    speed: number,
    damage: number,
    type: string
  ): void {
    this.projectileRequests.push({
      x: this.x + offsetX,
      y: this.y + offsetY,
      angle,
      speed,
      damage,
      type,
    })
  }

  /**
   * Request a minion spawn
   * Called during attack execution
   */
  protected spawnMinion(type: string, offsetX: number = 0, offsetY: number = 0): void {
    this.minionRequests.push({
      type,
      x: this.x + offsetX,
      y: this.y + offsetY,
    })
  }

  /**
   * Fire projectiles in a circular pattern
   */
  protected fireCircularBurst(
    count: number,
    speed: number,
    damage: number,
    type: string,
    startAngle: number = 0
  ): void {
    const angleStep = (Math.PI * 2) / count
    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleStep
      this.spawnProjectile(0, 0, angle, speed, damage, type)
    }
  }

  /**
   * Fire projectiles in a spread pattern toward player
   */
  protected fireSpreadAtPlayer(
    player: Player,
    count: number,
    spreadAngle: number,
    speed: number,
    damage: number,
    type: string
  ): void {
    const baseAngle = angleBetween(this.x, this.y, player.x, player.y)
    const startAngle = baseAngle - spreadAngle / 2

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (spreadAngle * i) / (count - 1 || 1)
      this.spawnProjectile(0, 0, angle, speed, damage, type)
    }
  }

  /**
   * Fire a single projectile at the player
   */
  protected fireAtPlayer(player: Player, speed: number, damage: number, type: string): void {
    const angle = angleBetween(this.x, this.y, player.x, player.y)
    this.spawnProjectile(0, 0, angle, speed, damage, type)
  }

  /**
   * Get health percentage (0-1)
   */
  getHealthPercent(): number {
    return this.health / this.maxHealth
  }

  /**
   * Get current phase
   */
  getPhase(): BossPhase {
    return this.currentPhase
  }

  /**
   * Get current state
   */
  getState(): BossState {
    return this.state
  }

  /**
   * Get boss display name
   */
  getName(): string {
    return this.config.name
  }

  /**
   * Check if boss is in an invulnerable state (like transitioning)
   */
  isInvulnerable(): boolean {
    return this.state === BossState.TRANSITIONING
  }
}
