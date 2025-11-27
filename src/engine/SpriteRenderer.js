class SpriteRenderer {
  constructor() {
    this.sprites = new Map()
  }

  // Generate procedural pixel art sprite
  generateSprite(type, size, colors) {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.imageSmoothingEnabled = false

    if (type === 'player') {
      this.drawPlayerSprite(ctx, size, colors)
    } else if (type === 'enemy') {
      this.drawEnemySprite(ctx, size, colors)
    } else if (type === 'particle') {
      this.drawParticleSprite(ctx, size, colors)
    }

    this.sprites.set(type, canvas)
    return canvas
  }

  drawPlayerSprite(ctx, size, colors) {
    const pixelSize = size / 16
    const pattern = [
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,2,2,1,1,1,1,2,2,1,1,0,0],
      [0,1,1,1,2,2,1,1,1,1,2,2,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,3,3,3,3,3,3,1,1,1,1,0],
      [0,0,1,1,1,3,3,3,3,3,3,1,1,1,0,0],
      [0,0,1,1,1,1,3,3,3,3,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ]

    pattern.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel > 0) {
          ctx.fillStyle = colors[pixel - 1]
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        }
      })
    })
  }

  drawEnemySprite(ctx, size, colors) {
    const pixelSize = size / 12
    const pattern = [
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,2,2,1,1,2,2,0,0],
      [0,1,1,1,2,2,1,1,2,2,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,3,3,3,3,3,3,1,1,1],
      [1,1,1,3,3,3,3,3,3,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,0,0,1,1,1,0,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ]

    pattern.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel > 0) {
          ctx.fillStyle = colors[pixel - 1]
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        }
      })
    })
  }

  drawParticleSprite(ctx, size, colors) {
    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, size, size)
  }

  getSprite(type) {
    return this.sprites.get(type)
  }

  // Draw sprite with optional effects
  drawSprite(ctx, type, x, y, scale = 1, alpha = 1, flipX = false, rotation = 0) {
    const sprite = this.getSprite(type)
    if (!sprite) return

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(x, y)

    if (rotation !== 0) {
      ctx.rotate(rotation)
    }

    if (flipX) {
      ctx.scale(-1, 1)
    }

    ctx.drawImage(
      sprite,
      -sprite.width * scale / 2,
      -sprite.height * scale / 2,
      sprite.width * scale,
      sprite.height * scale
    )

    ctx.restore()
  }
}

export default SpriteRenderer
