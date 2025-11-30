import * as PIXI from 'pixi.js'
import { Boss, BossConfig, BossAttack, BossPhase, BossState } from './Boss'
import { Player } from '../entities/Player'
import { SpriteGenerator } from '../utils/SpriteGenerator'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { angleBetween, distance } from '../utils/Collision'

/**
 * Senator Pair Boss - "Senator Thornwood & Senator Caldwell"
 * Level 2 and 4 Boss (appears twice with increased difficulty)
 *
 * Unique mechanic: Two senators that fight together
 * - Coordinated Fire: Both shoot at player simultaneously
 * - Filibuster: One becomes invincible while other attacks aggressively
 * - Legislative Barrage: Alternating rapid fire
 */

interface SenatorPairState {
  filibusterActive: boolean
  filibusteringSenator: 'navy' | 'charcoal' | null
  filibusterTimer: number
  barragePattern: number
  lastBarrageShot: number
  coordinatedFireCount: number
}

// Secondary senator sprite and position (managed by main boss)
interface SecondarySenator {
  sprite: PIXI.Sprite
  x: number
  y: number
  isInvincible: boolean
}

function createAttacks(): BossAttack[] {
  return [
    // Coordinated Fire - Phase 1
    {
      name: 'Coordinated Fire',
      windUpTime: 0.6,
      duration: 2.0,
      cooldown: 1.5,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'aim',
      onWindUp: (boss: Boss) => {
        const state = (boss as SenatorPair).attackState
        state.coordinatedFireCount = 0
      },
      execute: (boss: Boss, player: Player, _dt: number, attackTime: number) => {
        const senatorBoss = boss as SenatorPair
        const state = senatorBoss.attackState

        // Fire every 0.3 seconds
        const fireInterval = senatorBoss.getPhase() >= BossPhase.PHASE_3 ? 0.2 : 0.3
        const expectedShots = Math.floor(attackTime / fireInterval)

        if (expectedShots > state.coordinatedFireCount) {
          state.coordinatedFireCount = expectedShots

          // Both senators fire at player
          const angle1 = angleBetween(boss.x, boss.y, player.x, player.y)
          const angle2 = angleBetween(
            senatorBoss.secondSenator.x,
            senatorBoss.secondSenator.y,
            player.x,
            player.y
          )

          boss.projectileRequests.push({
            x: boss.x,
            y: boss.y,
            angle: angle1,
            speed: 300,
            damage: 12,
            type: 'legislation'
          })

          boss.projectileRequests.push({
            x: senatorBoss.secondSenator.x,
            y: senatorBoss.secondSenator.y,
            angle: angle2,
            speed: 300,
            damage: 12,
            type: 'legislation'
          })
        }
      }
    },

    // Filibuster - Phase 1
    {
      name: 'Filibuster',
      windUpTime: 1.0,
      duration: 4.0,
      cooldown: 3.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'stance',
      onWindUp: (boss: Boss) => {
        const senatorBoss = boss as SenatorPair
        const state = senatorBoss.attackState

        // Randomly choose which senator filibusters
        state.filibusteringSenator = Math.random() > 0.5 ? 'navy' : 'charcoal'
        state.filibusterActive = true
        state.filibusterTimer = 0

        // Make the filibustering senator invincible
        if (state.filibusteringSenator === 'navy') {
          // Main boss is invincible during their filibuster
          senatorBoss.secondSenator.isInvincible = false
        } else {
          senatorBoss.secondSenator.isInvincible = true
        }
      },
      execute: (boss: Boss, player: Player, dt: number, attackTime: number) => {
        const senatorBoss = boss as SenatorPair
        const state = senatorBoss.attackState

        state.filibusterTimer += dt

        // The non-filibustering senator attacks aggressively
        const attackerX = state.filibusteringSenator === 'navy'
          ? senatorBoss.secondSenator.x
          : boss.x
        const attackerY = state.filibusteringSenator === 'navy'
          ? senatorBoss.secondSenator.y
          : boss.y

        // Fire rapidly
        const fireRate = senatorBoss.getPhase() >= BossPhase.PHASE_3 ? 0.15 : 0.2
        const shotNumber = Math.floor(attackTime / fireRate)
        const lastShotNumber = Math.floor((attackTime - dt) / fireRate)

        if (shotNumber > lastShotNumber) {
          const angle = angleBetween(attackerX, attackerY, player.x, player.y)

          // Add some spread for aggression
          const spread = (Math.random() - 0.5) * 0.3

          boss.projectileRequests.push({
            x: attackerX,
            y: attackerY,
            angle: angle + spread,
            speed: 350,
            damage: 10,
            type: 'legislation'
          })
        }

        // Create damaging zone around filibustering senator
        // (Visual effect - flash the filibustering senator)
        if (Math.floor(attackTime * 4) % 2 === 0) {
          // Flash the filibustering senator
          if (state.filibusteringSenator === 'navy') {
            boss.sprite.tint = 0x8888ff
          } else {
            senatorBoss.secondSenator.sprite.tint = 0x8888ff
          }
        } else {
          boss.sprite.tint = 0xffffff
          senatorBoss.secondSenator.sprite.tint = 0xffffff
        }
      }
    },

    // Legislative Barrage - Phase 2
    {
      name: 'Legislative Barrage',
      windUpTime: 0.5,
      duration: 3.0,
      cooldown: 2.0,
      minPhase: BossPhase.PHASE_2,
      visualTell: 'ready',
      onWindUp: (boss: Boss) => {
        const state = (boss as SenatorPair).attackState
        state.barragePattern = 0
        state.lastBarrageShot = -1
      },
      execute: (boss: Boss, player: Player, _dt: number, attackTime: number) => {
        const senatorBoss = boss as SenatorPair
        const state = senatorBoss.attackState

        // Alternating rapid fire creating wave pattern
        const fireRate = 0.1
        const shotNumber = Math.floor(attackTime / fireRate)

        if (shotNumber > state.lastBarrageShot) {
          state.lastBarrageShot = shotNumber

          // Alternate between senators
          const isNavyTurn = shotNumber % 2 === 0
          const shooterX = isNavyTurn ? boss.x : senatorBoss.secondSenator.x
          const shooterY = isNavyTurn ? boss.y : senatorBoss.secondSenator.y

          const baseAngle = angleBetween(shooterX, shooterY, player.x, player.y)

          // Create wave pattern with varying angles
          const waveOffset = Math.sin(attackTime * 8) * 0.4

          boss.projectileRequests.push({
            x: shooterX,
            y: shooterY,
            angle: baseAngle + waveOffset,
            speed: 280,
            damage: 8,
            type: 'legislation'
          })

          // In later phases, fire additional projectiles
          if (senatorBoss.getPhase() >= BossPhase.PHASE_3) {
            boss.projectileRequests.push({
              x: shooterX,
              y: shooterY,
              angle: baseAngle - waveOffset,
              speed: 280,
              damage: 8,
              type: 'legislation'
            })
          }
        }
      }
    },

    // Bipartisan Assault - Phase 3 (both senators converge and fire spread)
    {
      name: 'Bipartisan Assault',
      windUpTime: 0.8,
      duration: 2.5,
      cooldown: 2.5,
      minPhase: BossPhase.PHASE_3,
      visualTell: 'charge',
      execute: (boss: Boss, player: Player, _dt: number, attackTime: number) => {
        const senatorBoss = boss as SenatorPair

        // Both fire spread shots
        const fireRate = 0.4
        const shotNumber = Math.floor(attackTime / fireRate)
        const lastShotNumber = Math.floor((attackTime - 0.016) / fireRate)

        if (shotNumber > lastShotNumber) {
          const angle1 = angleBetween(boss.x, boss.y, player.x, player.y)
          const angle2 = angleBetween(
            senatorBoss.secondSenator.x,
            senatorBoss.secondSenator.y,
            player.x,
            player.y
          )

          // Spread from both senators
          const spreadCount = senatorBoss.getPhase() >= BossPhase.PHASE_4 ? 5 : 3
          const spreadAngle = 0.5

          for (let i = 0; i < spreadCount; i++) {
            const offset = (i - (spreadCount - 1) / 2) * (spreadAngle / (spreadCount - 1 || 1))

            boss.projectileRequests.push({
              x: boss.x,
              y: boss.y,
              angle: angle1 + offset,
              speed: 250,
              damage: 10,
              type: 'legislation'
            })

            boss.projectileRequests.push({
              x: senatorBoss.secondSenator.x,
              y: senatorBoss.secondSenator.y,
              angle: angle2 + offset,
              speed: 250,
              damage: 10,
              type: 'legislation'
            })
          }
        }
      }
    }
  ]
}

const SENATOR_PAIR_CONFIG: BossConfig = {
  type: 'senator_pair',
  name: 'Senators Thornwood & Caldwell',
  maxHealth: 600, // Shared health pool
  speed: 100,
  contactDamage: 15,
  scoreValue: 6000,
  width: 48,
  height: 48,
  attacks: createAttacks()
}

export class SenatorPair extends Boss {
  public attackState: SenatorPairState = {
    filibusterActive: false,
    filibusteringSenator: null,
    filibusterTimer: 0,
    barragePattern: 0,
    lastBarrageShot: -1,
    coordinatedFireCount: 0
  }

  public secondSenator: SecondarySenator

  constructor(x: number, y: number) {
    const texture = SpriteGenerator.generateBossSprite('senator_navy')
    super(SENATOR_PAIR_CONFIG, x, y, texture)

    // Create second senator
    const secondTexture = SpriteGenerator.generateBossSprite('senator_charcoal')
    this.secondSenator = {
      sprite: new PIXI.Sprite(secondTexture),
      x: GAME_WIDTH - x,
      y: y,
      isInvincible: false
    }

    this.secondSenator.sprite.anchor.set(0.5)
    this.secondSenator.sprite.scale.set(this.config.width / secondTexture.width)

    this.idleDuration = 1.2
  }

  /**
   * Get the second senator's sprite for adding to scene
   */
  getSecondSenatorSprite(): PIXI.Sprite {
    return this.secondSenator.sprite
  }

  /**
   * Override update to also update second senator
   */
  update(dt: number): void {
    super.update(dt)

    // Update second senator sprite position
    this.secondSenator.sprite.x = this.secondSenator.x
    this.secondSenator.sprite.y = this.secondSenator.y

    // Clear filibuster state when not attacking
    if (this.getState() !== BossState.ATTACKING) {
      this.attackState.filibusterActive = false
      this.secondSenator.isInvincible = false
      this.secondSenator.sprite.tint = 0xffffff
    }
  }

  /**
   * Override movement to keep senators on opposite sides
   */
  protected updateMovement(dt: number, player: Player): void {
    // Main senator (navy) moves on left side
    const time = Date.now() / 1000
    const leftTargetX = GAME_WIDTH * 0.25 + Math.sin(time * 0.8) * 80
    const leftTargetY = GAME_HEIGHT / 2 + Math.cos(time * 0.6) * 120

    this.moveToward(leftTargetX, leftTargetY, this.config.speed, dt)

    // Second senator (charcoal) moves on right side - mirror movement
    const rightTargetX = GAME_WIDTH * 0.75 + Math.sin(time * 0.8 + Math.PI) * 80
    const rightTargetY = GAME_HEIGHT / 2 + Math.cos(time * 0.6 + Math.PI) * 120

    // Move second senator
    const dist = distance(this.secondSenator.x, this.secondSenator.y, rightTargetX, rightTargetY)
    if (dist > 5) {
      const angle = angleBetween(this.secondSenator.x, this.secondSenator.y, rightTargetX, rightTargetY)
      this.secondSenator.x += Math.cos(angle) * this.config.speed * dt
      this.secondSenator.y += Math.sin(angle) * this.config.speed * dt

      // Clamp to arena
      const margin = this.config.width / 2
      this.secondSenator.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.secondSenator.x))
      this.secondSenator.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.secondSenator.y))
    }

    // Face each other toward center/player
    if (player.x > this.x) {
      this.sprite.scale.x = Math.abs(this.sprite.scale.x)
    } else {
      this.sprite.scale.x = -Math.abs(this.sprite.scale.x)
    }

    if (player.x < this.secondSenator.x) {
      this.secondSenator.sprite.scale.x = -Math.abs(this.secondSenator.sprite.scale.x)
    } else {
      this.secondSenator.sprite.scale.x = Math.abs(this.secondSenator.sprite.scale.x)
    }
  }

  /**
   * Override takeDamage to handle filibuster invincibility
   */
  takeDamage(amount: number): boolean {
    // If in filibuster and main senator is filibustering, reduced damage
    if (this.attackState.filibusterActive && this.attackState.filibusteringSenator === 'navy') {
      return false // Main senator is invincible
    }

    return super.takeDamage(amount)
  }

  /**
   * Check if second senator should take damage (for GameScene collision)
   */
  canSecondSenatorTakeDamage(): boolean {
    return !this.secondSenator.isInvincible
  }

  /**
   * Clean up second senator sprite
   */
  destroy(): void {
    if (this.secondSenator.sprite.parent) {
      this.secondSenator.sprite.parent.removeChild(this.secondSenator.sprite)
    }
    this.secondSenator.sprite.destroy()
    super.destroy()
  }
}
