import * as PIXI from 'pixi.js'
import { Scene } from './Scene'
import { Game, GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { Player } from '../entities/Player'
import { Projectile, ProjectileConfig } from '../entities/Projectile'
import { Enemy, ENEMY_CONFIGS } from '../entities/Enemy'
import { Pickup } from '../entities/Pickup'
import { HUD } from '../ui/HUD'
import { Room, generateRoomConfig } from '../levels/Room'
import { aabbIntersects, angleBetween } from '../utils/Collision'
import { Pistol } from '../weapons/Pistol'
import { Shotgun } from '../weapons/Shotgun'
import { RapidFire } from '../weapons/RapidFire'
import { Laser } from '../weapons/Laser'
import { SpreadShot } from '../weapons/SpreadShot'
import { Boss } from '../bosses/Boss'
import { IRSCommissioner } from '../bosses/IRSCommissioner'
import { SenatorPair } from '../bosses/SenatorPair'
import { Speaker } from '../bosses/Speaker'
import { VicePresident } from '../bosses/VicePresident'
import { President } from '../bosses/President'
import {
  BossHazard,
  BeamSweep,
  Shockwave,
  LingeringZone,
  TargetReticle,
  Explosion,
  ReflectiveBarrier
} from '../bosses/attacks'

const CONTACT_DAMAGE = 10
const ROOM_CLEAR_BONUS = 500
const NO_DAMAGE_BONUS = 1000
const BOSS_CLEAR_BONUS = 2000
const DROP_CHANCE = 0.35 // 35% chance to drop a pickup

export class GameScene extends Scene {
  private player!: Player
  private projectiles: Projectile[] = []
  private pickups: Pickup[] = []
  private hud!: HUD
  private room!: Room

  // Boss tracking
  private currentBoss: Boss | null = null
  private isBossRoom: boolean = false
  private bossHazards: BossHazard[] = []

  // Boss health bar UI
  private bossHealthBarBg!: PIXI.Graphics
  private bossHealthBar!: PIXI.Graphics
  private bossNameText!: PIXI.Text

  private currentLevel: number = 1
  private currentRoom: number = 1
  private maxRoomsPerLevel: number[] = [0, 4, 5, 5, 6, 6] // Level 0 unused

  private backgroundLayer!: PIXI.Container
  private hazardLayer!: PIXI.Container
  private entityLayer!: PIXI.Container
  private projectileLayer!: PIXI.Container
  private uiLayer!: PIXI.Container

  private roomTransitionTimer: number = 0
  private isTransitioning: boolean = false
  private tookDamageThisRoom: boolean = false

  private roomClearedText!: PIXI.Text

  constructor(game: Game) {
    super(game)
  }

  init(): void {
    // Create layer structure
    this.backgroundLayer = new PIXI.Container()
    this.hazardLayer = new PIXI.Container()
    this.entityLayer = new PIXI.Container()
    this.projectileLayer = new PIXI.Container()
    this.uiLayer = new PIXI.Container()

    this.container.addChild(this.backgroundLayer)
    this.container.addChild(this.hazardLayer)
    this.container.addChild(this.entityLayer)
    this.container.addChild(this.projectileLayer)
    this.container.addChild(this.uiLayer)

    // Draw background
    this.drawBackground()

    // Create player
    this.player = new Player()
    this.entityLayer.addChild(this.player.sprite)

    // Create HUD
    this.hud = new HUD()
    this.uiLayer.addChild(this.hud.container)

    // Room cleared text (hidden initially)
    this.roomClearedText = new PIXI.Text('ROOM CLEARED!', {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#44ff44',
      stroke: '#000000',
      strokeThickness: 4
    })
    this.roomClearedText.anchor.set(0.5)
    this.roomClearedText.x = GAME_WIDTH / 2
    this.roomClearedText.y = GAME_HEIGHT / 2
    this.roomClearedText.visible = false
    this.uiLayer.addChild(this.roomClearedText)

    // Boss health bar (hidden initially)
    this.createBossHealthBar()

    // Start first room
    this.startRoom()
  }

  private createBossHealthBar(): void {
    const barWidth = 400
    const barHeight = 24
    const barX = (GAME_WIDTH - barWidth) / 2
    const barY = 30

    // Background
    this.bossHealthBarBg = new PIXI.Graphics()
    this.bossHealthBarBg.beginFill(0x333333)
    this.bossHealthBarBg.drawRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4)
    this.bossHealthBarBg.endFill()
    this.bossHealthBarBg.beginFill(0x111111)
    this.bossHealthBarBg.drawRect(barX, barY, barWidth, barHeight)
    this.bossHealthBarBg.endFill()
    this.bossHealthBarBg.visible = false
    this.uiLayer.addChild(this.bossHealthBarBg)

    // Health fill
    this.bossHealthBar = new PIXI.Graphics()
    this.bossHealthBar.visible = false
    this.uiLayer.addChild(this.bossHealthBar)

    // Boss name
    this.bossNameText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    })
    this.bossNameText.anchor.set(0.5, 1)
    this.bossNameText.x = GAME_WIDTH / 2
    this.bossNameText.y = barY - 4
    this.bossNameText.visible = false
    this.uiLayer.addChild(this.bossNameText)
  }

  private updateBossHealthBar(): void {
    if (!this.currentBoss || !this.currentBoss.active) {
      this.bossHealthBarBg.visible = false
      this.bossHealthBar.visible = false
      this.bossNameText.visible = false
      return
    }

    const barWidth = 400
    const barHeight = 24
    const barX = (GAME_WIDTH - barWidth) / 2
    const barY = 30

    const healthPercent = this.currentBoss.getHealthPercent()

    // Show health bar
    this.bossHealthBarBg.visible = true
    this.bossHealthBar.visible = true
    this.bossNameText.visible = true

    // Update health fill
    this.bossHealthBar.clear()

    // Color based on health
    let color = 0xff0000 // Red
    if (healthPercent > 0.5) color = 0x00ff00 // Green
    else if (healthPercent > 0.25) color = 0xffff00 // Yellow

    this.bossHealthBar.beginFill(color)
    this.bossHealthBar.drawRect(barX, barY, barWidth * healthPercent, barHeight)
    this.bossHealthBar.endFill()

    // Update name
    this.bossNameText.text = this.currentBoss.getName()
  }

  private drawBackground(): void {
    const bg = new PIXI.Graphics()

    // Floor
    bg.beginFill(0x2a2a3e)
    bg.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    bg.endFill()

    // Grid pattern
    bg.lineStyle(1, 0x3a3a4e, 0.5)
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      bg.moveTo(x, 0)
      bg.lineTo(x, GAME_HEIGHT)
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.moveTo(0, y)
      bg.lineTo(GAME_WIDTH, y)
    }

    // Wall borders
    bg.lineStyle(4, 0x555566)
    bg.drawRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4)

    this.backgroundLayer.addChild(bg)
  }

  private startRoom(): void {
    this.tookDamageThisRoom = false
    this.roomClearedText.visible = false

    // Clear old boss
    if (this.currentBoss) {
      if (this.currentBoss.sprite.parent) {
        this.currentBoss.sprite.parent.removeChild(this.currentBoss.sprite)
      }
      // Handle SenatorPair's second senator sprite
      if (this.currentBoss instanceof SenatorPair) {
        const secondSprite = (this.currentBoss as SenatorPair).getSecondSenatorSprite()
        if (secondSprite.parent) {
          secondSprite.parent.removeChild(secondSprite)
        }
      }
      this.currentBoss = null
    }

    // Clear old enemies and pickups
    for (const enemy of this.room?.enemies || []) {
      if (enemy.sprite.parent) {
        enemy.sprite.parent.removeChild(enemy.sprite)
      }
    }
    for (const pickup of this.pickups) {
      if (pickup.sprite.parent) {
        pickup.sprite.parent.removeChild(pickup.sprite)
      }
    }
    this.pickups = []

    // Clear projectiles
    for (const proj of this.projectiles) {
      if (proj.sprite.parent) {
        proj.sprite.parent.removeChild(proj.sprite)
      }
    }
    this.projectiles = []

    // Clear boss hazards
    for (const hazard of this.bossHazards) {
      if (hazard.graphics.parent) {
        hazard.graphics.parent.removeChild(hazard.graphics)
      }
      hazard.destroy()
    }
    this.bossHazards = []

    // Create new room
    const config = generateRoomConfig(this.currentLevel, this.currentRoom)
    this.room = new Room(config)
    this.isBossRoom = config.isBoss || false

    // Spawn boss if boss room
    if (this.isBossRoom && config.bossType) {
      this.spawnBoss(config.bossType)
    }

    this.room.start()

    // Position player at center (or bottom for boss rooms)
    this.player.x = GAME_WIDTH / 2
    this.player.y = this.isBossRoom ? GAME_HEIGHT * 0.75 : GAME_HEIGHT / 2
  }

  private spawnBoss(bossType: string): void {
    const spawnX = GAME_WIDTH / 2
    const spawnY = GAME_HEIGHT * 0.3

    switch (bossType) {
      case 'irs_commissioner':
        this.currentBoss = new IRSCommissioner(spawnX, spawnY)
        break
      case 'senator_pair':
      case 'senator_pair_2':
        this.currentBoss = new SenatorPair(spawnX * 0.5, spawnY)
        // Add second senator sprite
        this.entityLayer.addChild((this.currentBoss as SenatorPair).getSecondSenatorSprite())
        break
      case 'speaker':
        this.currentBoss = new Speaker(spawnX, spawnY)
        break
      case 'vice_president':
        this.currentBoss = new VicePresident(spawnX, spawnY)
        break
      case 'president':
        this.currentBoss = new President(spawnX, spawnY)
        break
      default:
        console.warn(`Unknown boss type: ${bossType}`)
        return
    }

    if (this.currentBoss) {
      this.entityLayer.addChild(this.currentBoss.sprite)
    }
  }

  update(dt: number): void {
    if (this.isTransitioning) {
      this.roomTransitionTimer -= dt
      if (this.roomTransitionTimer <= 0) {
        this.isTransitioning = false
        this.nextRoom()
      }
      return
    }

    const input = this.game.input.getState()

    // Update player
    this.player.handleInput(input, dt)
    this.player.update(dt)

    // Handle firing
    if (input.fire && this.player.weapon.canFire()) {
      const angle = angleBetween(
        this.player.x,
        this.player.y,
        input.aimX,
        input.aimY
      )
      this.fireWeapon(angle)
    }

    // Update room (spawn waves for non-boss rooms)
    if (!this.isBossRoom) {
      this.room.update(dt)
    }

    // Update boss
    if (this.currentBoss && this.currentBoss.active) {
      this.currentBoss.update(dt)
      this.currentBoss.updateAI(dt, this.player)

      // Process boss projectile requests
      for (const req of this.currentBoss.projectileRequests) {
        this.spawnBossProjectile(req.x, req.y, req.angle, req.speed, req.damage, req.type)
      }

      // Process boss minion requests
      for (const req of this.currentBoss.minionRequests) {
        this.spawnBossMinion(req.type, req.x, req.y)
      }
    }

    // Add new enemies to scene
    for (const enemy of this.room.enemies) {
      if (!enemy.sprite.parent) {
        this.entityLayer.addChild(enemy.sprite)
      }
    }

    // Update enemies
    for (const enemy of this.room.getAliveEnemies()) {
      enemy.update(dt)
      enemy.updateAI(dt, this.player)

      // Check if enemy wants to shoot
      if (enemy.wantsToShoot) {
        this.spawnEnemyProjectile(enemy)
      }
    }

    // Update projectiles
    for (const proj of this.projectiles) {
      if (proj.active) {
        proj.update(dt)
      }
    }

    // Update pickups
    for (const pickup of this.pickups) {
      if (pickup.active) {
        pickup.update(dt)
      }
    }

    // Update boss hazards
    for (const hazard of this.bossHazards) {
      if (hazard.active) {
        hazard.update(dt)
      }
    }

    // Handle collisions
    this.handleCollisions()

    // Clean up inactive entities
    this.cleanup()

    // Check room cleared (including boss defeat)
    if (this.checkRoomCleared() && !this.isTransitioning) {
      this.onRoomCleared()
    }

    // Update HUD
    this.hud.update(this.player, this.currentLevel, this.currentRoom)

    // Update boss health bar
    this.updateBossHealthBar()
  }

  private checkRoomCleared(): boolean {
    if (this.isBossRoom) {
      // Boss room cleared when boss is defeated
      return this.currentBoss !== null && !this.currentBoss.active
    } else {
      // Normal room cleared by Room logic
      return this.room.cleared
    }
  }

  private spawnBossProjectile(x: number, y: number, angle: number, speed: number, damage: number, type: string): void {
    const config: ProjectileConfig = {
      damage,
      speed,
      piercing: false,
      type,
      isPlayerProjectile: false
    }

    const proj = new Projectile(config, x, y, angle)
    this.projectiles.push(proj)
    this.projectileLayer.addChild(proj.sprite)
  }

  private spawnBossMinion(type: string, x: number, y: number): void {
    const config = ENEMY_CONFIGS[type]
    if (!config) {
      console.warn(`Unknown enemy type: ${type}`)
      return
    }

    const enemy = new Enemy(config, x, y)
    this.room.enemies.push(enemy)
    this.entityLayer.addChild(enemy.sprite)
  }

  /**
   * Spawn a beam sweep hazard
   */
  spawnBeamSweep(
    startAngle: number,
    endAngle: number,
    length: number,
    width: number,
    damage: number,
    duration: number
  ): BeamSweep | null {
    if (!this.currentBoss) return null

    const beam = new BeamSweep(
      this.currentBoss.x,
      this.currentBoss.y,
      startAngle,
      endAngle,
      length,
      width,
      damage,
      duration,
      this.currentBoss
    )

    this.bossHazards.push(beam)
    this.hazardLayer.addChild(beam.graphics)
    return beam
  }

  /**
   * Spawn a shockwave hazard
   */
  spawnShockwave(
    x: number,
    y: number,
    maxRadius: number,
    ringThickness: number,
    expansionSpeed: number,
    damage: number,
    color?: number
  ): Shockwave {
    const shockwave = new Shockwave(
      x,
      y,
      maxRadius,
      ringThickness,
      expansionSpeed,
      damage,
      color
    )

    this.bossHazards.push(shockwave)
    this.hazardLayer.addChild(shockwave.graphics)
    return shockwave
  }

  /**
   * Spawn a lingering zone hazard
   */
  spawnLingeringZone(
    x: number,
    y: number,
    radius: number,
    damage: number,
    duration: number,
    damageInterval?: number,
    color?: number
  ): LingeringZone {
    const zone = new LingeringZone(
      x,
      y,
      radius,
      damage,
      duration,
      damageInterval,
      color
    )

    this.bossHazards.push(zone)
    this.hazardLayer.addChild(zone.graphics)
    return zone
  }

  /**
   * Spawn a target reticle that creates an explosion after delay
   */
  spawnTargetReticle(
    x: number,
    y: number,
    radius: number,
    delay: number,
    explosionDamage: number
  ): TargetReticle {
    const reticle = new TargetReticle(x, y, radius, delay, (ex, ey, er) => {
      this.spawnExplosion(ex, ey, er, explosionDamage)
    })

    this.bossHazards.push(reticle)
    this.hazardLayer.addChild(reticle.graphics)
    return reticle
  }

  /**
   * Spawn an explosion hazard
   */
  spawnExplosion(
    x: number,
    y: number,
    radius: number,
    damage: number,
    duration?: number,
    color?: number
  ): Explosion {
    const explosion = new Explosion(x, y, radius, damage, duration, color)

    this.bossHazards.push(explosion)
    this.hazardLayer.addChild(explosion.graphics)
    return explosion
  }

  /**
   * Spawn a reflective barrier hazard
   */
  spawnReflectiveBarrier(
    angle: number,
    width: number,
    length: number,
    offsetDistance: number,
    damage: number,
    duration: number
  ): ReflectiveBarrier | null {
    if (!this.currentBoss) return null

    const barrier = new ReflectiveBarrier(
      this.currentBoss.x,
      this.currentBoss.y,
      angle,
      width,
      length,
      offsetDistance,
      damage,
      duration,
      this.currentBoss
    )

    this.bossHazards.push(barrier)
    this.hazardLayer.addChild(barrier.graphics)
    return barrier
  }

  private fireWeapon(baseAngle: number): void {
    const projectileConfigs = this.player.weapon.fire()
    if (!projectileConfigs) return

    const angles = this.player.weapon.getProjectileAngles(
      baseAngle,
      this.player.spreadMultiplier
    )

    for (let i = 0; i < angles.length; i++) {
      const config = projectileConfigs[i % projectileConfigs.length]
      config.damage = Math.floor(config.damage * this.player.damageMultiplier)

      const proj = new Projectile(
        config,
        this.player.x,
        this.player.y,
        angles[i]
      )
      this.projectiles.push(proj)
      this.projectileLayer.addChild(proj.sprite)
    }
  }

  private spawnEnemyProjectile(enemy: Enemy): void {
    const config: ProjectileConfig = {
      damage: enemy.config.damage,
      speed: enemy.getProjectileSpeed(),
      piercing: false,
      type: enemy.getProjectileType(),
      isPlayerProjectile: false
    }

    const proj = new Projectile(config, enemy.x, enemy.y, enemy.aimAngle)
    this.projectiles.push(proj)
    this.projectileLayer.addChild(proj.sprite)
  }

  private handleCollisions(): void {
    const playerBounds = this.player.getBounds()

    // Player projectiles vs enemies
    for (const proj of this.projectiles) {
      if (!proj.active || !proj.isPlayerProjectile) continue

      const projBounds = proj.getBounds()

      for (const enemy of this.room.getAliveEnemies()) {
        if (!enemy.active) continue
        if (proj.hasHit(enemy.id)) continue

        const enemyBounds = enemy.getBounds()

        if (aabbIntersects(projBounds, enemyBounds)) {
          proj.markHit(enemy.id)
          const killed = enemy.takeDamage(proj.damage)

          if (killed) {
            this.player.addScore(enemy.config.scoreValue)
            this.trySpawnPickup(enemy.x, enemy.y)
          }
        }
      }
    }

    // Player projectiles vs boss
    if (this.currentBoss && this.currentBoss.active) {
      const bossBounds = this.currentBoss.getBounds()

      for (const proj of this.projectiles) {
        if (!proj.active || !proj.isPlayerProjectile) continue
        if (proj.hasHit(this.currentBoss.id)) continue

        // Don't damage if boss is invulnerable
        if (this.currentBoss.isInvulnerable()) continue

        const projBounds = proj.getBounds()

        if (aabbIntersects(projBounds, bossBounds)) {
          proj.markHit(this.currentBoss.id)
          const killed = this.currentBoss.takeDamage(proj.damage)

          if (killed) {
            this.player.addScore(this.currentBoss.config.scoreValue)
            // Boss drops guaranteed pickup
            this.trySpawnPickup(this.currentBoss.x, this.currentBoss.y)
            this.trySpawnPickup(this.currentBoss.x + 30, this.currentBoss.y)
            this.trySpawnPickup(this.currentBoss.x - 30, this.currentBoss.y)
          }
        }
      }

      // Handle SenatorPair's second senator collision
      if (this.currentBoss instanceof SenatorPair) {
        const senatorPair = this.currentBoss as SenatorPair
        const secondBounds = {
          x: senatorPair.secondSenator.x - 32,
          y: senatorPair.secondSenator.y - 32,
          width: 64,
          height: 64
        }

        for (const proj of this.projectiles) {
          if (!proj.active || !proj.isPlayerProjectile) continue
          if (!senatorPair.canSecondSenatorTakeDamage()) continue

          const projBounds = proj.getBounds()

          if (aabbIntersects(projBounds, secondBounds)) {
            proj.markHit(this.currentBoss.id + 1000) // Unique ID for second senator
            // Damage goes to shared health pool
            senatorPair.takeDamage(proj.damage)
          }
        }
      }
    }

    // Enemy projectiles vs player
    for (const proj of this.projectiles) {
      if (!proj.active || proj.isPlayerProjectile) continue

      const projBounds = proj.getBounds()

      if (aabbIntersects(projBounds, playerBounds)) {
        proj.active = false
        const died = this.player.takeDamage(proj.damage)
        this.tookDamageThisRoom = true

        if (died) {
          this.onPlayerDeath()
          return
        }
      }
    }

    // Player vs enemies (contact damage)
    for (const enemy of this.room.getAliveEnemies()) {
      if (!enemy.active) continue

      const enemyBounds = enemy.getBounds()

      if (aabbIntersects(playerBounds, enemyBounds)) {
        const died = this.player.takeDamage(CONTACT_DAMAGE)
        this.tookDamageThisRoom = true

        if (died) {
          this.onPlayerDeath()
          return
        }
      }
    }

    // Player vs boss (contact damage)
    if (this.currentBoss && this.currentBoss.active) {
      const bossBounds = this.currentBoss.getBounds()

      if (aabbIntersects(playerBounds, bossBounds)) {
        const died = this.player.takeDamage(this.currentBoss.config.contactDamage)
        this.tookDamageThisRoom = true

        if (died) {
          this.onPlayerDeath()
          return
        }
      }

      // Check SenatorPair's second senator contact damage
      if (this.currentBoss instanceof SenatorPair) {
        const senatorPair = this.currentBoss as SenatorPair
        const secondBounds = {
          x: senatorPair.secondSenator.x - 32,
          y: senatorPair.secondSenator.y - 32,
          width: 64,
          height: 64
        }

        if (aabbIntersects(playerBounds, secondBounds)) {
          const died = this.player.takeDamage(this.currentBoss.config.contactDamage)
          this.tookDamageThisRoom = true

          if (died) {
            this.onPlayerDeath()
            return
          }
        }
      }
    }

    // Player vs pickups
    for (const pickup of this.pickups) {
      if (!pickup.active) continue

      const pickupBounds = pickup.getBounds()

      if (aabbIntersects(playerBounds, pickupBounds)) {
        this.collectPickup(pickup)
      }
    }

    // Player vs boss hazards
    for (const hazard of this.bossHazards) {
      if (!hazard.active) continue

      // Special handling for LingeringZone (damage over time)
      if (hazard instanceof LingeringZone) {
        const zone = hazard as LingeringZone
        if (zone.checkCollision(playerBounds) && zone.canDealDamage()) {
          const died = this.player.takeDamage(zone.damage)
          this.tookDamageThisRoom = true

          if (died) {
            this.onPlayerDeath()
            return
          }
        }
      } else if (hazard.checkCollision(playerBounds)) {
        // Standard hazard damage
        const died = this.player.takeDamage(hazard.damage)
        this.tookDamageThisRoom = true

        if (died) {
          this.onPlayerDeath()
          return
        }
      }

      // ReflectiveBarrier reflects player projectiles
      if (hazard instanceof ReflectiveBarrier) {
        const barrier = hazard as ReflectiveBarrier
        for (const proj of this.projectiles) {
          if (proj.active && proj.isPlayerProjectile) {
            barrier.checkProjectileReflection(proj)
          }
        }
      }
    }
  }

  private trySpawnPickup(x: number, y: number): void {
    if (Math.random() > DROP_CHANCE) return

    const type = Pickup.getRandomPickupType()
    const pickup = new Pickup(type, x, y)
    this.pickups.push(pickup)
    this.entityLayer.addChild(pickup.sprite)
  }

  private collectPickup(pickup: Pickup): void {
    pickup.active = false

    switch (pickup.pickupType) {
      case 'tax_refund_small':
        this.player.addScore(pickup.config.value || 100)
        break
      case 'tax_refund_large':
        this.player.addScore(pickup.config.value || 500)
        break
      case 'health':
        this.player.heal(pickup.config.value || 25)
        break
      case 'damage_boost':
        this.player.applyDamageBoost(pickup.config.duration || 10)
        break
      case 'spread_boost':
        this.player.applySpreadBoost(pickup.config.duration || 10)
        break
      case 'shield':
        this.player.addShield(pickup.config.value || 3)
        break
      case 'extra_life':
        this.player.addLife()
        break
      case 'weapon_pistol':
        this.player.setWeapon(new Pistol())
        break
      case 'weapon_shotgun':
        this.player.setWeapon(new Shotgun())
        break
      case 'weapon_rapidfire':
        this.player.setWeapon(new RapidFire())
        break
      case 'weapon_laser':
        this.player.setWeapon(new Laser())
        break
      case 'weapon_spread':
        this.player.setWeapon(new SpreadShot())
        break
    }
  }

  private cleanup(): void {
    // Remove inactive projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i]
      if (!proj.active) {
        if (proj.sprite.parent) {
          proj.sprite.parent.removeChild(proj.sprite)
        }
        this.projectiles.splice(i, 1)
      }
    }

    // Remove inactive enemies
    for (const enemy of this.room.enemies) {
      if (!enemy.active && enemy.sprite.parent) {
        enemy.sprite.parent.removeChild(enemy.sprite)
      }
    }

    // Remove inactive pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i]
      if (!pickup.active) {
        if (pickup.sprite.parent) {
          pickup.sprite.parent.removeChild(pickup.sprite)
        }
        this.pickups.splice(i, 1)
      }
    }

    // Remove inactive boss hazards
    for (let i = this.bossHazards.length - 1; i >= 0; i--) {
      const hazard = this.bossHazards[i]
      if (!hazard.active) {
        if (hazard.graphics.parent) {
          hazard.graphics.parent.removeChild(hazard.graphics)
        }
        hazard.destroy()
        this.bossHazards.splice(i, 1)
      }
    }
  }

  private onRoomCleared(): void {
    // Add bonuses
    this.player.addScore(ROOM_CLEAR_BONUS)
    if (!this.tookDamageThisRoom) {
      this.player.addScore(NO_DAMAGE_BONUS)
    }

    // Extra bonus for boss defeat
    if (this.isBossRoom) {
      this.player.addScore(BOSS_CLEAR_BONUS)
    }

    // Show room cleared message
    this.roomClearedText.visible = true
    this.isTransitioning = true
    this.roomTransitionTimer = this.isBossRoom ? 3 : 2 // Longer pause after boss

    // Update message based on what was defeated
    if (this.isBossRoom) {
      if (this.currentLevel >= 5) {
        this.roomClearedText.text = 'VICTORY!\nYou Defeated President Maxwell!'
        this.roomClearedText.style.fill = '#ffff00'
      } else {
        this.roomClearedText.text = `BOSS DEFEATED!\nLevel ${this.currentLevel} Complete!`
        this.roomClearedText.style.fill = '#ff8800'
      }
    } else if (this.currentRoom >= this.maxRoomsPerLevel[this.currentLevel]) {
      this.roomClearedText.text = `LEVEL ${this.currentLevel} COMPLETE!`
    } else {
      this.roomClearedText.text = 'ROOM CLEARED!'
      this.roomClearedText.style.fill = '#44ff44'
    }
  }

  private nextRoom(): void {
    this.currentRoom++

    if (this.currentRoom > this.maxRoomsPerLevel[this.currentLevel]) {
      // Next level
      this.currentLevel++
      this.currentRoom = 1

      if (this.currentLevel > 5) {
        // Game won!
        this.game.sceneManager.switchTo('gameover', { score: this.player.score })
        return
      }
    }

    this.startRoom()
  }

  private onPlayerDeath(): void {
    if (this.player.lives <= 0) {
      this.game.sceneManager.switchTo('gameover', { score: this.player.score })
    } else {
      // Respawn in same room
      this.player.reset()
      this.startRoom()
    }
  }

  destroy(): void {
    this.hud.destroy()
    if (this.room) {
      this.room.destroy()
    }
    if (this.currentBoss) {
      if (this.currentBoss.sprite.parent) {
        this.currentBoss.sprite.parent.removeChild(this.currentBoss.sprite)
      }
      if (this.currentBoss instanceof SenatorPair) {
        const secondSprite = (this.currentBoss as SenatorPair).getSecondSenatorSprite()
        if (secondSprite.parent) {
          secondSprite.parent.removeChild(secondSprite)
        }
      }
    }
    // Clean up boss hazards
    for (const hazard of this.bossHazards) {
      if (hazard.graphics.parent) {
        hazard.graphics.parent.removeChild(hazard.graphics)
      }
      hazard.destroy()
    }
    this.bossHazards = []

    super.destroy()
  }
}
