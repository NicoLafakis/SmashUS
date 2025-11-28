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
  private keys: Set<string> = new Set()
  private mouseX: number = 0
  private mouseY: number = 0
  private mouseDown: boolean = false
  private prevMouseDown: boolean = false
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mouseup', this.onMouseUp)
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

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
    if (e.button === 0) {
      this.mouseDown = true
    }
  }

  private onMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.mouseDown = false
    }
  }

  getState(): InputState {
    let moveX = 0
    let moveY = 0

    // WASD movement
    if (this.keys.has('keyw') || this.keys.has('arrowup')) moveY -= 1
    if (this.keys.has('keys') || this.keys.has('arrowdown')) moveY += 1
    if (this.keys.has('keya') || this.keys.has('arrowleft')) moveX -= 1
    if (this.keys.has('keyd') || this.keys.has('arrowright')) moveX += 1

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY)
      moveX /= len
      moveY /= len
    }

    return {
      moveX,
      moveY,
      aimX: this.mouseX,
      aimY: this.mouseY,
      fire: this.mouseDown,
      fireJustPressed: this.mouseDown && !this.prevMouseDown
    }
  }

  isKeyPressed(code: string): boolean {
    return this.keys.has(code.toLowerCase())
  }

  isKeyJustPressed(code: string): boolean {
    // For simple implementation, this will be handled by tracking previous states
    return this.keys.has(code.toLowerCase())
  }

  update(): void {
    this.prevMouseDown = this.mouseDown
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)
  }
}
