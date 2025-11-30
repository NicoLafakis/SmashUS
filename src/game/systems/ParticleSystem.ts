import * as PIXI from 'pixi.js'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: number
  gravity: number
  friction: number
  shrink: boolean
  fade: boolean
}

interface ParticleConfig {
  count: number
  colors: number[]
  speedMin: number
  speedMax: number
  sizeMin: number
  sizeMax: number
  lifeMin: number
  lifeMax: number
  gravity?: number
  friction?: number
  spread?: number // Angle spread in radians (default: full circle)
  direction?: number // Base direction in radians
  shrink?: boolean
  fade?: boolean
}

const PARTICLE_PRESETS: Record<string, ParticleConfig> = {
  // Enemy death - red/orange burst
  enemy_death: {
    count: 12,
    colors: [0xff6432, 0xff9600, 0xff3232],
    speedMin: 100,
    speedMax: 200,
    sizeMin: 3,
    sizeMax: 8,
    lifeMin: 0.3,
    lifeMax: 0.6,
    gravity: 100,
    shrink: true,
    fade: true,
  },

  // Hit spark - yellow/white
  hit_spark: {
    count: 6,
    colors: [0xffffc8, 0xffff64, 0xffffff],
    speedMin: 80,
    speedMax: 150,
    sizeMin: 2,
    sizeMax: 5,
    lifeMin: 0.1,
    lifeMax: 0.25,
    shrink: true,
    fade: true,
  },

  // Boss death - big explosion
  boss_death: {
    count: 40,
    colors: [0xffc832, 0xff6400, 0xffffc8, 0xff0000],
    speedMin: 150,
    speedMax: 400,
    sizeMin: 5,
    sizeMax: 18,
    lifeMin: 0.5,
    lifeMax: 1.5,
    gravity: 50,
    shrink: true,
    fade: true,
  },

  // Pickup collected - sparkles
  pickup: {
    count: 8,
    colors: [0x64ff64, 0xc8ffc8, 0xffffff],
    speedMin: 50,
    speedMax: 120,
    sizeMin: 3,
    sizeMax: 6,
    lifeMin: 0.3,
    lifeMax: 0.5,
    gravity: -50, // Float up
    shrink: true,
    fade: true,
  },

  // Health pickup - green cross
  pickup_health: {
    count: 10,
    colors: [0x00ff00, 0x64ff64, 0xc8ffc8],
    speedMin: 60,
    speedMax: 140,
    sizeMin: 3,
    sizeMax: 7,
    lifeMin: 0.4,
    lifeMax: 0.6,
    gravity: -30,
    shrink: true,
    fade: true,
  },

  // Weapon pickup - blue
  pickup_weapon: {
    count: 10,
    colors: [0x6464ff, 0x64c8ff, 0xffffff],
    speedMin: 70,
    speedMax: 150,
    sizeMin: 3,
    sizeMax: 7,
    lifeMin: 0.3,
    lifeMax: 0.6,
    gravity: -20,
    shrink: true,
    fade: true,
  },

  // Power-up - rainbow
  pickup_powerup: {
    count: 15,
    colors: [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0xff00ff],
    speedMin: 80,
    speedMax: 180,
    sizeMin: 4,
    sizeMax: 8,
    lifeMin: 0.4,
    lifeMax: 0.8,
    gravity: -40,
    shrink: true,
    fade: true,
  },

  // Money/score burst - green
  money: {
    count: 10,
    colors: [0x32c832, 0x64ff64, 0x00aa00],
    speedMin: 80,
    speedMax: 160,
    sizeMin: 4,
    sizeMax: 8,
    lifeMin: 0.4,
    lifeMax: 0.8,
    gravity: 80,
    shrink: true,
    fade: true,
  },

  // Player hurt - red flash
  player_hurt: {
    count: 8,
    colors: [0xff0000, 0xff3232, 0xaa0000],
    speedMin: 60,
    speedMax: 120,
    sizeMin: 4,
    sizeMax: 8,
    lifeMin: 0.2,
    lifeMax: 0.4,
    shrink: true,
    fade: true,
  },

  // Shield hit - cyan
  shield_hit: {
    count: 12,
    colors: [0x00ffff, 0x64ffff, 0xffffff],
    speedMin: 100,
    speedMax: 200,
    sizeMin: 3,
    sizeMax: 6,
    lifeMin: 0.2,
    lifeMax: 0.4,
    shrink: true,
    fade: true,
  },

  // Bullet trail - yellow
  bullet_trail: {
    count: 1,
    colors: [0xffff64],
    speedMin: 0,
    speedMax: 20,
    sizeMin: 2,
    sizeMax: 4,
    lifeMin: 0.1,
    lifeMax: 0.15,
    shrink: true,
    fade: true,
  },

  // Muzzle flash
  muzzle_flash: {
    count: 5,
    colors: [0xffff00, 0xffaa00, 0xffffff],
    speedMin: 50,
    speedMax: 150,
    sizeMin: 2,
    sizeMax: 5,
    lifeMin: 0.05,
    lifeMax: 0.1,
    spread: Math.PI / 4,
    shrink: true,
    fade: true,
  },

  // Explosion
  explosion: {
    count: 25,
    colors: [0xff6400, 0xffaa00, 0xffff00, 0xff0000],
    speedMin: 100,
    speedMax: 300,
    sizeMin: 4,
    sizeMax: 12,
    lifeMin: 0.3,
    lifeMax: 0.7,
    gravity: 50,
    shrink: true,
    fade: true,
  },

  // Dust puff
  dust: {
    count: 6,
    colors: [0x888888, 0x666666, 0xaaaaaa],
    speedMin: 20,
    speedMax: 60,
    sizeMin: 3,
    sizeMax: 7,
    lifeMin: 0.3,
    lifeMax: 0.5,
    gravity: -20,
    shrink: false,
    fade: true,
  },

  // Room clear celebration
  room_clear: {
    count: 30,
    colors: [0x44ff44, 0xffff44, 0x44ffff, 0xff44ff],
    speedMin: 100,
    speedMax: 250,
    sizeMin: 4,
    sizeMax: 10,
    lifeMin: 0.5,
    lifeMax: 1.0,
    gravity: 100,
    shrink: true,
    fade: true,
  },
}

export class ParticleSystem {
  private particles: Particle[] = []
  private graphics: PIXI.Graphics

  constructor(container: PIXI.Container) {
    this.graphics = new PIXI.Graphics()
    this.graphics.zIndex = 1000 // Draw on top
    container.addChild(this.graphics)
  }

  /**
   * Spawn particles using a preset
   */
  emit(x: number, y: number, preset: string): void {
    const config = PARTICLE_PRESETS[preset]
    if (!config) {
      console.warn(`Unknown particle preset: ${preset}`)
      return
    }

    this.emitCustom(x, y, config)
  }

  /**
   * Spawn particles with custom config
   */
  emitCustom(x: number, y: number, config: ParticleConfig): void {
    const spread = config.spread ?? Math.PI * 2
    const baseDir = config.direction ?? 0

    for (let i = 0; i < config.count; i++) {
      const angle = baseDir + (Math.random() - 0.5) * spread
      const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin)
      const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin)
      const life = config.lifeMin + Math.random() * (config.lifeMax - config.lifeMin)
      const color = config.colors[Math.floor(Math.random() * config.colors.length)]

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        life,
        maxLife: life,
        color,
        gravity: config.gravity ?? 0,
        friction: config.friction ?? 0.98,
        shrink: config.shrink ?? true,
        fade: config.fade ?? true,
      })
    }
  }

  /**
   * Emit particles in a direction (for muzzle flash, trails)
   */
  emitDirectional(x: number, y: number, direction: number, preset: string): void {
    const config = PARTICLE_PRESETS[preset]
    if (!config) return

    this.emitCustom(x, y, {
      ...config,
      direction,
      spread: config.spread ?? Math.PI / 3,
    })
  }

  /**
   * Update all particles
   */
  update(dt: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      // Apply physics
      p.vy += p.gravity * dt
      p.vx *= p.friction
      p.vy *= p.friction

      // Move
      p.x += p.vx * dt
      p.y += p.vy * dt

      // Age
      p.life -= dt

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }

    // Redraw
    this.render()
  }

  /**
   * Render all particles
   */
  private render(): void {
    this.graphics.clear()

    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife

      // Calculate current size and alpha
      const size = p.shrink ? p.size * lifeRatio : p.size
      const alpha = p.fade ? lifeRatio : 1

      if (size <= 0 || alpha <= 0) continue

      this.graphics.beginFill(p.color, alpha)
      this.graphics.drawRect(
        Math.floor(p.x - size / 2),
        Math.floor(p.y - size / 2),
        Math.ceil(size),
        Math.ceil(size)
      )
      this.graphics.endFill()
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = []
    this.graphics.clear()
  }

  /**
   * Get particle count (for debugging)
   */
  getParticleCount(): number {
    return this.particles.length
  }

  /**
   * Destroy the particle system
   */
  destroy(): void {
    this.clear()
    this.graphics.destroy()
  }
}

// Singleton instance
let instance: ParticleSystem | null = null

export function initParticleSystem(container: PIXI.Container): ParticleSystem {
  if (instance) {
    instance.destroy()
  }
  instance = new ParticleSystem(container)
  return instance
}

export function getParticleSystem(): ParticleSystem | null {
  return instance
}

// Convenience function
export function emitParticles(x: number, y: number, preset: string): void {
  instance?.emit(x, y, preset)
}

export function emitParticlesDirectional(x: number, y: number, direction: number, preset: string): void {
  instance?.emitDirectional(x, y, direction, preset)
}
