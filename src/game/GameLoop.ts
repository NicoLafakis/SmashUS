import { Game } from './Game'

const FIXED_TIMESTEP = 1000 / 60 // 60 FPS

export class GameLoop {
  private game: Game
  private running: boolean = false
  private lastTime: number = 0
  private accumulator: number = 0

  constructor(game: Game) {
    this.game = game
  }

  start(): void {
    this.running = true
    this.lastTime = performance.now()
    this.accumulator = 0
    requestAnimationFrame((time) => this.loop(time))
  }

  stop(): void {
    this.running = false
  }

  private loop(currentTime: number): void {
    if (!this.running) return

    const frameTime = Math.min(currentTime - this.lastTime, 250) // Cap frame time to prevent spiral of death
    this.lastTime = currentTime
    this.accumulator += frameTime

    // Fixed timestep updates
    while (this.accumulator >= FIXED_TIMESTEP) {
      this.game.update(FIXED_TIMESTEP / 1000) // Convert to seconds
      this.accumulator -= FIXED_TIMESTEP
    }

    requestAnimationFrame((time) => this.loop(time))
  }
}
