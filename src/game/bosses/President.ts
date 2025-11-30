import { Boss, BossConfig, BossAttack, BossPhase, BossState } from './Boss'
import { Player } from '../entities/Player'
import { SpriteGenerator } from '../utils/SpriteGenerator'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { angleBetween } from '../utils/Collision'

/**
 * President - "President William J. Maxwell"
 * Level 5 Final Boss
 *
 * Attacks:
 * - Executive Order: Large danger zones on arena
 * - Veto: Reflective barrier (not fully implemented - damages on contact instead)
 * - Press Conference: Camera drones spawn and shoot
 * - Air Strike: Target reticles appear, explosions follow
 */

interface PresidentState {
  // Executive Order
  dangerZones: { x: number; y: number; size: number }[]
  dangerZoneTimer: number

  // Veto
  vetoActive: boolean
  vetoAngle: number

  // Press Conference
  droneSpawnCount: number
  dronesSpawned: boolean

  // Air Strike
  airstrikeReticles: { x: number; y: number; delay: number }[]
  airstrikePhase: 'targeting' | 'exploding' | 'done'
  airstrikeTimer: number
}

function createAttacks(): BossAttack[] {
  return [
    // Executive Order - Phase 1
    {
      name: 'Executive Order',
      windUpTime: 1.5,
      duration: 3.0,
      cooldown: 3.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'sign',
      onWindUp: (boss: Boss, _player: Player) => {
        const state = (boss as President).attackState
        const presBoss = boss as President

        // Create danger zones
        state.dangerZones = []
        const zoneCount = presBoss.getPhase() >= BossPhase.PHASE_3 ? 4 : 3
        const zoneSize = presBoss.getPhase() >= BossPhase.PHASE_4 ? 200 : 150

        // Create zones that leave some safe spots
        for (let i = 0; i < zoneCount; i++) {
          // Spread zones across arena
          const x = (GAME_WIDTH / (zoneCount + 1)) * (i + 1) + (Math.random() - 0.5) * 100
          const y = GAME_HEIGHT / 2 + (Math.random() - 0.5) * 200

          state.dangerZones.push({ x, y, size: zoneSize })
        }

        state.dangerZoneTimer = 0
      },
      execute: (boss: Boss, _player: Player, dt: number, attackTime: number) => {
        const presBoss = boss as President
        const state = presBoss.attackState

        state.dangerZoneTimer += dt

        // After brief warning period, zones become active
        const warningTime = 0.8
        const isActive = attackTime > warningTime

        for (const zone of state.dangerZones) {
          // Spawn projectiles to visualize danger zone
          if (isActive) {
            // Create damaging projectiles in the zone
            const projectileCount = 8

            for (let i = 0; i < projectileCount; i++) {
              const angle = (i / projectileCount) * Math.PI * 2
              const dist = zone.size / 2 * Math.random()
              const px = zone.x + Math.cos(angle) * dist
              const py = zone.y + Math.sin(angle) * dist

              if (px > 0 && px < GAME_WIDTH && py > 0 && py < GAME_HEIGHT) {
                boss.projectileRequests.push({
                  x: px,
                  y: py,
                  angle: Math.random() * Math.PI * 2,
                  speed: 50,
                  damage: 20,
                  type: 'executive_order'
                })
              }
            }
          } else {
            // Warning phase - just visual indicator
            boss.projectileRequests.push({
              x: zone.x,
              y: zone.y,
              angle: 0,
              speed: 0,
              damage: 0, // No damage during warning
              type: 'executive_order'
            })
          }
        }
      }
    },

    // Veto - Phase 1 (creates protective barrier that damages on contact)
    {
      name: 'Veto',
      windUpTime: 0.8,
      duration: 3.0,
      cooldown: 2.5,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'raise_hand',
      onWindUp: (boss: Boss, player: Player) => {
        const state = (boss as President).attackState
        state.vetoActive = true
        state.vetoAngle = angleBetween(boss.x, boss.y, player.x, player.y)
      },
      execute: (boss: Boss, player: Player, dt: number, attackTime: number) => {
        const presBoss = boss as President
        const state = presBoss.attackState

        state.vetoActive = true

        // Slowly track player
        const targetAngle = angleBetween(boss.x, boss.y, player.x, player.y)
        const trackSpeed = 0.5
        let angleDiff = targetAngle - state.vetoAngle

        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

        state.vetoAngle += angleDiff * trackSpeed * dt

        // Create barrier projectiles in front of boss
        const barrierDist = 50

        for (let i = -2; i <= 2; i++) {
          const offsetAngle = state.vetoAngle + (i * 0.3)
          const px = boss.x + Math.cos(offsetAngle) * barrierDist
          const py = boss.y + Math.sin(offsetAngle) * barrierDist

          boss.projectileRequests.push({
            x: px,
            y: py,
            angle: offsetAngle,
            speed: 0,
            damage: 15,
            type: 'veto_barrier'
          })
        }

        // Also fire occasional shots
        if (Math.floor(attackTime * 3) !== Math.floor((attackTime - dt) * 3)) {
          boss.projectileRequests.push({
            x: boss.x,
            y: boss.y,
            angle: state.vetoAngle,
            speed: 280,
            damage: 12,
            type: 'legislation'
          })
        }
      }
    },

    // Press Conference - Phase 1 (spawns drones)
    {
      name: 'Press Conference',
      windUpTime: 1.0,
      duration: 0.5,
      cooldown: 5.0,
      minPhase: BossPhase.PHASE_1,
      visualTell: 'announce',
      onWindUp: (boss: Boss) => {
        const state = (boss as President).attackState
        state.droneSpawnCount = 0
        state.dronesSpawned = false
      },
      execute: (boss: Boss, _player: Player, _dt: number, _attackTime: number) => {
        const presBoss = boss as President
        const state = presBoss.attackState

        if (!state.dronesSpawned) {
          state.dronesSpawned = true

          // Spawn camera drones (using lobbyist type as stand-in for drones)
          let droneCount = 2
          if (presBoss.getPhase() >= BossPhase.PHASE_2) droneCount = 3
          if (presBoss.getPhase() >= BossPhase.PHASE_4) droneCount = 4

          for (let i = 0; i < droneCount; i++) {
            const angle = (i / droneCount) * Math.PI * 2
            const spawnDist = 150

            const x = boss.x + Math.cos(angle) * spawnDist
            const y = boss.y + Math.sin(angle) * spawnDist

            // Use secret_service as drone stand-in (ranged, mobile)
            boss.minionRequests.push({
              type: 'secret_service',
              x: Math.max(50, Math.min(GAME_WIDTH - 50, x)),
              y: Math.max(50, Math.min(GAME_HEIGHT - 50, y))
            })
          }
        }
      }
    },

    // Air Strike - Phase 2
    {
      name: 'Air Strike',
      windUpTime: 1.5,
      duration: 3.0,
      cooldown: 3.5,
      minPhase: BossPhase.PHASE_2,
      visualTell: 'command',
      onWindUp: (boss: Boss, player: Player) => {
        const state = (boss as President).attackState
        const presBoss = boss as President

        // Create reticles
        state.airstrikeReticles = []
        let reticleCount = 4
        if (presBoss.getPhase() >= BossPhase.PHASE_3) reticleCount = 6
        if (presBoss.getPhase() >= BossPhase.PHASE_4) reticleCount = 8

        // Some reticles target player, others are random
        for (let i = 0; i < reticleCount; i++) {
          let x: number, y: number

          if (i < 2) {
            // First two target near player
            x = player.x + (Math.random() - 0.5) * 100
            y = player.y + (Math.random() - 0.5) * 100
          } else {
            // Others are random
            x = 100 + Math.random() * (GAME_WIDTH - 200)
            y = 100 + Math.random() * (GAME_HEIGHT - 200)
          }

          const delay = presBoss.getPhase() >= BossPhase.PHASE_4 ? 0.8 : 1.2

          state.airstrikeReticles.push({ x, y, delay: delay + i * 0.2 })
        }

        state.airstrikePhase = 'targeting'
        state.airstrikeTimer = 0
      },
      execute: (boss: Boss, _player: Player, dt: number, attackTime: number) => {
        const presBoss = boss as President
        const state = presBoss.attackState

        state.airstrikeTimer += dt

        for (const reticle of state.airstrikeReticles) {
          if (attackTime < reticle.delay) {
            // Show targeting reticle
            boss.projectileRequests.push({
              x: reticle.x,
              y: reticle.y,
              angle: 0,
              speed: 0,
              damage: 0,
              type: 'airstrike_reticle'
            })
          } else if (attackTime < reticle.delay + 0.3) {
            // Explosion phase - spawn damaging projectiles
            const explosionCount = 8

            for (let i = 0; i < explosionCount; i++) {
              const angle = (i / explosionCount) * Math.PI * 2
              const dist = Math.random() * 40

              boss.projectileRequests.push({
                x: reticle.x + Math.cos(angle) * dist,
                y: reticle.y + Math.sin(angle) * dist,
                angle: angle,
                speed: 100,
                damage: 25,
                type: 'executive_order'
              })
            }
          }
        }
      }
    },

    // State of Emergency - Phase 3 (combination attack)
    {
      name: 'State of Emergency',
      windUpTime: 2.0,
      duration: 4.0,
      cooldown: 4.0,
      minPhase: BossPhase.PHASE_3,
      visualTell: 'emergency',
      execute: (boss: Boss, player: Player, dt: number, attackTime: number) => {
        // Multi-phase attack

        // Phase 1 (0-1.5s): Circular bursts
        if (attackTime < 1.5) {
          if (Math.floor(attackTime * 2) !== Math.floor((attackTime - dt) * 2)) {
            boss['fireCircularBurst'](16, 200, 12, 'legislation', attackTime)
          }
        }

        // Phase 2 (1.5-3s): Targeted fire
        if (attackTime >= 1.5 && attackTime < 3.0) {
          if (Math.floor(attackTime * 5) !== Math.floor((attackTime - dt) * 5)) {
            const angle = angleBetween(boss.x, boss.y, player.x, player.y)

            for (let i = -1; i <= 1; i++) {
              boss.projectileRequests.push({
                x: boss.x,
                y: boss.y,
                angle: angle + i * 0.2,
                speed: 350,
                damage: 15,
                type: 'legislation'
              })
            }
          }
        }

        // Phase 3 (3-4s): Final burst
        if (attackTime >= 3.0) {
          if (Math.floor(attackTime * 3) !== Math.floor((attackTime - dt) * 3)) {
            boss['fireCircularBurst'](24, 250, 15, 'executive_order', attackTime * 2)
          }
        }
      }
    },

    // Final Authority - Phase 4 (ultimate attack)
    {
      name: 'Final Authority',
      windUpTime: 2.5,
      duration: 5.0,
      cooldown: 5.0,
      minPhase: BossPhase.PHASE_4,
      visualTell: 'ultimate',
      execute: (boss: Boss, player: Player, dt: number, attackTime: number) => {
        // Constant pressure from all directions

        // Rotating beam
        const beamAngle = attackTime * 1.5
        const beamLength = 350

        for (let i = 0; i < 2; i++) {
          const angle = beamAngle + i * Math.PI

          for (let j = 0; j < 15; j++) {
            const dist = (j / 15) * beamLength
            const px = boss.x + Math.cos(angle) * dist
            const py = boss.y + Math.sin(angle) * dist

            if (px > 0 && px < GAME_WIDTH && py > 0 && py < GAME_HEIGHT) {
              boss.projectileRequests.push({
                x: px,
                y: py,
                angle: angle,
                speed: 0,
                damage: 12,
                type: 'tie_breaker_beam'
              })
            }
          }
        }

        // Periodic targeted shots
        if (Math.floor(attackTime * 4) !== Math.floor((attackTime - dt) * 4)) {
          const angle = angleBetween(boss.x, boss.y, player.x, player.y)

          boss.projectileRequests.push({
            x: boss.x,
            y: boss.y,
            angle: angle,
            speed: 400,
            damage: 18,
            type: 'legislation'
          })
        }

        // Spawn minions periodically
        if (Math.floor(attackTime / 2) !== Math.floor((attackTime - dt) / 2)) {
          const edge = Math.floor(Math.random() * 4)
          let x: number, y: number

          switch (edge) {
            case 0:
              x = Math.random() * GAME_WIDTH
              y = 30
              break
            case 1:
              x = GAME_WIDTH - 30
              y = Math.random() * GAME_HEIGHT
              break
            case 2:
              x = Math.random() * GAME_WIDTH
              y = GAME_HEIGHT - 30
              break
            default:
              x = 30
              y = Math.random() * GAME_HEIGHT
              break
          }

          boss.minionRequests.push({ type: 'secret_service', x, y })
        }
      }
    }
  ]
}

const PRESIDENT_CONFIG: BossConfig = {
  type: 'president',
  name: 'President Maxwell',
  maxHealth: 1000, // Final boss has most health
  speed: 70,
  contactDamage: 25,
  scoreValue: 10000,
  width: 48,
  height: 48,
  attacks: createAttacks()
}

export class President extends Boss {
  public attackState: PresidentState = {
    dangerZones: [],
    dangerZoneTimer: 0,
    vetoActive: false,
    vetoAngle: 0,
    droneSpawnCount: 0,
    dronesSpawned: false,
    airstrikeReticles: [],
    airstrikePhase: 'done',
    airstrikeTimer: 0
  }

  constructor(x: number, y: number) {
    const texture = SpriteGenerator.generateBossSprite('president')
    super(PRESIDENT_CONFIG, x, y, texture)
    this.idleDuration = 1.0 // Fast paced final boss
  }

  /**
   * Override update to clear attack states
   */
  update(dt: number): void {
    super.update(dt)

    if (this.getState() !== BossState.ATTACKING) {
      this.attackState.vetoActive = false
    }
  }

  /**
   * Override movement - President moves deliberately around center
   */
  protected updateMovement(dt: number, _player: Player): void {
    const time = Date.now() / 1000

    // Move in slow circle around center
    const radius = 150
    const targetX = GAME_WIDTH / 2 + Math.cos(time * 0.3) * radius
    const targetY = GAME_HEIGHT / 2 + Math.sin(time * 0.3) * radius * 0.6

    this.moveToward(targetX, targetY, this.config.speed, dt)
  }

  /**
   * Override phase change for dramatic effect
   */
  protected onPhaseChange(phase: BossPhase): void {
    super.onPhaseChange(phase)

    // Get more aggressive in later phases
    if (phase >= BossPhase.PHASE_3) {
      this.idleDuration = 0.8
    }
    if (phase >= BossPhase.PHASE_4) {
      this.idleDuration = 0.5
    }
  }

  /**
   * Check if veto barrier is active
   */
  isVetoActive(): boolean {
    return this.attackState.vetoActive
  }
}
