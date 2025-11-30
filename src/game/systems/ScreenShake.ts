/**
 * Screen shake system for adding impact feedback
 */
export class ScreenShake {
  private intensity: number = 0
  private duration: number = 0
  private elapsed: number = 0
  private offsetX: number = 0
  private offsetY: number = 0

  /**
   * Trigger a screen shake
   * @param intensity - How far the screen moves (pixels)
   * @param duration - How long the shake lasts (seconds)
   */
  shake(intensity: number, duration: number = 0.3): void {
    // Only override if new shake is stronger
    if (intensity > this.intensity) {
      this.intensity = intensity
      this.duration = duration
      this.elapsed = 0
    }
  }

  /**
   * Update the shake effect
   * @param dt - Delta time in seconds
   */
  update(dt: number): void {
    if (this.duration <= 0) {
      this.offsetX = 0
      this.offsetY = 0
      return
    }

    this.elapsed += dt

    if (this.elapsed >= this.duration) {
      this.intensity = 0
      this.duration = 0
      this.offsetX = 0
      this.offsetY = 0
      return
    }

    // Decay intensity over time
    const progress = this.elapsed / this.duration
    const currentIntensity = this.intensity * (1 - progress)

    // Random offset within intensity range
    this.offsetX = (Math.random() * 2 - 1) * currentIntensity
    this.offsetY = (Math.random() * 2 - 1) * currentIntensity
  }

  /**
   * Get the current X offset to apply to the camera/stage
   */
  getOffsetX(): number {
    return this.offsetX
  }

  /**
   * Get the current Y offset to apply to the camera/stage
   */
  getOffsetY(): number {
    return this.offsetY
  }

  /**
   * Check if currently shaking
   */
  isShaking(): boolean {
    return this.duration > 0
  }
}

// Singleton instance for global access
let instance: ScreenShake | null = null

export function getScreenShake(): ScreenShake {
  if (!instance) {
    instance = new ScreenShake()
  }
  return instance
}

// Convenience function
export function shake(intensity: number, duration: number = 0.3): void {
  getScreenShake().shake(intensity, duration)
}
