import * as PIXI from 'pixi.js'
import { Scene } from './Scene'
import { Game, GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { playSound } from '../systems/AudioManager'
import { playMusic } from '../systems/MusicManager'

export class GameOverScene extends Scene {
  private restartPrompt!: PIXI.Text
  private flashTimer: number = 0
  private score: number = 0
  private isVictory: boolean = false

  constructor(game: Game) {
    super(game)
  }

  init(data?: Record<string, unknown>): void {
    this.score = (data?.score as number) || 0
    this.isVictory = (data?.victory as boolean) || false

    // Play appropriate music
    playMusic(this.isVictory ? 'victory' : 'gameover')

    // Background - different color for victory
    const bg = new PIXI.Graphics()
    bg.beginFill(this.isVictory ? 0x0a2a0a : 0x2a0a0a)
    bg.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    bg.endFill()
    this.container.addChild(bg)

    // Title text - victory or game over
    const titleText = new PIXI.Text(
      this.isVictory ? 'VICTORY!' : 'GAME OVER',
      {
        fontFamily: 'Arial',
        fontSize: 72,
        fontWeight: 'bold',
        fill: this.isVictory ? '#44ff44' : '#ff4444',
        stroke: '#000000',
        strokeThickness: 4,
      }
    )
    titleText.anchor.set(0.5)
    titleText.x = GAME_WIDTH / 2
    titleText.y = GAME_HEIGHT / 4
    this.container.addChild(titleText)

    // Subtitle for victory
    if (this.isVictory) {
      const subtitle = new PIXI.Text('You Defeated the Government!', {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: '#88ff88',
      })
      subtitle.anchor.set(0.5)
      subtitle.x = GAME_WIDTH / 2
      subtitle.y = GAME_HEIGHT / 4 + 60
      this.container.addChild(subtitle)
    }

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
    this.restartPrompt = new PIXI.Text(
      this.isVictory ? 'Tap or Click to Play Again' : 'Tap or Click to Restart',
      {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: '#ffffff',
      }
    )
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
      playSound('menu_select')
      // Go back to title on victory, straight to game on defeat
      this.game.sceneManager.switchTo(this.isVictory ? 'title' : 'game')
    }
  }
}
