import * as PIXI from 'pixi.js'
import { Game } from '../Game'

export abstract class Scene {
  protected game: Game
  public container: PIXI.Container

  constructor(game: Game) {
    this.game = game
    this.container = new PIXI.Container()
  }

  abstract init(data?: Record<string, unknown>): void
  abstract update(dt: number): void

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
