import * as PIXI from 'pixi.js'
import { GameLoop } from './GameLoop'
import { InputManager } from './InputManager'
import { SceneManager } from './scenes/SceneManager'
import { TitleScene } from './scenes/TitleScene'
import { GameScene } from './scenes/GameScene'
import { GameOverScene } from './scenes/GameOverScene'
import { ShopScene } from './scenes/ShopScene'
import { AssetLoader } from './utils/AssetLoader'

export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 720

export class Game {
  public app: PIXI.Application
  public input: InputManager
  public sceneManager: SceneManager
  public assetLoader: AssetLoader
  private gameLoop: GameLoop
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container

    this.app = new PIXI.Application({
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: 0x1a1a2e,
      resolution: 1,
      antialias: false,
    })

    // Pixel-perfect rendering
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST

    container.appendChild(this.app.view as HTMLCanvasElement)

    // Scale canvas to fit viewport while maintaining aspect ratio
    this.resizeCanvas()
    window.addEventListener('resize', () => this.resizeCanvas())

    this.input = new InputManager(this.app.view as HTMLCanvasElement)
    this.sceneManager = new SceneManager(this)
    this.gameLoop = new GameLoop(this)
    this.assetLoader = AssetLoader.getInstance()

    // Register scenes
    this.sceneManager.register('title', () => new TitleScene(this))
    this.sceneManager.register('game', () => new GameScene(this))
    this.sceneManager.register('gameover', () => new GameOverScene(this))
    this.sceneManager.register('shop', () => new ShopScene(this))
  }

  private resizeCanvas(): void {
    const canvas = this.app.view as HTMLCanvasElement
    const containerWidth = this.container.clientWidth
    const containerHeight = this.container.clientHeight
    const aspectRatio = GAME_WIDTH / GAME_HEIGHT

    let width = containerWidth
    let height = containerWidth / aspectRatio

    if (height > containerHeight) {
      height = containerHeight
      width = containerHeight * aspectRatio
    }

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.style.imageRendering = 'pixelated'
  }

  async start(): Promise<void> {
    // Load assets (will use placeholders if not available)
    await this.assetLoader.loadAll()

    this.sceneManager.switchTo('title')
    this.gameLoop.start()
  }

  update(dt: number): void {
    this.sceneManager.update(dt)
    this.input.update()
  }

  destroy(): void {
    this.gameLoop.stop()
    this.input.destroy()
    this.app.destroy(true, { children: true, texture: true, baseTexture: true })
  }
}
