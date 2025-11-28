import * as PIXI from 'pixi.js'
import { Scene } from './Scene'
import { Game, GAME_WIDTH, GAME_HEIGHT } from '../Game'

export class TitleScene extends Scene {
  private startPrompt!: PIXI.Text

  constructor(game: Game) {
    super(game)
  }

  init(): void {
    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x1a1a2e)
    bg.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    bg.endFill()
    this.container.addChild(bg)

    // Title
    const title = new PIXI.Text('SMASH US', {
      fontFamily: 'Arial',
      fontSize: 72,
      fontWeight: 'bold',
      fill: ['#ff4444', '#ffffff', '#4444ff'],
      stroke: '#000000',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowDistance: 4,
    })
    title.anchor.set(0.5)
    title.x = GAME_WIDTH / 2
    title.y = GAME_HEIGHT / 3
    this.container.addChild(title)

    // Tagline
    const tagline = new PIXI.Text('John Q. Public vs the Government', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#cccccc',
    })
    tagline.anchor.set(0.5)
    tagline.x = GAME_WIDTH / 2
    tagline.y = GAME_HEIGHT / 3 + 60
    this.container.addChild(tagline)

    // Start prompt
    this.startPrompt = new PIXI.Text('Click to Start', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: '#ffffff',
    })
    this.startPrompt.anchor.set(0.5)
    this.startPrompt.x = GAME_WIDTH / 2
    this.startPrompt.y = GAME_HEIGHT * 0.65
    this.container.addChild(this.startPrompt)

    // Controls
    const controls = new PIXI.Text(
      'WASD: Move   |   Mouse: Aim   |   Left Click: Fire',
      {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: '#888888',
      }
    )
    controls.anchor.set(0.5)
    controls.x = GAME_WIDTH / 2
    controls.y = GAME_HEIGHT - 50
    this.container.addChild(controls)
  }

  private flashTimer: number = 0

  update(dt: number): void {
    // Flash the start prompt
    this.flashTimer += dt
    this.startPrompt.alpha = 0.5 + Math.sin(this.flashTimer * 4) * 0.5

    // Check for click to start
    const input = this.game.input.getState()
    if (input.fireJustPressed) {
      this.game.sceneManager.switchTo('game')
    }
  }
}
