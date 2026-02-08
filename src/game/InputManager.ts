import * as PIXI from 'pixi.js'
import { GAME_WIDTH, GAME_HEIGHT } from './Game'

export interface InputState {
  moveX: number
  moveY: number
  aimX: number
  aimY: number
  fire: boolean
  fireJustPressed: boolean
}

export class InputManager {
  // Desktop input
  private keys: Set<string> = new Set()
  private mouseX: number = 0
  private mouseY: number = 0
  private mouseDown: boolean = false
  private prevMouseDown: boolean = false

  // Touch input
  private leftTouch: { id: number; startX: number; startY: number; x: number; y: number } | null = null
  private rightTouch: { id: number; startX: number; startY: number; x: number; y: number } | null = null
  private touchJustStarted: boolean = false
  private prevTouchJustStarted: boolean = false

  // Player position for touch aim projection
  private playerX: number = GAME_WIDTH / 2
  private playerY: number = GAME_HEIGHT / 2

  // Joystick config
  private readonly STICK_RADIUS = 80
  private readonly DEAD_ZONE = 10

  // Visual container (add to stage for joystick rendering)
  public container: PIXI.Container
  private leftBase: PIXI.Graphics
  private leftThumb: PIXI.Graphics
  private rightBase: PIXI.Graphics
  private rightThumb: PIXI.Graphics

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.container = new PIXI.Container()

    this.leftBase = new PIXI.Graphics()
    this.leftThumb = new PIXI.Graphics()
    this.rightBase = new PIXI.Graphics()
    this.rightThumb = new PIXI.Graphics()
    this.container.addChild(this.leftBase, this.leftThumb, this.rightBase, this.rightThumb)
    this.hideJoysticks()

    // Desktop events
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mouseup', this.onMouseUp)
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    // Touch events
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false })
  }

  // --- Desktop handlers ---

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code.toLowerCase())
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code.toLowerCase())
  }

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = GAME_WIDTH / rect.width
    const scaleY = GAME_HEIGHT / rect.height
    this.mouseX = (e.clientX - rect.left) * scaleX
    this.mouseY = (e.clientY - rect.top) * scaleY
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) this.mouseDown = true
  }

  private onMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) this.mouseDown = false
  }

  // --- Touch handlers ---

  private touchToGame(touch: Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (touch.clientX - rect.left) * (GAME_WIDTH / rect.width),
      y: (touch.clientY - rect.top) * (GAME_HEIGHT / rect.height)
    }
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault()
    this.touchJustStarted = true

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const pos = this.touchToGame(touch)

      if (pos.x < GAME_WIDTH / 2) {
        // Left half -> movement joystick
        if (!this.leftTouch) {
          this.leftTouch = { id: touch.identifier, startX: pos.x, startY: pos.y, x: pos.x, y: pos.y }
        }
      } else {
        // Right half -> aim + auto-fire joystick
        if (!this.rightTouch) {
          this.rightTouch = { id: touch.identifier, startX: pos.x, startY: pos.y, x: pos.x, y: pos.y }
        }
      }
    }
  }

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const pos = this.touchToGame(touch)

      if (this.leftTouch && touch.identifier === this.leftTouch.id) {
        this.leftTouch.x = pos.x
        this.leftTouch.y = pos.y
      }
      if (this.rightTouch && touch.identifier === this.rightTouch.id) {
        this.rightTouch.x = pos.x
        this.rightTouch.y = pos.y
      }
    }
  }

  private onTouchEnd = (e: TouchEvent): void => {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]

      if (this.leftTouch && touch.identifier === this.leftTouch.id) {
        this.leftTouch = null
      }
      if (this.rightTouch && touch.identifier === this.rightTouch.id) {
        this.rightTouch = null
      }
    }
  }

  // --- Joystick math ---

  private getStickDisplacement(touch: { startX: number; startY: number; x: number; y: number }): { x: number; y: number; magnitude: number } {
    const dx = touch.x - touch.startX
    const dy = touch.y - touch.startY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < this.DEAD_ZONE) {
      return { x: 0, y: 0, magnitude: 0 }
    }

    const clampedDist = Math.min(dist, this.STICK_RADIUS)
    const normalized = clampedDist / this.STICK_RADIUS
    return {
      x: (dx / dist) * normalized,
      y: (dy / dist) * normalized,
      magnitude: normalized
    }
  }

  // --- Public API ---

  setPlayerPosition(x: number, y: number): void {
    this.playerX = x
    this.playerY = y
  }

  getState(): InputState {
    let moveX = 0
    let moveY = 0

    // Keyboard movement
    if (this.keys.has('keyw') || this.keys.has('arrowup')) moveY -= 1
    if (this.keys.has('keys') || this.keys.has('arrowdown')) moveY += 1
    if (this.keys.has('keya') || this.keys.has('arrowleft')) moveX -= 1
    if (this.keys.has('keyd') || this.keys.has('arrowright')) moveX += 1

    if (moveX !== 0 && moveY !== 0) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY)
      moveX /= len
      moveY /= len
    }

    let aimX = this.mouseX
    let aimY = this.mouseY
    let fire = this.mouseDown
    let fireJustPressed = this.mouseDown && !this.prevMouseDown

    // Touch overrides
    if (this.leftTouch) {
      const stick = this.getStickDisplacement(this.leftTouch)
      if (stick.magnitude > 0) {
        moveX = stick.x
        moveY = stick.y
      }
    }

    if (this.rightTouch) {
      const stick = this.getStickDisplacement(this.rightTouch)
      if (stick.magnitude > 0) {
        aimX = this.playerX + stick.x * 500
        aimY = this.playerY + stick.y * 500
        fire = true
      }
    }

    // Any touch tap triggers fireJustPressed (for menus)
    if (this.touchJustStarted && !this.prevTouchJustStarted) {
      fireJustPressed = true
    }

    this.updateJoystickVisuals()

    return { moveX, moveY, aimX, aimY, fire, fireJustPressed }
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code.toLowerCase())
  }

  isKeyPressed(code: string): boolean {
    return this.keys.has(code.toLowerCase())
  }

  isKeyJustPressed(code: string): boolean {
    return this.keys.has(code.toLowerCase())
  }

  update(): void {
    this.prevMouseDown = this.mouseDown
    this.prevTouchJustStarted = this.touchJustStarted
    this.touchJustStarted = false
  }

  // --- Joystick visuals ---

  private hideJoysticks(): void {
    this.leftBase.visible = false
    this.leftThumb.visible = false
    this.rightBase.visible = false
    this.rightThumb.visible = false
  }

  private drawBase(g: PIXI.Graphics, x: number, y: number): void {
    g.clear()
    g.lineStyle(3, 0xffffff, 0.3)
    g.beginFill(0xffffff, 0.08)
    g.drawCircle(x, y, this.STICK_RADIUS)
    g.endFill()
    g.visible = true
  }

  private drawThumb(g: PIXI.Graphics, x: number, y: number): void {
    g.clear()
    g.beginFill(0xffffff, 0.45)
    g.drawCircle(x, y, 25)
    g.endFill()
    g.visible = true
  }

  private updateJoystickVisuals(): void {
    if (this.leftTouch) {
      this.drawBase(this.leftBase, this.leftTouch.startX, this.leftTouch.startY)
      const stick = this.getStickDisplacement(this.leftTouch)
      this.drawThumb(this.leftThumb,
        this.leftTouch.startX + stick.x * this.STICK_RADIUS,
        this.leftTouch.startY + stick.y * this.STICK_RADIUS
      )
    } else {
      this.leftBase.visible = false
      this.leftThumb.visible = false
    }

    if (this.rightTouch) {
      this.drawBase(this.rightBase, this.rightTouch.startX, this.rightTouch.startY)
      const stick = this.getStickDisplacement(this.rightTouch)
      this.drawThumb(this.rightThumb,
        this.rightTouch.startX + stick.x * this.STICK_RADIUS,
        this.rightTouch.startY + stick.y * this.STICK_RADIUS
      )
    } else {
      this.rightBase.visible = false
      this.rightThumb.visible = false
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)
    this.canvas.removeEventListener('touchstart', this.onTouchStart)
    this.canvas.removeEventListener('touchmove', this.onTouchMove)
    this.canvas.removeEventListener('touchend', this.onTouchEnd)
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd)
    this.container.destroy({ children: true })
  }
}
