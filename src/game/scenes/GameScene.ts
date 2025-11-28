import * as PIXI from 'pixi.js'
import { Scene } from './Scene'
import { Game, GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { Player } from '../entities/Player'
import { Projectile, ProjectileConfig } from '../entities/Projectile'
import { Enemy } from '../entities/Enemy'
import { Pickup } from '../entities/Pickup'
import { HUD } from '../ui/HUD'
import { Room, generateRoomConfig } from '../levels/Room'
import { aabbIntersects, angleBetween } from '../utils/Collision'
import { Pistol } from '../weapons/Pistol'
import { Shotgun } from '../weapons/Shotgun'
import { RapidFire } from '../weapons/RapidFire'
import { Laser } from '../weapons/Laser'
import { SpreadShot } from '../weapons/SpreadShot'

const CONTACT_DAMAGE = 10
const ROOM_CLEAR_BONUS = 500
const NO_DAMAGE_BONUS = 1000
const DROP_CHANCE = 0.35 // 35% chance to drop a pickup

export class GameScene extends Scene {
  private player!: Player
  private projectiles: Projectile[] = []
  private pickups: Pickup[] = []
  private hud!: HUD
  private room!: Room

  private currentLevel: number = 1
  private currentRoom: number = 1
  private maxRoomsPerLevel: number[] = [0, 4, 5, 5, 6, 6] // Level 0 unused

  private backgroundLayer!: PIXI.Container
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
    this.entityLayer = new PIXI.Container()
    this.projectileLayer = new PIXI.Container()
    this.uiLayer = new PIXI.Container()

    this.container.addChild(this.backgroundLayer)
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

    // Start first room
    this.startRoom()
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

    // Create new room
    const config = generateRoomConfig(this.currentLevel, this.currentRoom)
    this.room = new Room(config)
    this.room.start()

    // Position player at center
    this.player.x = GAME_WIDTH / 2
    this.player.y = GAME_HEIGHT / 2
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

    // Update room (spawn waves)
    this.room.update(dt)

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

    // Handle collisions
    this.handleCollisions()

    // Clean up inactive entities
    this.cleanup()

    // Check room cleared
    if (this.room.cleared && !this.isTransitioning) {
      this.onRoomCleared()
    }

    // Update HUD
    this.hud.update(this.player, this.currentLevel, this.currentRoom)
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

    // Player vs pickups
    for (const pickup of this.pickups) {
      if (!pickup.active) continue

      const pickupBounds = pickup.getBounds()

      if (aabbIntersects(playerBounds, pickupBounds)) {
        this.collectPickup(pickup)
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
  }

  private onRoomCleared(): void {
    // Add bonuses
    this.player.addScore(ROOM_CLEAR_BONUS)
    if (!this.tookDamageThisRoom) {
      this.player.addScore(NO_DAMAGE_BONUS)
    }

    // Show room cleared message
    this.roomClearedText.visible = true
    this.isTransitioning = true
    this.roomTransitionTimer = 2

    // Check for level complete
    if (this.currentRoom >= this.maxRoomsPerLevel[this.currentLevel]) {
      // Check for game complete
      if (this.currentLevel >= 5) {
        this.roomClearedText.text = 'VICTORY!'
        this.roomClearedText.style.fill = '#ffff00'
        // After transition, go to game over with win state
      } else {
        this.roomClearedText.text = `LEVEL ${this.currentLevel} COMPLETE!`
      }
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
    super.destroy()
  }
}
