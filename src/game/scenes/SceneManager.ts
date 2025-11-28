import { Game } from '../Game'
import { Scene } from './Scene'

export class SceneManager {
  private game: Game
  private scenes: Map<string, () => Scene> = new Map()
  private currentScene: Scene | null = null
  private currentSceneName: string = ''

  constructor(game: Game) {
    this.game = game
  }

  register(name: string, factory: () => Scene): void {
    this.scenes.set(name, factory)
  }

  switchTo(name: string, data?: Record<string, unknown>): void {
    const factory = this.scenes.get(name)
    if (!factory) {
      console.error(`Scene "${name}" not found`)
      return
    }

    if (this.currentScene) {
      this.game.app.stage.removeChild(this.currentScene.container)
      this.currentScene.destroy()
    }

    this.currentScene = factory()
    this.currentSceneName = name
    this.game.app.stage.addChild(this.currentScene.container)
    this.currentScene.init(data)
  }

  update(dt: number): void {
    if (this.currentScene) {
      this.currentScene.update(dt)
    }
  }

  get current(): Scene | null {
    return this.currentScene
  }

  get currentName(): string {
    return this.currentSceneName
  }
}
