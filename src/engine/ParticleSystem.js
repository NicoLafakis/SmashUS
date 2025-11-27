class Particle {
  constructor(x, y, vx, vy, color, life, size) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.color = color
    this.life = life
    this.maxLife = life
    this.size = size
    this.gravity = 0.3
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime
    this.vy += this.gravity * deltaTime
    this.life -= deltaTime
    return this.life > 0
  }

  render(ctx) {
    const alpha = this.life / this.maxLife
    ctx.fillStyle = this.color
    ctx.globalAlpha = alpha
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
    ctx.globalAlpha = 1
  }
}

class ParticleSystem {
  constructor() {
    this.particles = []
  }

  emit(x, y, count, config = {}) {
    const {
      colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4'],
      speedMin = 2,
      speedMax = 8,
      angleMin = 0,
      angleMax = Math.PI * 2,
      life = 0.8,
      sizeMin = 2,
      sizeMax = 4
    } = config

    for (let i = 0; i < count; i++) {
      const angle = angleMin + Math.random() * (angleMax - angleMin)
      const speed = speedMin + Math.random() * (speedMax - speedMin)
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = sizeMin + Math.random() * (sizeMax - sizeMin)

      this.particles.push(new Particle(x, y, vx, vy, color, life, size))
    }
  }

  // Emit jump particles
  emitJump(x, y) {
    this.emit(x, y, 8, {
      colors: ['#ffffff', '#cccccc', '#aaaaaa'],
      speedMin: 1,
      speedMax: 4,
      angleMin: Math.PI * 0.3,
      angleMax: Math.PI * 0.7,
      life: 0.5,
      sizeMin: 2,
      sizeMax: 3
    })
  }

  // Emit land particles
  emitLand(x, y) {
    this.emit(x, y, 12, {
      colors: ['#ffffff', '#e0e0e0', '#c0c0c0'],
      speedMin: 2,
      speedMax: 6,
      angleMin: Math.PI * 0.2,
      angleMax: Math.PI * 0.8,
      life: 0.6,
      sizeMin: 2,
      sizeMax: 4
    })
  }

  // Emit dash trail
  emitDash(x, y) {
    this.emit(x, y, 5, {
      colors: ['#4ecdc4', '#45b7af', '#3ca19a'],
      speedMin: 0.5,
      speedMax: 2,
      angleMin: 0,
      angleMax: Math.PI * 2,
      life: 0.4,
      sizeMin: 3,
      sizeMax: 5
    })
  }

  // Emit hit particles
  emitHit(x, y) {
    this.emit(x, y, 15, {
      colors: ['#ff6b6b', '#ff5252', '#ff3838'],
      speedMin: 3,
      speedMax: 10,
      angleMin: 0,
      angleMax: Math.PI * 2,
      life: 0.7,
      sizeMin: 2,
      sizeMax: 5
    })
  }

  // Emit death explosion
  emitDeath(x, y) {
    this.emit(x, y, 30, {
      colors: ['#ff6b6b', '#ffd93d', '#ff9f43', '#ff6348'],
      speedMin: 5,
      speedMax: 15,
      angleMin: 0,
      angleMax: Math.PI * 2,
      life: 1.2,
      sizeMin: 3,
      sizeMax: 6
    })
  }

  update(deltaTime) {
    this.particles = this.particles.filter(particle => particle.update(deltaTime))
  }

  render(ctx) {
    this.particles.forEach(particle => particle.render(ctx))
  }

  clear() {
    this.particles = []
  }
}

export default ParticleSystem
