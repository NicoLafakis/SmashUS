import { Entity } from './Entity'
import { Player } from './Player'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { SpriteGenerator } from '../utils/SpriteGenerator'
import { angleBetween, distance } from '../utils/Collision'

export interface EnemyConfig {
  type: string
  health: number
  speed: number
  damage: number
  scoreValue: number
  attackRange?: number
  attackCooldown?: number
}

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  intern: {
    type: 'intern',
    health: 10,
    speed: 250,
    damage: 5,
    scoreValue: 50
  },
  bureaucrat: {
    type: 'bureaucrat',
    health: 40,
    speed: 100,
    damage: 10,
    scoreValue: 100,
    attackRange: 300,
    attackCooldown: 2
  },
  irs_agent: {
    type: 'irs_agent',
    health: 30,
    speed: 150,
    damage: 15,
    scoreValue: 150,
    attackRange: 400,
    attackCooldown: 1.5
  },
  secret_service: {
    type: 'secret_service',
    health: 25,
    speed: 200,
    damage: 12,
    scoreValue: 200,
    attackRange: 350,
    attackCooldown: 0.8
  },
  lobbyist: {
    type: 'lobbyist',
    health: 35,
    speed: 120,
    damage: 8,
    scoreValue: 250,
    attackRange: 250,
    attackCooldown: 3
  },
  camera_drone: {
    type: 'camera_drone',
    health: 15,
    speed: 80,
    damage: 8,
    scoreValue: 100,
    attackRange: 350,
    attackCooldown: 1.2
  }
}

let enemyIdCounter = 0

export class Enemy extends Entity {
  public id: number
  public config: EnemyConfig
  public health: number
  private attackTimer: number = 0
  private stateTimer: number = 0
  private fleeDirection: number = 0
  public wantsToShoot: boolean = false
  public aimAngle: number = 0

  constructor(config: EnemyConfig, x: number, y: number) {
    super(SpriteGenerator.generateEnemySprite(config.type), 28, 28)
    this.id = ++enemyIdCounter
    this.config = config
    this.health = config.health
    this.x = x
    this.y = y

    // Larger hitbox for bureaucrat
    if (config.type === 'bureaucrat') {
      this.width = 36
      this.height = 32
      this.sprite.scale.set(1.2)
    }
  }

  update(dt: number): void {
    // Attack cooldown
    if (this.attackTimer > 0) {
      this.attackTimer -= dt
    }

    this.stateTimer -= dt

    this.updateSprite()
  }

  updateAI(dt: number, player: Player): void {
    const dist = distance(this.x, this.y, player.x, player.y)
    const angle = angleBetween(this.x, this.y, player.x, player.y)

    this.wantsToShoot = false

    // Different behaviors based on type
    switch (this.config.type) {
      case 'intern':
        // Just chase the player
        this.moveToward(player.x, player.y, this.config.speed, dt)
        break

      case 'bureaucrat':
        // Slow, ranged attacker
        if (dist > this.config.attackRange!) {
          this.moveToward(player.x, player.y, this.config.speed, dt)
        } else {
          // Stop and attack
          if (this.attackTimer <= 0) {
            this.wantsToShoot = true
            this.aimAngle = angle
            this.attackTimer = this.config.attackCooldown!
          }
        }
        break

      case 'irs_agent':
        // Medium range, moves and shoots
        if (dist > this.config.attackRange!) {
          this.moveToward(player.x, player.y, this.config.speed, dt)
        } else if (dist < 150) {
          // Too close, back off
          this.moveToward(player.x, player.y, -this.config.speed * 0.5, dt)
        }
        if (dist <= this.config.attackRange! && this.attackTimer <= 0) {
          this.wantsToShoot = true
          this.aimAngle = angle
          this.attackTimer = this.config.attackCooldown!
        }
        break

      case 'secret_service':
        // Fast, flanking movement
        if (this.stateTimer <= 0) {
          this.stateTimer = 1 + Math.random() * 1
          // Pick a flanking direction
          this.fleeDirection = angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2)
        }
        if (dist > 200) {
          this.moveToward(player.x, player.y, this.config.speed, dt)
        } else {
          // Strafe around player
          const strafeX = this.x + Math.cos(this.fleeDirection) * this.config.speed * dt
          const strafeY = this.y + Math.sin(this.fleeDirection) * this.config.speed * dt
          this.x = Math.max(20, Math.min(GAME_WIDTH - 20, strafeX))
          this.y = Math.max(20, Math.min(GAME_HEIGHT - 20, strafeY))
        }
        if (dist <= this.config.attackRange! && this.attackTimer <= 0) {
          this.wantsToShoot = true
          this.aimAngle = angle
          this.attackTimer = this.config.attackCooldown!
        }
        break

      case 'lobbyist':
        // Avoids player, drops traps (simplified to ranged for now)
        if (dist < 200) {
          // Flee
          this.moveToward(player.x, player.y, -this.config.speed, dt)
        } else if (dist > 400) {
          this.moveToward(player.x, player.y, this.config.speed, dt)
        }
        if (this.attackTimer <= 0) {
          this.wantsToShoot = true
          this.aimAngle = angle
          this.attackTimer = this.config.attackCooldown!
        }
        break

      case 'camera_drone':
        // Floats and circles around, shooting at player
        if (this.stateTimer <= 0) {
          this.stateTimer = 2 + Math.random() * 2
          // Pick a random orbit direction
          this.fleeDirection = Math.random() * Math.PI * 2
        }
        // Hover behavior - float in circular pattern
        const orbitAngle = this.fleeDirection + this.stateTimer * 0.5
        const targetDist = 200 + Math.sin(this.stateTimer * 2) * 50
        const targetX = player.x + Math.cos(orbitAngle) * targetDist
        const targetY = player.y + Math.sin(orbitAngle) * targetDist
        this.moveToward(targetX, targetY, this.config.speed, dt)

        // Always try to shoot when in range
        if (dist <= this.config.attackRange! && this.attackTimer <= 0) {
          this.wantsToShoot = true
          this.aimAngle = angle
          this.attackTimer = this.config.attackCooldown!
        }
        break
    }

    // Face player
    if (player.x < this.x) {
      this.sprite.scale.x = -Math.abs(this.sprite.scale.x)
    } else {
      this.sprite.scale.x = Math.abs(this.sprite.scale.x)
    }
  }

  private moveToward(targetX: number, targetY: number, speed: number, dt: number): void {
    const angle = angleBetween(this.x, this.y, targetX, targetY)
    this.x += Math.cos(angle) * speed * dt
    this.y += Math.sin(angle) * speed * dt

    // Clamp to arena
    this.x = Math.max(20, Math.min(GAME_WIDTH - 20, this.x))
    this.y = Math.max(20, Math.min(GAME_HEIGHT - 20, this.y))
  }

  takeDamage(amount: number): boolean {
    this.health -= amount

    // Flash red
    this.sprite.tint = 0xff0000
    setTimeout(() => {
      if (this.sprite && !this.sprite.destroyed) {
        this.sprite.tint = 0xffffff
      }
    }, 100)

    if (this.health <= 0) {
      this.active = false
      return true
    }
    return false
  }

  getProjectileType(): string {
    switch (this.config.type) {
      case 'bureaucrat':
        return 'paperwork'
      case 'irs_agent':
        return 'audit_beam'
      case 'secret_service':
        return 'enemy_pistol'
      case 'lobbyist':
        return 'enemy_pistol' // Money projectile could be added
      case 'camera_drone':
        return 'drone_shot'
      default:
        return 'enemy_pistol'
    }
  }

  getProjectileSpeed(): number {
    switch (this.config.type) {
      case 'bureaucrat':
        return 200
      case 'irs_agent':
        return 350
      case 'secret_service':
        return 400
      case 'lobbyist':
        return 250
      case 'camera_drone':
        return 320
      default:
        return 300
    }
  }
}
