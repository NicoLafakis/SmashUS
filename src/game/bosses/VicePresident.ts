import { Boss, BossConfig, BossAttack, BossPhase } from './Boss'
import { Player } from '../entities/Player'
import { SpriteGenerator } from '../utils/SpriteGenerator'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { angleBetween } from '../utils/Collision'

/**
 * Vice President - "Vice President Thomas Hartley"
 * Optional mid-game boss (can be added between levels)
 *
 * Attacks:
 * - Tie-Breaker Beam: Fires beam at player's position, sweeps in later phases
 * - Secret Service Summon: Spawns Secret Service agents flanking player
 * - Debate: Pulse that reverses controls if hit
 */

interface VicePresidentState {
  beamTargetAngle: number
  beamCurrentAngle: number
  beamLocked: boolean
  debatePulseRadius: number
  debatePulseActive: boolean
  summonCount: number
  summonedThisAttack: boolean
}

function createAttacks(): BossAttack[] {
  return [
    // Tie-Breaker Beam - Phase 1
    {
      name: 'Tie-Breaker Beam',
      windUpTime: 1.0,
      duration: 2.0,
      cooldown: 2.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'charge',
      onWindUp: (boss: Boss, player: Player) => {
        const state = (boss as VicePresident).attackState
        // Lock onto player's current position
        state.beamTargetAngle = angleBetween(boss.x, boss.y, player.x, player.y)
        state.beamCurrentAngle = state.beamTargetAngle
        state.beamLocked = true
      },
      execute: (boss: Boss, player: Player, dt: number, attackTime: number) => {
        const vpBoss = boss as VicePresident
        const state = vpBoss.attackState

        // In later phases, beam sweeps toward player
        if (vpBoss.getPhase() >= BossPhase.PHASE_2 && attackTime > 0.5) {
          const targetAngle = angleBetween(boss.x, boss.y, player.x, player.y)
          const sweepSpeed = vpBoss.getPhase() >= BossPhase.PHASE_4 ? 1.5 : 1.0

          // Gradually move beam toward player
          const angleDiff = targetAngle - state.beamCurrentAngle

          // Normalize angle difference
          let normalizedDiff = angleDiff
          while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2
          while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2

          state.beamCurrentAngle += normalizedDiff * sweepSpeed * dt
        }

        // Fire beam projectiles
        const beamLength = 400
        const projectileCount = 20

        for (let i = 0; i < projectileCount; i++) {
          const dist = (i / projectileCount) * beamLength
          const px = boss.x + Math.cos(state.beamCurrentAngle) * dist
          const py = boss.y + Math.sin(state.beamCurrentAngle) * dist

          if (px > 0 && px < GAME_WIDTH && py > 0 && py < GAME_HEIGHT) {
            boss.projectileRequests.push({
              x: px,
              y: py,
              angle: state.beamCurrentAngle,
              speed: 0, // Stationary beam
              damage: 18,
              type: 'tie_breaker_beam'
            })
          }
        }
      }
    },

    // Secret Service Summon - Phase 1
    {
      name: 'Secret Service Summon',
      windUpTime: 0.8,
      duration: 0.5,
      cooldown: 4.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'signal',
      onWindUp: (boss: Boss) => {
        const state = (boss as VicePresident).attackState
        state.summonedThisAttack = false
      },
      execute: (boss: Boss, player: Player, _dt: number, _attackTime: number) => {
        const vpBoss = boss as VicePresident
        const state = vpBoss.attackState

        if (!state.summonedThisAttack) {
          state.summonedThisAttack = true

          // Determine spawn count based on phase
          let agentCount = 2
          if (vpBoss.getPhase() >= BossPhase.PHASE_2) agentCount = 3
          if (vpBoss.getPhase() >= BossPhase.PHASE_4) agentCount = 4

          // Spawn flanking the player
          for (let i = 0; i < agentCount; i++) {
            const angle = (i / agentCount) * Math.PI * 2
            const spawnDist = 200

            let x = player.x + Math.cos(angle) * spawnDist
            let y = player.y + Math.sin(angle) * spawnDist

            // Clamp to arena
            x = Math.max(50, Math.min(GAME_WIDTH - 50, x))
            y = Math.max(50, Math.min(GAME_HEIGHT - 50, y))

            boss.minionRequests.push({
              type: 'secret_service',
              x,
              y
            })
          }
        }
      }
    },

    // Debate - Phase 1 (control reversal attack)
    {
      name: 'Debate',
      windUpTime: 1.2,
      duration: 1.5,
      cooldown: 3.5,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'speech',
      onWindUp: (boss: Boss) => {
        const state = (boss as VicePresident).attackState
        state.debatePulseRadius = 0
        state.debatePulseActive = true
      },
      execute: (boss: Boss, _player: Player, dt: number, _attackTime: number) => {
        const vpBoss = boss as VicePresident
        const state = vpBoss.attackState

        // Expand pulse radius
        const maxRadius = vpBoss.getPhase() >= BossPhase.PHASE_3 ? 400 : 300
        const expansionSpeed = vpBoss.getPhase() >= BossPhase.PHASE_4 ? 300 : 250

        state.debatePulseRadius += expansionSpeed * dt

        if (state.debatePulseRadius < maxRadius) {
          // Create visual pulse ring
          const pulseProjectiles = 24

          for (let i = 0; i < pulseProjectiles; i++) {
            const angle = (i / pulseProjectiles) * Math.PI * 2
            const px = boss.x + Math.cos(angle) * state.debatePulseRadius
            const py = boss.y + Math.sin(angle) * state.debatePulseRadius

            if (px > 0 && px < GAME_WIDTH && py > 0 && py < GAME_HEIGHT) {
              boss.projectileRequests.push({
                x: px,
                y: py,
                angle: angle,
                speed: expansionSpeed, // Move with pulse
                damage: 5, // Low damage but applies confusion effect
                type: 'debate_pulse'
              })
            }
          }
        }
      }
    },

    // Executive Influence - Phase 2 (spread attack)
    {
      name: 'Executive Influence',
      windUpTime: 0.6,
      duration: 2.0,
      cooldown: 1.5,
      minPhase: BossPhase.PHASE_2,
      visualTell: 'gesture',
      execute: (boss: Boss, player: Player, _dt: number, attackTime: number) => {
        const vpBoss = boss as VicePresident

        // Fire spread shots
        const fireRate = 0.3
        const shotNumber = Math.floor(attackTime / fireRate)
        const lastShotNumber = Math.floor((attackTime - 0.016) / fireRate)

        if (shotNumber > lastShotNumber) {
          const angle = angleBetween(boss.x, boss.y, player.x, player.y)
          const spreadCount = vpBoss.getPhase() >= BossPhase.PHASE_3 ? 5 : 3
          const spreadAngle = vpBoss.getPhase() >= BossPhase.PHASE_4 ? 0.8 : 0.6

          for (let i = 0; i < spreadCount; i++) {
            const offset = (i - (spreadCount - 1) / 2) * (spreadAngle / (spreadCount - 1 || 1))

            boss.projectileRequests.push({
              x: boss.x,
              y: boss.y,
              angle: angle + offset,
              speed: 300,
              damage: 12,
              type: 'legislation'
            })
          }
        }
      }
    },

    // Casting Vote - Phase 3 (powerful single beam)
    {
      name: 'Casting Vote',
      windUpTime: 1.5,
      duration: 0.3,
      cooldown: 2.5,
      minPhase: BossPhase.PHASE_3,
      visualTell: 'decisive',
      onWindUp: (boss: Boss, player: Player) => {
        const state = (boss as VicePresident).attackState
        state.beamTargetAngle = angleBetween(boss.x, boss.y, player.x, player.y)
      },
      execute: (boss: Boss, _player: Player, _dt: number, _attackTime: number) => {
        const vpBoss = boss as VicePresident
        const state = vpBoss.attackState

        // Fire a massive beam
        const beamLength = 500
        const projectileCount = 30

        for (let i = 0; i < projectileCount; i++) {
          const dist = (i / projectileCount) * beamLength
          const px = boss.x + Math.cos(state.beamTargetAngle) * dist
          const py = boss.y + Math.sin(state.beamTargetAngle) * dist

          if (px > 0 && px < GAME_WIDTH && py > 0 && py < GAME_HEIGHT) {
            boss.projectileRequests.push({
              x: px,
              y: py,
              angle: state.beamTargetAngle,
              speed: 0,
              damage: 25, // High damage
              type: 'tie_breaker_beam'
            })
          }
        }
      }
    }
  ]
}

const VICE_PRESIDENT_CONFIG: BossConfig = {
  type: 'vice_president',
  name: 'Vice President Hartley',
  maxHealth: 650,
  speed: 90,
  contactDamage: 18,
  scoreValue: 6500,
  width: 48,
  height: 48,
  attacks: createAttacks()
}

export class VicePresident extends Boss {
  public attackState: VicePresidentState = {
    beamTargetAngle: 0,
    beamCurrentAngle: 0,
    beamLocked: false,
    debatePulseRadius: 0,
    debatePulseActive: false,
    summonCount: 0,
    summonedThisAttack: false
  }

  constructor(x: number, y: number) {
    const texture = SpriteGenerator.generateBossSprite('vice_president')
    super(VICE_PRESIDENT_CONFIG, x, y, texture)
    this.idleDuration = 1.3
  }

  /**
   * Override movement - VP moves strategically around arena
   */
  protected updateMovement(dt: number, _player: Player): void {
    const time = Date.now() / 1000

    // Move in a figure-8 pattern around center
    const targetX = GAME_WIDTH / 2 + Math.sin(time * 0.7) * 200
    const targetY = GAME_HEIGHT / 2 + Math.sin(time * 1.4) * 150

    this.moveToward(targetX, targetY, this.config.speed, dt)
  }

  /**
   * Check if debate pulse is active (for control reversal effect)
   */
  isDebatePulseActive(): boolean {
    return this.attackState.debatePulseActive
  }

  /**
   * Get debate pulse radius for collision detection
   */
  getDebatePulseRadius(): number {
    return this.attackState.debatePulseRadius
  }
}
