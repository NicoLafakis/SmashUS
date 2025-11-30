import { Boss, BossConfig, BossAttack, BossPhase, BossState } from './Boss'
import { Player } from '../entities/Player'
import { SpriteGenerator } from '../utils/SpriteGenerator'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { angleBetween } from '../utils/Collision'

/**
 * Speaker of the House - "Speaker Margaret Morrison"
 * Level 3 Boss
 *
 * Attacks:
 * - Gavel Slam: Shockwave expands outward from impact point
 * - Call Vote: Spawns enemy waves
 * - Podium Shield: Hides behind podium, fires over it while shielded
 */

interface SpeakerState {
  gavelSlamX: number
  gavelSlamY: number
  shockwaveRadius: number
  shockwaveExpanded: boolean
  podiumShieldActive: boolean
  podiumShotCount: number
  voteWaveSpawned: boolean
}

function createAttacks(): BossAttack[] {
  return [
    // Gavel Slam - Phase 1
    {
      name: 'Gavel Slam',
      windUpTime: 1.0,
      duration: 1.5,
      cooldown: 2.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'raise_gavel',
      onWindUp: (boss: Boss, player: Player) => {
        const state = (boss as Speaker).attackState

        // Target where player is during wind-up (gives them time to move)
        state.gavelSlamX = player.x
        state.gavelSlamY = player.y
        state.shockwaveRadius = 0
        state.shockwaveExpanded = false
      },
      execute: (boss: Boss, _player: Player, dt: number, attackTime: number) => {
        const speakerBoss = boss as Speaker
        const state = speakerBoss.attackState

        // First part: slam happens
        if (attackTime < 0.3 && !state.shockwaveExpanded) {
          // Slam animation - boss moves to slam position
          return
        }

        // Expand shockwave
        if (!state.shockwaveExpanded) {
          state.shockwaveExpanded = true
          state.shockwaveRadius = 20
        }

        // Expand shockwave radius
        const maxRadius = speakerBoss.getPhase() >= BossPhase.PHASE_3 ? 350 : 250
        const expansionSpeed = speakerBoss.getPhase() >= BossPhase.PHASE_2 ? 300 : 250

        state.shockwaveRadius += expansionSpeed * dt

        if (state.shockwaveRadius < maxRadius) {
          // Spawn projectiles in a ring at current radius
          const projectileCount = Math.floor(state.shockwaveRadius / 15)

          for (let i = 0; i < projectileCount; i++) {
            const angle = (i / projectileCount) * Math.PI * 2
            const px = state.gavelSlamX + Math.cos(angle) * state.shockwaveRadius
            const py = state.gavelSlamY + Math.sin(angle) * state.shockwaveRadius

            // Only spawn if in bounds
            if (px > 0 && px < GAME_WIDTH && py > 0 && py < GAME_HEIGHT) {
              boss.projectileRequests.push({
                x: px,
                y: py,
                angle: angle, // Moves outward
                speed: 100, // Slow moving to stay with wave
                damage: 15,
                type: 'gavel_shockwave'
              })
            }
          }
        }
      }
    },

    // Call Vote - Phase 1
    {
      name: 'Call Vote',
      windUpTime: 1.2,
      duration: 0.5,
      cooldown: 4.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'point',
      onWindUp: (boss: Boss) => {
        const state = (boss as Speaker).attackState
        state.voteWaveSpawned = false
      },
      execute: (boss: Boss, _player: Player, _dt: number, _attackTime: number) => {
        const speakerBoss = boss as Speaker
        const state = speakerBoss.attackState

        if (!state.voteWaveSpawned) {
          state.voteWaveSpawned = true

          // Determine spawn count based on phase
          let internCount = 3
          let bureaucratCount = 1

          if (speakerBoss.getPhase() >= BossPhase.PHASE_2) {
            internCount = 4
            bureaucratCount = 2
          }
          if (speakerBoss.getPhase() >= BossPhase.PHASE_3) {
            internCount = 5
            bureaucratCount = 2
          }
          if (speakerBoss.getPhase() >= BossPhase.PHASE_4) {
            internCount = 6
            bureaucratCount = 3
          }

          // Spawn at edges
          for (let i = 0; i < internCount; i++) {
            const edge = i % 4
            let x: number, y: number

            switch (edge) {
              case 0:
                x = 50 + Math.random() * (GAME_WIDTH - 100)
                y = 30
                break
              case 1:
                x = GAME_WIDTH - 30
                y = 50 + Math.random() * (GAME_HEIGHT - 100)
                break
              case 2:
                x = 50 + Math.random() * (GAME_WIDTH - 100)
                y = GAME_HEIGHT - 30
                break
              default:
                x = 30
                y = 50 + Math.random() * (GAME_HEIGHT - 100)
                break
            }

            boss.minionRequests.push({ type: 'intern', x, y })
          }

          for (let i = 0; i < bureaucratCount; i++) {
            const x = i % 2 === 0 ? 50 : GAME_WIDTH - 50
            const y = GAME_HEIGHT / 2 + (Math.random() - 0.5) * 200

            boss.minionRequests.push({ type: 'bureaucrat', x, y })
          }
        }
      }
    },

    // Podium Shield - Phase 1
    {
      name: 'Podium Shield',
      windUpTime: 0.5,
      duration: 3.0,
      cooldown: 2.5,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'hide',
      onWindUp: (boss: Boss) => {
        const state = (boss as Speaker).attackState
        state.podiumShieldActive = true
        state.podiumShotCount = 0
      },
      execute: (boss: Boss, player: Player, _dt: number, attackTime: number) => {
        const speakerBoss = boss as Speaker
        const state = speakerBoss.attackState

        // Boss is shielded (handled in takeDamage)
        state.podiumShieldActive = true

        // Fire projectiles over podium
        const fireRate = speakerBoss.getPhase() >= BossPhase.PHASE_3 ? 0.3 : 0.4
        const expectedShots = Math.floor(attackTime / fireRate)

        if (expectedShots > state.podiumShotCount) {
          state.podiumShotCount = expectedShots

          const angle = angleBetween(boss.x, boss.y, player.x, player.y)

          // Fire in a small arc (over the podium)
          const spreadCount = speakerBoss.getPhase() >= BossPhase.PHASE_2 ? 3 : 2
          const spreadAngle = 0.3

          for (let i = 0; i < spreadCount; i++) {
            const offset = (i - (spreadCount - 1) / 2) * (spreadAngle / (spreadCount - 1 || 1))

            boss.projectileRequests.push({
              x: boss.x,
              y: boss.y - 20, // Fire from above podium
              angle: angle + offset,
              speed: 280,
              damage: 10,
              type: 'legislation'
            })
          }
        }

        // Visual feedback - tint blue when shielded
        if (state.podiumShieldActive) {
          boss.sprite.tint = 0x8888ff
        }
      }
    },

    // Point of Order - Phase 2 (rapid single-target attack)
    {
      name: 'Point of Order',
      windUpTime: 0.4,
      duration: 2.0,
      cooldown: 1.5,
      minPhase: BossPhase.PHASE_2,
      visualTell: 'point',
      execute: (boss: Boss, player: Player, _dt: number, attackTime: number) => {
        // Rapid fire at player
        const fireRate = 0.15
        const shotNumber = Math.floor(attackTime / fireRate)
        const lastShotNumber = Math.floor((attackTime - 0.016) / fireRate)

        if (shotNumber > lastShotNumber) {
          const angle = angleBetween(boss.x, boss.y, player.x, player.y)

          // Add slight tracking
          boss.projectileRequests.push({
            x: boss.x,
            y: boss.y,
            angle: angle,
            speed: 380,
            damage: 12,
            type: 'legislation'
          })
        }
      }
    },

    // Ruling from the Chair - Phase 3 (large area denial)
    {
      name: 'Ruling from the Chair',
      windUpTime: 1.5,
      duration: 2.5,
      cooldown: 3.0,
      minPhase: BossPhase.PHASE_3,
      visualTell: 'ruling',
      execute: (boss: Boss, _player: Player, _dt: number, attackTime: number) => {
        const speakerBoss = boss as Speaker

        // Create multiple shockwaves from boss position
        const waveInterval = 0.5
        const waveNumber = Math.floor(attackTime / waveInterval)
        const lastWaveNumber = Math.floor((attackTime - 0.016) / waveInterval)

        if (waveNumber > lastWaveNumber && waveNumber <= 5) {
          // Fire circular burst
          const projectileCount = 16 + speakerBoss.getPhase() * 2
          const startAngle = waveNumber * 0.2 // Offset each wave slightly

          boss['fireCircularBurst'](
            projectileCount,
            200,
            12,
            'gavel_shockwave',
            startAngle
          )
        }
      }
    }
  ]
}

const SPEAKER_CONFIG: BossConfig = {
  type: 'speaker',
  name: 'Speaker Morrison',
  maxHealth: 700,
  speed: 60, // Slower, behind podium
  contactDamage: 20,
  scoreValue: 7000,
  width: 48,
  height: 48,
  attacks: createAttacks()
}

export class Speaker extends Boss {
  public attackState: SpeakerState = {
    gavelSlamX: 0,
    gavelSlamY: 0,
    shockwaveRadius: 0,
    shockwaveExpanded: false,
    podiumShieldActive: false,
    podiumShotCount: 0,
    voteWaveSpawned: false
  }

  constructor(x: number, y: number) {
    const texture = SpriteGenerator.generateBossSprite('speaker')
    super(SPEAKER_CONFIG, x, y, texture)
    this.idleDuration = 1.5
  }

  /**
   * Override update to clear podium shield when not attacking
   */
  update(dt: number): void {
    super.update(dt)

    if (this.getState() !== BossState.ATTACKING) {
      this.attackState.podiumShieldActive = false
      this.sprite.tint = 0xffffff
    }
  }

  /**
   * Override movement - Speaker stays near top center (behind podium)
   */
  protected updateMovement(dt: number, _player: Player): void {
    const time = Date.now() / 1000

    // Stay near top-center with slight movement
    const targetX = GAME_WIDTH / 2 + Math.sin(time * 0.5) * 100
    const targetY = GAME_HEIGHT * 0.25 + Math.cos(time * 0.4) * 50

    this.moveToward(targetX, targetY, this.config.speed, dt)
  }

  /**
   * Override takeDamage to handle podium shield
   */
  takeDamage(amount: number): boolean {
    if (this.attackState.podiumShieldActive) {
      // Reduced damage when shielded
      return super.takeDamage(Math.floor(amount * 0.25))
    }
    return super.takeDamage(amount)
  }

  /**
   * Check if currently shielded (for visual feedback)
   */
  isShielded(): boolean {
    return this.attackState.podiumShieldActive
  }
}
