import * as PIXI from 'pixi.js'
import { Scene } from './Scene'
import { Game, GAME_WIDTH, GAME_HEIGHT } from '../Game'

export class GameOverScene extends Scene {
  private restartPrompt!: PIXI.Text
  private flashTimer: number = 0
  private score: number = 0

  constructor(game: Game) {
    super(game)
  }

  init(data?: Record<string, unknown>): void {
    this.score = (data?.score as number) || 0

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(0x2a0a0a)
    bg.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    bg.endFill()
    this.container.addChild(bg)

    // Game Over text
    const gameOver = new PIXI.Text('GAME OVER', {
      fontFamily: 'Arial',
      fontSize: 72,
      fontWeight: 'bold',
      fill: '#ff4444',
      stroke: '#000000',
      strokeThickness: 4,
    })
    gameOver.anchor.set(0.5)
    gameOver.x = GAME_WIDTH / 2
    gameOver.y = GAME_HEIGHT / 3
    this.container.addChild(gameOver)

    // Final score
    const scoreText = new PIXI.Text(`Final Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: '#ffffff',
    })
    scoreText.anchor.set(0.5)
    scoreText.x = GAME_WIDTH / 2
    scoreText.y = GAME_HEIGHT / 2
    this.container.addChild(scoreText)

    // Restart prompt
    this.restartPrompt = new PIXI.Text('Click to Restart', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: '#ffffff',
    })
    this.restartPrompt.anchor.set(0.5)
    this.restartPrompt.x = GAME_WIDTH / 2
    this.restartPrompt.y = GAME_HEIGHT * 0.7
    this.container.addChild(this.restartPrompt)
  }

  update(dt: number): void {
    // Flash the restart prompt
    this.flashTimer += dt
    this.restartPrompt.alpha = 0.5 + Math.sin(this.flashTimer * 4) * 0.5

    // Check for click to restart
    const input = this.game.input.getState()
    if (input.fireJustPressed) {
      this.game.sceneManager.switchTo('game')
    }
  }
}
