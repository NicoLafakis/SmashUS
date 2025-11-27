class Platform {
  constructor(x, y, width, height, type = 'normal') {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.type = type
  }

  render(ctx) {
    // Pixel art platform rendering
    if (this.type === 'normal') {
      // Draw platform with pixel art style
      ctx.fillStyle = '#4a4a4a'
      ctx.fillRect(this.x, this.y, this.width, this.height)

      // Top highlight
      ctx.fillStyle = '#6a6a6a'
      ctx.fillRect(this.x, this.y, this.width, 4)

      // Pattern
      const pixelSize = 8
      ctx.fillStyle = '#5a5a5a'
      for (let px = this.x; px < this.x + this.width; px += pixelSize * 2) {
        for (let py = this.y + 4; py < this.y + this.height; py += pixelSize * 2) {
          ctx.fillRect(px, py, pixelSize, pixelSize)
        }
      }

      // Outline
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 2
      ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
  }
}

class LevelGenerator {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.platforms = []
    this.spawnPoints = []
  }

  generate() {
    this.platforms = []
    this.spawnPoints = []

    // Ground platform
    this.platforms.push(new Platform(0, this.height - 60, this.width * 3, 60, 'normal'))

    // Starting area
    this.platforms.push(new Platform(100, this.height - 160, 200, 20, 'normal'))
    this.platforms.push(new Platform(400, this.height - 220, 150, 20, 'normal'))
    this.platforms.push(new Platform(650, this.height - 180, 180, 20, 'normal'))

    // Mid section with varying heights
    let x = 900
    for (let i = 0; i < 15; i++) {
      const width = 100 + Math.random() * 150
      const height = 20
      const y = this.height - 120 - Math.random() * 200

      this.platforms.push(new Platform(x, y, width, height, 'normal'))

      // Add enemy spawn point
      if (Math.random() > 0.6) {
        this.spawnPoints.push({ x: x + width / 2, y: y - 30 })
      }

      x += width + 80 + Math.random() * 200
    }

    // Floating platforms section
    x += 100
    for (let i = 0; i < 10; i++) {
      const width = 80 + Math.random() * 100
      const height = 20
      const y = this.height - 300 - Math.sin(i * 0.5) * 100

      this.platforms.push(new Platform(x, y, width, height, 'normal'))

      if (Math.random() > 0.7) {
        this.spawnPoints.push({ x: x + width / 2, y: y - 30 })
      }

      x += width + 100 + Math.random() * 150
    }

    // Vertical tower section
    x += 200
    for (let i = 0; i < 8; i++) {
      const width = 120
      const height = 20
      const y = this.height - 100 - i * 80

      this.platforms.push(new Platform(x + (i % 2) * 200, y, width, height, 'normal'))

      if (i % 2 === 0) {
        this.spawnPoints.push({ x: x + (i % 2) * 200 + width / 2, y: y - 30 })
      }
    }

    // Descending section
    x += 400
    for (let i = 0; i < 12; i++) {
      const width = 100 + Math.random() * 120
      const height = 20
      const y = this.height - 500 + i * 40

      this.platforms.push(new Platform(x, y, width, height, 'normal'))

      if (Math.random() > 0.65) {
        this.spawnPoints.push({ x: x + width / 2, y: y - 30 })
      }

      x += width + 70 + Math.random() * 100
    }

    // Final platform
    this.platforms.push(new Platform(x, this.height - 160, 300, 20, 'normal'))
    this.platforms.push(new Platform(x + 100, this.height - 300, 100, 20, 'normal'))

    return {
      platforms: this.platforms,
      spawnPoints: this.spawnPoints
    }
  }

  render(ctx) {
    this.platforms.forEach(platform => platform.render(ctx))
  }
}

export default LevelGenerator
