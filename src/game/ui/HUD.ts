import * as PIXI from 'pixi.js'
import { Player } from '../entities/Player'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'

export class HUD {
  public container: PIXI.Container
  private healthBar: PIXI.Graphics
  private healthText: PIXI.Text
  private shieldPips: PIXI.Graphics
  private scoreText: PIXI.Text
  private livesText: PIXI.Text
  private weaponText: PIXI.Text
  private roomText: PIXI.Text
  private powerupContainer: PIXI.Container
  private damageBoostBar: PIXI.Graphics
  private spreadBoostBar: PIXI.Graphics

  constructor() {
    this.container = new PIXI.Container()

    // Health bar background
    const healthBg = new PIXI.Graphics()
    healthBg.beginFill(0x333333)
    healthBg.drawRect(10, 10, 200, 24)
    healthBg.endFill()
    this.container.addChild(healthBg)

    // Health bar
    this.healthBar = new PIXI.Graphics()
    this.container.addChild(this.healthBar)

    // Health text
    this.healthText = new PIXI.Text('100/100', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: '#ffffff'
    })
    this.healthText.x = 15
    this.healthText.y = 14
    this.container.addChild(this.healthText)

    // Shield pips
    this.shieldPips = new PIXI.Graphics()
    this.shieldPips.x = 10
    this.shieldPips.y = 38
    this.container.addChild(this.shieldPips)

    // Score (top right)
    this.scoreText = new PIXI.Text('Score: 0', {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#ffffff'
    })
    this.scoreText.anchor.set(1, 0)
    this.scoreText.x = GAME_WIDTH - 10
    this.scoreText.y = 10
    this.container.addChild(this.scoreText)

    // Lives (below score)
    this.livesText = new PIXI.Text('Lives: 3', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#ff4444'
    })
    this.livesText.anchor.set(1, 0)
    this.livesText.x = GAME_WIDTH - 10
    this.livesText.y = 40
    this.container.addChild(this.livesText)

    // Room indicator (top center)
    this.roomText = new PIXI.Text('Level 1 - Room 1', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#cccccc'
    })
    this.roomText.anchor.set(0.5, 0)
    this.roomText.x = GAME_WIDTH / 2
    this.roomText.y = 10
    this.container.addChild(this.roomText)

    // Weapon indicator (bottom left)
    this.weaponText = new PIXI.Text('Wrench', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#88ff88'
    })
    this.weaponText.x = 10
    this.weaponText.y = GAME_HEIGHT - 30
    this.container.addChild(this.weaponText)

    // Powerup timers (bottom center)
    this.powerupContainer = new PIXI.Container()
    this.powerupContainer.x = GAME_WIDTH / 2 - 100
    this.powerupContainer.y = GAME_HEIGHT - 40
    this.container.addChild(this.powerupContainer)

    // Damage boost bar
    this.damageBoostBar = new PIXI.Graphics()
    this.powerupContainer.addChild(this.damageBoostBar)

    // Spread boost bar
    this.spreadBoostBar = new PIXI.Graphics()
    this.spreadBoostBar.y = 16
    this.powerupContainer.addChild(this.spreadBoostBar)
  }

  update(player: Player, level: number, room: number): void {
    // Health bar
    const healthPercent = player.health / player.maxHealth
    this.healthBar.clear()
    this.healthBar.beginFill(this.getHealthColor(healthPercent))
    this.healthBar.drawRect(12, 12, 196 * healthPercent, 20)
    this.healthBar.endFill()
    this.healthText.text = `${player.health}/${player.maxHealth}`

    // Shield pips
    this.shieldPips.clear()
    for (let i = 0; i < 3; i++) {
      if (i < player.shield) {
        this.shieldPips.beginFill(0x4488ff)
      } else {
        this.shieldPips.beginFill(0x333333)
      }
      this.shieldPips.drawRect(i * 25, 0, 20, 10)
      this.shieldPips.endFill()
    }

    // Score
    this.scoreText.text = `Score: ${player.score}`

    // Lives
    this.livesText.text = `Lives: ${player.lives}`

    // Room
    this.roomText.text = `Level ${level} - Room ${room}`

    // Weapon
    this.weaponText.text = player.weapon.stats.name

    // Powerup bars
    this.updatePowerupBar(
      this.damageBoostBar,
      player.getDamageBoostTimeRemaining(),
      10,
      0xff8800,
      'DMG x2'
    )
    this.updatePowerupBar(
      this.spreadBoostBar,
      player.getSpreadBoostTimeRemaining(),
      10,
      0x00aaff,
      'SPREAD x2'
    )
  }

  private updatePowerupBar(
    graphics: PIXI.Graphics,
    timeRemaining: number,
    maxDuration: number,
    color: number,
    _label: string
  ): void {
    graphics.clear()
    if (timeRemaining <= 0) return

    const percent = timeRemaining / maxDuration
    graphics.beginFill(0x333333)
    graphics.drawRect(0, 0, 100, 12)
    graphics.endFill()
    graphics.beginFill(color)
    graphics.drawRect(1, 1, 98 * percent, 10)
    graphics.endFill()

    // Label would be added as text, but keeping simple for now
  }

  private getHealthColor(percent: number): number {
    if (percent > 0.6) return 0x44ff44
    if (percent > 0.3) return 0xffff44
    return 0xff4444
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
