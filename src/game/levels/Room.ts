import { Enemy, ENEMY_CONFIGS, EnemyConfig } from '../entities/Enemy'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'

export interface WaveConfig {
  enemies: { type: string; count: number }[]
  delay: number // Delay before this wave spawns
}

export interface RoomConfig {
  waves: WaveConfig[]
  isBoss?: boolean
  bossType?: string
}

export class Room {
  public config: RoomConfig
  public enemies: Enemy[] = []
  public currentWave: number = 0
  public waveTimer: number = 0
  public cleared: boolean = false
  public started: boolean = false

  constructor(config: RoomConfig) {
    this.config = config
  }

  start(): void {
    this.started = true
    this.waveTimer = this.config.waves[0]?.delay || 0
  }

  update(dt: number): boolean {
    if (this.cleared) return true
    if (!this.started) return false

    const aliveEnemies = this.enemies.filter((e) => e.active)

    // Timer-based wave spawning - waves overlap, don't wait for kills
    if (this.currentWave < this.config.waves.length) {
      this.waveTimer -= dt
      if (this.waveTimer <= 0) {
        this.spawnWave(this.config.waves[this.currentWave])
        this.currentWave++
        if (this.currentWave < this.config.waves.length) {
          this.waveTimer = this.config.waves[this.currentWave].delay
        }
      }
    }

    // Room is cleared when all waves spawned and no enemies remain
    if (
      this.currentWave >= this.config.waves.length &&
      aliveEnemies.length === 0
    ) {
      this.cleared = true
      return true
    }

    return false
  }

  private spawnWave(wave: WaveConfig): void {
    for (const spawn of wave.enemies) {
      const config = ENEMY_CONFIGS[spawn.type]
      if (!config) continue

      for (let i = 0; i < spawn.count; i++) {
        const enemy = this.spawnEnemy(config)
        this.enemies.push(enemy)
      }
    }
  }

  private spawnEnemy(config: EnemyConfig): Enemy {
    // Spawn at random edge of screen
    let x: number, y: number
    const edge = Math.floor(Math.random() * 4)

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

    return new Enemy(config, x, y)
  }

  getAliveEnemies(): Enemy[] {
    return this.enemies.filter((e) => e.active)
  }

  destroy(): void {
    for (const enemy of this.enemies) {
      enemy.destroy()
    }
    this.enemies = []
  }
}

// Generate room configs for each level
export function generateRoomConfig(level: number, roomNumber: number): RoomConfig {
  const waves: WaveConfig[] = []

  switch (level) {
    case 1: // IRS Building
      if (roomNumber <= 3) {
        waves.push({
          enemies: [
            { type: 'intern', count: 4 + roomNumber * 2 }
          ],
          delay: 0.5
        })
        waves.push({
          enemies: [
            { type: 'bureaucrat', count: 1 + roomNumber },
            { type: 'intern', count: 3 + roomNumber }
          ],
          delay: 3
        })
        if (roomNumber >= 2) {
          waves.push({
            enemies: [
              { type: 'irs_agent', count: 2 },
              { type: 'intern', count: 3 }
            ],
            delay: 3
          })
        }
        if (roomNumber >= 3) {
          waves.push({
            enemies: [
              { type: 'irs_agent', count: 3 },
              { type: 'bureaucrat', count: 2 }
            ],
            delay: 3
          })
        }
      } else {
        // Boss room
        return { waves: [], isBoss: true, bossType: 'irs_commissioner' }
      }
      break

    case 2: // Capitol Hallways
      waves.push({
        enemies: [
          { type: 'intern', count: 5 },
          { type: 'bureaucrat', count: 2 }
        ],
        delay: 0.5
      })
      waves.push({
        enemies: [
          { type: 'irs_agent', count: 3 },
          { type: 'secret_service', count: 1 + roomNumber }
        ],
        delay: 3
      })
      waves.push({
        enemies: [
          { type: 'secret_service', count: 2 + roomNumber },
          { type: 'intern', count: 4 }
        ],
        delay: 3
      })
      if (roomNumber >= 5) {
        return { waves: [], isBoss: true, bossType: 'senator_pair' }
      }
      break

    case 3: // House Chamber
      waves.push({
        enemies: [
          { type: 'bureaucrat', count: 3 },
          { type: 'secret_service', count: 3 }
        ],
        delay: 0.5
      })
      waves.push({
        enemies: [
          { type: 'irs_agent', count: 3 },
          { type: 'secret_service', count: 3 },
          { type: 'intern', count: 5 }
        ],
        delay: 3
      })
      waves.push({
        enemies: [
          { type: 'lobbyist', count: 2 },
          { type: 'intern', count: 6 }
        ],
        delay: 3
      })
      if (roomNumber >= 5) {
        return { waves: [], isBoss: true, bossType: 'speaker' }
      }
      break

    case 4: // Senate Chamber
      waves.push({
        enemies: [
          { type: 'lobbyist', count: 3 },
          { type: 'bureaucrat', count: 3 }
        ],
        delay: 0.5
      })
      waves.push({
        enemies: [
          { type: 'secret_service', count: 4 },
          { type: 'lobbyist', count: 2 }
        ],
        delay: 3
      })
      waves.push({
        enemies: [
          { type: 'irs_agent', count: 3 },
          { type: 'intern', count: 6 }
        ],
        delay: 3
      })
      waves.push({
        enemies: [
          { type: 'secret_service', count: 3 },
          { type: 'bureaucrat', count: 2 }
        ],
        delay: 3
      })
      if (roomNumber >= 6) {
        return { waves: [], isBoss: true, bossType: 'senator_pair_2' }
      }
      break

    case 5: // White House
    default:
      waves.push({
        enemies: [
          { type: 'secret_service', count: 6 }
        ],
        delay: 0.5
      })
      waves.push({
        enemies: [
          { type: 'lobbyist', count: 3 },
          { type: 'bureaucrat', count: 3 },
          { type: 'irs_agent', count: 3 }
        ],
        delay: 3
      })
      waves.push({
        enemies: [
          { type: 'secret_service', count: 5 },
          { type: 'intern', count: 8 }
        ],
        delay: 3
      })
      waves.push({
        enemies: [
          { type: 'lobbyist', count: 2 },
          { type: 'irs_agent', count: 3 },
          { type: 'secret_service', count: 3 }
        ],
        delay: 3
      })
      if (roomNumber >= 6) {
        return { waves: [], isBoss: true, bossType: 'president' }
      }
      break
  }

  return { waves }
}
