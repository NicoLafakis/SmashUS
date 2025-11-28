import * as PIXI from 'pixi.js'
import { AABB } from '../utils/Collision'

export abstract class Entity {
  public sprite: PIXI.Sprite
  public x: number = 0
  public y: number = 0
  public vx: number = 0
  public vy: number = 0
  public width: number
  public height: number
  public active: boolean = true

  constructor(texture: PIXI.Texture, width: number, height: number) {
    this.sprite = new PIXI.Sprite(texture)
    this.sprite.anchor.set(0.5)
    this.width = width
    this.height = height
  }

  abstract update(dt: number): void

  getBounds(): AABB {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    }
  }

  updateSprite(): void {
    this.sprite.x = this.x
    this.sprite.y = this.y
  }

  destroy(): void {
    this.sprite.destroy()
    this.active = false
  }
}
