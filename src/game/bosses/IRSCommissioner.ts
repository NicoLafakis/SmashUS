import { Boss, BossConfig, BossAttack, BossPhase } from './Boss'
import { Player } from '../entities/Player'
import { SpriteGenerator } from '../utils/SpriteGenerator'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
// import { angleBetween } from '../utils/Collision'

/**
 * IRS Commissioner - "Harold Pemberton"
 * Level 1 Boss
 *
 * Attacks:
 * - Audit Beam Sweep: Fires a rotating beam across the arena
 * - Summon Agents: Spawns IRS agents at arena edges
 * - Paper Storm: Fires paperwork projectiles in all directions
 */

// Attack state tracking for complex attacks
interface IRSCommissionerState {
  beamAngle: number
  beamRotationSpeed: number
  beamCount: number
  paperWaveCount: number
  papersPerWave: number
}

function createAttacks(): BossAttack[] {
  return [
    // Audit Beam Sweep - Phase 1
    {
      name: 'Audit Beam Sweep',
      windUpTime: 0.8,
      duration: 3.0,
      cooldown: 1.5,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'raise_arm',
      onWindUp: (boss: Boss) => {
        const state = (boss as IRSCommissioner).attackState
        const commBoss = boss as IRSCommissioner
        // Initialize beam starting angle (toward player direction)
        state.beamAngle = -Math.PI / 2 // Start from top
        state.beamRotationSpeed = Math.PI / 3 // 60 degrees per second (180 over 3 seconds)
        state.beamCount = commBoss.getPhase() >= BossPhase.PHASE_3 ? 2 : 1
      },
      execute: (boss: Boss, _player: Player, dt: number, _attackTime: number) => {
        const commBoss = boss as IRSCommissioner
        const state = commBoss.attackState

        // Rotate beam
        state.beamAngle += state.beamRotationSpeed * dt

        // Fire beam projectiles along the beam line
        // Fire multiple projectiles to create beam effect
        const beamLength = 300
        const projectileCount = 15

        for (let b = 0; b < state.beamCount; b++) {
          const angleOffset = b * Math.PI // Second beam is opposite direction
          const angle = state.beamAngle + angleOffset

          for (let i = 0; i < projectileCount; i++) {
            const dist = (i / projectileCount) * beamLength
            const px = boss.x + Math.cos(angle) * dist
            const py = boss.y + Math.sin(angle) * dist

            // Only spawn if within arena bounds
            if (px > 0 && px < GAME_WIDTH && py > 0 && py < GAME_HEIGHT) {
              boss.projectileRequests.push({
                x: px,
                y: py,
                angle: angle,
                speed: 0, // Stationary beam segments
                damage: 15,
                type: 'audit_beam'
              })
            }
          }
        }

        // In later phases, beam moves faster
        if (commBoss.getPhase() >= BossPhase.PHASE_2) {
          state.beamRotationSpeed = Math.PI / 2.5 // Faster rotation
        }
        if (commBoss.getPhase() >= BossPhase.PHASE_4) {
          state.beamRotationSpeed = Math.PI / 2 // Even faster
        }
      }
    },

    // Summon Agents - Phase 1
    {
      name: 'Summon Agents',
      windUpTime: 1.0,
      duration: 0.5,
      cooldown: 3.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'raise_hand',
      execute: (boss: Boss, _player: Player, _dt: number, attackTime: number) => {
        const commBoss = boss as IRSCommissioner

        // Only spawn once at the start of the attack
        if (attackTime < 0.1) {
          let agentCount = 2
          if (commBoss.getPhase() >= BossPhase.PHASE_2) agentCount = 3
          if (commBoss.getPhase() >= BossPhase.PHASE_4) agentCount = 4

          // Also spawn bureaucrats in later phases
          const spawnBureaucrat = commBoss.getPhase() >= BossPhase.PHASE_3

          for (let i = 0; i < agentCount; i++) {
            // Spawn at random edges
            const edge = Math.floor(Math.random() * 4)
            let x: number, y: number

            switch (edge) {
              case 0: // Top
                x = 50 + Math.random() * (GAME_WIDTH - 100)
                y = 30
                break
              case 1: // Right
                x = GAME_WIDTH - 30
                y = 50 + Math.random() * (GAME_HEIGHT - 100)
                break
              case 2: // Bottom
                x = 50 + Math.random() * (GAME_WIDTH - 100)
                y = GAME_HEIGHT - 30
                break
              default: // Left
                x = 30
                y = 50 + Math.random() * (GAME_HEIGHT - 100)
                break
            }

            boss.minionRequests.push({
              type: 'irs_agent',
              x,
              y
            })
          }

          // Spawn bureaucrat in phase 3+
          if (spawnBureaucrat) {
            boss.minionRequests.push({
              type: 'bureaucrat',
              x: GAME_WIDTH / 2 + (Math.random() - 0.5) * 200,
              y: 30
            })
          }
        }
      }
    },

    // Paper Storm - Phase 1
    {
      name: 'Paper Storm',
      windUpTime: 1.2,
      duration: 2.0,
      cooldown: 2.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'charge_up',
      onWindUp: (boss: Boss) => {
        const commBoss = boss as IRSCommissioner
        const state = commBoss.attackState
        state.paperWaveCount = 0
        state.papersPerWave = commBoss.getPhase() >= BossPhase.PHASE_3 ? 16 : 12
      },
      execute: (boss: Boss, _player: Player, _dt: number, attackTime: number) => {
        const commBoss = boss as IRSCommissioner
        const state = commBoss.attackState

        // Fire waves of papers at intervals
        const waveInterval = commBoss.getPhase() >= BossPhase.PHASE_2 ? 0.4 : 0.5
        const expectedWaves = Math.floor(attackTime / waveInterval)

        if (expectedWaves > state.paperWaveCount) {
          state.paperWaveCount = expectedWaves

          // Alternate starting angle for variety
          const startAngle = (state.paperWaveCount % 2) * (Math.PI / state.papersPerWave)

          // Fire circular burst
          boss['fireCircularBurst'](
            state.papersPerWave,
            200 + commBoss.getPhase() * 20, // Faster in later phases
            10,
            'paper_storm',
            startAngle
          )
        }
      }
    },

    // Targeted Audit - Phase 2 (fires directly at player)
    {
      name: 'Targeted Audit',
      windUpTime: 0.5,
      duration: 1.5,
      cooldown: 1.0,
      minPhase: BossPhase.PHASE_2,
      visualTell: 'point',
      execute: (boss: Boss, player: Player, _dt: number, attackTime: number) => {
        // Fire rapid shots at player
        const fireRate = 0.2 // 5 shots per second
        const shotNumber = Math.floor(attackTime / fireRate)
        const lastShotNumber = Math.floor((attackTime - 0.016) / fireRate)

        if (shotNumber > lastShotNumber) {
          boss['fireAtPlayer'](player, 350, 12, 'audit_beam')
        }
      }
    }
  ]
}

const IRS_COMMISSIONER_CONFIG: BossConfig = {
  type: 'irs_commissioner',
  name: 'IRS Commissioner Pemberton',
  maxHealth: 500,
  speed: 80,
  contactDamage: 20,
  scoreValue: 5000,
  width: 48,
  height: 48,
  attacks: createAttacks()
}

export class IRSCommissioner extends Boss {
  public attackState: IRSCommissionerState = {
    beamAngle: 0,
    beamRotationSpeed: 0,
    beamCount: 1,
    paperWaveCount: 0,
    papersPerWave: 12
  }

  constructor(x: number, y: number) {
    const texture = SpriteGenerator.generateBossSprite('irs_commissioner')
    super(IRS_COMMISSIONER_CONFIG, x, y, texture)
    this.idleDuration = 1.5 // Time between attacks
  }

  /**
   * Override movement to prefer staying near center but moving around
   */
  protected updateMovement(dt: number, _player: Player): void {
    // Move toward a position offset from center
    const offsetX = Math.sin(Date.now() / 2000) * 150
    const offsetY = Math.cos(Date.now() / 2500) * 100

    const targetX = GAME_WIDTH / 2 + offsetX
    const targetY = GAME_HEIGHT / 3 + offsetY

    this.moveToward(targetX, targetY, this.config.speed, dt)
  }

  /**
   * Override phase change for special behavior
   */
  protected onPhaseChange(phase: BossPhase): void {
    super.onPhaseChange(phase)

    // Boss gets angrier (faster) in later phases
    if (phase >= BossPhase.PHASE_3) {
      this.idleDuration = 1.0
    }
    if (phase >= BossPhase.PHASE_4) {
      this.idleDuration = 0.8
    }
  }
}
