import * as PIXI from 'pixi.js'
import { GAME_WIDTH, GAME_HEIGHT } from '../Game'

interface CameraTarget {
  x: number
  y: number
}

/**
 * Camera system with shake, follow, and zoom capabilities
 */
export class Camera {
  private container: PIXI.Container
  private target: CameraTarget | null = null

  // Position
  private x: number = GAME_WIDTH / 2
  private y: number = GAME_HEIGHT / 2

  // Shake
  private shakeIntensity: number = 0
  private shakeDuration: number = 0
  private shakeElapsed: number = 0
  private shakeOffsetX: number = 0
  private shakeOffsetY: number = 0

  // Zoom
  private zoom: number = 1
  private targetZoom: number = 1
  private zoomSpeed: number = 2

  // Follow settings
  private followSpeed: number = 5
  private followOffsetX: number = 0
  private followOffsetY: number = 0
  private followDeadzone: number = 50

  // Flash effect
  private flashGraphics: PIXI.Graphics | null = null
  private flashAlpha: number = 0
  private flashColor: number = 0xffffff
  private flashDuration: number = 0

  // Bounds (for clamping camera position)
  private boundsEnabled: boolean = false
  private boundsMinX: number = 0
  private boundsMinY: number = 0
  private boundsMaxX: number = GAME_WIDTH
  private boundsMaxY: number = GAME_HEIGHT

  constructor(container: PIXI.Container) {
    this.container = container

    // Create flash overlay
    this.flashGraphics = new PIXI.Graphics()
    this.flashGraphics.zIndex = 9999
    this.flashGraphics.visible = false
  }

  /**
   * Set the target for the camera to follow
   */
  setTarget(target: CameraTarget | null): void {
    this.target = target
  }

  /**
   * Set camera follow parameters
   */
  setFollowParams(speed: number, deadzone: number = 50): void {
    this.followSpeed = speed
    this.followDeadzone = deadzone
  }

  /**
   * Enable camera bounds clamping
   */
  setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
    this.boundsEnabled = true
    this.boundsMinX = minX
    this.boundsMinY = minY
    this.boundsMaxX = maxX
    this.boundsMaxY = maxY
  }

  /**
   * Disable camera bounds
   */
  clearBounds(): void {
    this.boundsEnabled = false
  }

  /**
   * Trigger a screen shake
   */
  shake(intensity: number, duration: number = 0.3): void {
    // Only override if stronger
    if (intensity > this.shakeIntensity) {
      this.shakeIntensity = intensity
      this.shakeDuration = duration
      this.shakeElapsed = 0
    }
  }

  /**
   * Trigger a screen flash
   */
  flash(color: number = 0xffffff, duration: number = 0.1, intensity: number = 0.5): void {
    this.flashColor = color
    this.flashDuration = duration
    this.flashAlpha = intensity
  }

  /**
   * Set zoom level (1 = normal, 2 = 2x zoom in, 0.5 = 2x zoom out)
   */
  setZoom(zoom: number, instant: boolean = false): void {
    this.targetZoom = Math.max(0.5, Math.min(2, zoom))
    if (instant) {
      this.zoom = this.targetZoom
    }
  }

  /**
   * Zoom in briefly for impact (boss intro, big hits)
   */
  impactZoom(amount: number = 0.1, duration: number = 0.2): void {
    const originalZoom = this.targetZoom
    this.setZoom(this.zoom + amount)

    // Reset after duration
    setTimeout(() => {
      this.setZoom(originalZoom)
    }, duration * 1000)
  }

  /**
   * Update camera position and effects
   */
  update(dt: number): void {
    // Update follow
    if (this.target) {
      const targetX = this.target.x + this.followOffsetX
      const targetY = this.target.y + this.followOffsetY

      const dx = targetX - this.x
      const dy = targetY - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Only move if outside deadzone
      if (dist > this.followDeadzone) {
        const moveAmount = this.followSpeed * dt
        const ratio = Math.min(1, moveAmount / dist)
        this.x += dx * ratio
        this.y += dy * ratio
      }
    }

    // Clamp to bounds
    if (this.boundsEnabled) {
      const halfWidth = GAME_WIDTH / (2 * this.zoom)
      const halfHeight = GAME_HEIGHT / (2 * this.zoom)
      this.x = Math.max(this.boundsMinX + halfWidth, Math.min(this.boundsMaxX - halfWidth, this.x))
      this.y = Math.max(this.boundsMinY + halfHeight, Math.min(this.boundsMaxY - halfHeight, this.y))
    }

    // Update shake
    this.updateShake(dt)

    // Update zoom
    if (this.zoom !== this.targetZoom) {
      const diff = this.targetZoom - this.zoom
      this.zoom += diff * this.zoomSpeed * dt
      if (Math.abs(diff) < 0.01) {
        this.zoom = this.targetZoom
      }
    }

    // Update flash
    if (this.flashAlpha > 0) {
      this.flashAlpha -= dt / this.flashDuration
      if (this.flashAlpha < 0) this.flashAlpha = 0
    }

    // Apply to container
    this.applyTransform()
  }

  private updateShake(dt: number): void {
    if (this.shakeDuration <= 0) {
      this.shakeOffsetX = 0
      this.shakeOffsetY = 0
      return
    }

    this.shakeElapsed += dt

    if (this.shakeElapsed >= this.shakeDuration) {
      this.shakeIntensity = 0
      this.shakeDuration = 0
      this.shakeOffsetX = 0
      this.shakeOffsetY = 0
      return
    }

    // Decay intensity over time
    const progress = this.shakeElapsed / this.shakeDuration
    const currentIntensity = this.shakeIntensity * (1 - progress)

    // Random offset (use integer values for pixel-perfect)
    this.shakeOffsetX = Math.floor((Math.random() * 2 - 1) * currentIntensity)
    this.shakeOffsetY = Math.floor((Math.random() * 2 - 1) * currentIntensity)
  }

  private applyTransform(): void {
    // For a fixed-screen game like this, we primarily use shake offset
    // If we wanted scrolling, we'd offset by camera position
    this.container.x = this.shakeOffsetX
    this.container.y = this.shakeOffsetY

    // Apply zoom (centered on screen center)
    this.container.scale.set(this.zoom)
    this.container.pivot.set(
      (GAME_WIDTH / 2) * (1 - 1 / this.zoom),
      (GAME_HEIGHT / 2) * (1 - 1 / this.zoom)
    )
  }

  /**
   * Draw flash overlay (call in render)
   */
  renderFlash(container: PIXI.Container): void {
    if (!this.flashGraphics) return

    if (this.flashAlpha > 0) {
      if (!this.flashGraphics.parent) {
        container.addChild(this.flashGraphics)
      }
      this.flashGraphics.visible = true
      this.flashGraphics.clear()
      this.flashGraphics.beginFill(this.flashColor, this.flashAlpha)
      this.flashGraphics.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      this.flashGraphics.endFill()
    } else {
      this.flashGraphics.visible = false
    }
  }

  /**
   * Get current shake offset X
   */
  getShakeOffsetX(): number {
    return this.shakeOffsetX
  }

  /**
   * Get current shake offset Y
   */
  getShakeOffsetY(): number {
    return this.shakeOffsetY
  }

  /**
   * Check if currently shaking
   */
  isShaking(): boolean {
    return this.shakeDuration > 0
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.zoom
  }

  /**
   * Reset camera to default state
   */
  reset(): void {
    this.x = GAME_WIDTH / 2
    this.y = GAME_HEIGHT / 2
    this.zoom = 1
    this.targetZoom = 1
    this.shakeIntensity = 0
    this.shakeDuration = 0
    this.shakeOffsetX = 0
    this.shakeOffsetY = 0
    this.flashAlpha = 0
    this.target = null
    this.applyTransform()
  }

  /**
   * Destroy camera resources
   */
  destroy(): void {
    if (this.flashGraphics) {
      this.flashGraphics.destroy()
      this.flashGraphics = null
    }
  }
}

// Singleton for easy global access
let instance: Camera | null = null

export function initCamera(container: PIXI.Container): Camera {
  if (instance) {
    instance.destroy()
  }
  instance = new Camera(container)
  return instance
}

export function getCamera(): Camera | null {
  return instance
}

// Convenience functions
export function cameraShake(intensity: number, duration: number = 0.3): void {
  instance?.shake(intensity, duration)
}

export function cameraFlash(color: number = 0xffffff, duration: number = 0.1, intensity: number = 0.5): void {
  instance?.flash(color, duration, intensity)
}

export function cameraImpactZoom(amount: number = 0.1, duration: number = 0.2): void {
  instance?.impactZoom(amount, duration)
}
