import * as PIXI from 'pixi.js'

/**
 * Procedural sprite generator - creates placeholder sprites when actual assets aren't available.
 * These are meant to be functional placeholders that clearly represent each entity type.
 */
export class SpriteGenerator {
  private static cache: Map<string, PIXI.Texture> = new Map()

  /**
   * Generate player sprite - John Q. Public
   * Brown hair, red flannel shirt, white undershirt, jeans
   */
  static generatePlayerSprite(): PIXI.Texture {
    const key = 'player'
    if (this.cache.has(key)) return this.cache.get(key)!

    const size = 48
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, size, size)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(24, 44, 12, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Jeans (legs)
    ctx.fillStyle = '#4466AA'
    ctx.fillRect(14, 32, 8, 12)
    ctx.fillRect(26, 32, 8, 12)

    // Shoes
    ctx.fillStyle = '#5C4033'
    ctx.fillRect(13, 42, 10, 4)
    ctx.fillRect(25, 42, 10, 4)

    // Red flannel body
    ctx.fillStyle = '#CC3333'
    ctx.fillRect(12, 18, 24, 16)

    // Flannel pattern
    ctx.fillStyle = '#992222'
    ctx.fillRect(12, 20, 24, 2)
    ctx.fillRect(12, 26, 24, 2)
    ctx.fillRect(12, 32, 24, 2)
    ctx.fillRect(16, 18, 2, 16)
    ctx.fillRect(22, 18, 2, 16)
    ctx.fillRect(28, 18, 2, 16)

    // White undershirt V
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.moveTo(20, 18)
    ctx.lineTo(24, 24)
    ctx.lineTo(28, 18)
    ctx.closePath()
    ctx.fill()

    // Arms
    ctx.fillStyle = '#CC3333'
    ctx.fillRect(6, 20, 6, 12)
    ctx.fillRect(36, 20, 6, 12)

    // Hands
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(6, 30, 6, 4)
    ctx.fillRect(36, 30, 6, 4)

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(16, 4, 16, 14)

    // Brown hair
    ctx.fillStyle = '#6B4423'
    ctx.fillRect(14, 2, 20, 6)
    ctx.fillRect(14, 2, 4, 10)
    ctx.fillRect(30, 2, 4, 10)

    // Eyes
    ctx.fillStyle = '#333333'
    ctx.fillRect(19, 9, 3, 3)
    ctx.fillRect(26, 9, 3, 3)

    // Mouth
    ctx.fillStyle = '#CC8866'
    ctx.fillRect(22, 14, 4, 2)

    // Outline
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 1
    ctx.strokeRect(12, 18, 24, 16)
    ctx.strokeRect(16, 4, 16, 14)

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  static generateEnemySprite(type: string): PIXI.Texture {
    const key = `enemy_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    switch (type) {
      case 'intern':
        this.drawIntern(canvas, ctx)
        break
      case 'bureaucrat':
        this.drawBureaucrat(canvas, ctx)
        break
      case 'irs_agent':
        this.drawIRSAgent(canvas, ctx)
        break
      case 'secret_service':
        this.drawSecretService(canvas, ctx)
        break
      case 'lobbyist':
        this.drawLobbyist(canvas, ctx)
        break
      default:
        canvas.width = 48
        canvas.height = 48
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(8, 8, 32, 32)
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  private static drawIntern(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 40
    canvas.height = 48
    ctx.clearRect(0, 0, 40, 48)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(20, 44, 10, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Running legs
    ctx.fillStyle = '#333333'
    ctx.fillRect(10, 32, 6, 12)
    ctx.fillRect(24, 32, 6, 12)

    // Shoes
    ctx.fillStyle = '#222222'
    ctx.fillRect(8, 42, 8, 4)
    ctx.fillRect(24, 42, 8, 4)

    // Gray suit body
    ctx.fillStyle = '#555555'
    ctx.fillRect(10, 18, 20, 16)

    // White shirt
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(14, 18, 12, 10)

    // Red tie
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(18, 18, 4, 14)

    // Arms
    ctx.fillStyle = '#555555'
    ctx.fillRect(4, 18, 6, 10)
    ctx.fillRect(30, 22, 6, 10)

    // Hands
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(4, 26, 5, 4)
    ctx.fillRect(30, 30, 5, 4)

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(12, 4, 16, 14)

    // Hair
    ctx.fillStyle = '#333333'
    ctx.fillRect(12, 2, 16, 5)

    // Eyes
    ctx.fillStyle = '#333333'
    ctx.fillRect(15, 9, 3, 2)
    ctx.fillRect(22, 9, 3, 2)

    // Mouth
    ctx.fillStyle = '#CC8866'
    ctx.fillRect(18, 13, 4, 2)

    // Outline
    ctx.strokeStyle = '#222222'
    ctx.strokeRect(10, 18, 20, 16)
  }

  private static drawBureaucrat(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 56
    canvas.height = 56
    ctx.clearRect(0, 0, 56, 56)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(28, 52, 14, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.fillStyle = '#333333'
    ctx.fillRect(14, 38, 10, 14)
    ctx.fillRect(32, 38, 10, 14)

    // Shoes
    ctx.fillStyle = '#222222'
    ctx.fillRect(12, 50, 12, 4)
    ctx.fillRect(32, 50, 12, 4)

    // Navy suit body
    ctx.fillStyle = '#2A3A5A'
    ctx.fillRect(10, 18, 36, 22)

    // White shirt
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(20, 18, 16, 14)

    // Tie
    ctx.fillStyle = '#1A1A3A'
    ctx.fillRect(26, 18, 4, 16)

    // Arms with papers
    ctx.fillStyle = '#2A3A5A'
    ctx.fillRect(4, 22, 8, 14)
    ctx.fillRect(44, 22, 8, 14)

    // Papers
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 24, 10, 12)
    ctx.fillRect(46, 24, 10, 12)
    ctx.fillStyle = '#AAAAAA'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(1, 26 + i * 3, 8, 1)
      ctx.fillRect(47, 26 + i * 3, 8, 1)
    }

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(14, 2, 28, 16)

    // Gray hair (balding)
    ctx.fillStyle = '#888888'
    ctx.fillRect(14, 2, 6, 4)
    ctx.fillRect(36, 2, 6, 4)
    ctx.fillRect(14, 2, 28, 2)

    // Glasses
    ctx.fillStyle = '#333333'
    ctx.fillRect(16, 8, 8, 6)
    ctx.fillRect(32, 8, 8, 6)
    ctx.fillRect(24, 10, 8, 2)
    ctx.fillStyle = '#88AACC'
    ctx.fillRect(17, 9, 6, 4)
    ctx.fillRect(33, 9, 6, 4)

    // Frown
    ctx.fillStyle = '#CC8866'
    ctx.fillRect(24, 14, 8, 2)

    // Outline
    ctx.strokeStyle = '#222222'
    ctx.strokeRect(10, 18, 36, 22)
  }

  private static drawIRSAgent(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 48
    canvas.height = 48
    ctx.clearRect(0, 0, 48, 48)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(24, 44, 10, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(14, 32, 8, 12)
    ctx.fillRect(26, 32, 8, 12)

    // Shoes
    ctx.fillStyle = '#111111'
    ctx.fillRect(13, 42, 10, 4)
    ctx.fillRect(25, 42, 10, 4)

    // Dark suit
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(12, 18, 24, 16)

    // White shirt
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(18, 18, 12, 8)

    // Red tie
    ctx.fillStyle = '#AA0000'
    ctx.fillRect(22, 18, 4, 12)

    // Arms
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(6, 20, 6, 10)
    ctx.fillRect(36, 20, 6, 10)

    // Clipboard
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(36, 26, 8, 10)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(37, 27, 6, 8)

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(16, 4, 16, 14)

    // Hair
    ctx.fillStyle = '#222222'
    ctx.fillRect(16, 2, 16, 5)
    ctx.fillRect(14, 4, 4, 4)
    ctx.fillRect(30, 4, 4, 4)

    // Glasses
    ctx.fillStyle = '#333333'
    ctx.fillRect(17, 8, 6, 4)
    ctx.fillRect(25, 8, 6, 4)
    ctx.fillRect(23, 9, 2, 2)
    ctx.fillStyle = '#444466'
    ctx.fillRect(18, 9, 4, 2)
    ctx.fillRect(26, 9, 4, 2)

    // Stern mouth
    ctx.fillStyle = '#CC8866'
    ctx.fillRect(21, 14, 6, 1)

    // Outline
    ctx.strokeStyle = '#111111'
    ctx.strokeRect(12, 18, 24, 16)
  }

  private static drawSecretService(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 48
    canvas.height = 48
    ctx.clearRect(0, 0, 48, 48)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(24, 44, 10, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.fillStyle = '#000000'
    ctx.fillRect(14, 32, 8, 12)
    ctx.fillRect(26, 32, 8, 12)

    // Shoes
    ctx.fillStyle = '#111111'
    ctx.fillRect(13, 42, 10, 4)
    ctx.fillRect(25, 42, 10, 4)

    // Black suit
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(12, 18, 24, 16)

    // White collar
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(20, 18, 8, 3)

    // Arms
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(6, 20, 6, 12)
    ctx.fillRect(36, 20, 6, 12)

    // Gun
    ctx.fillStyle = '#333333'
    ctx.fillRect(36, 24, 10, 6)
    ctx.fillStyle = '#222222'
    ctx.fillRect(44, 25, 4, 4)

    // Hand
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(6, 30, 5, 4)

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(16, 4, 16, 14)

    // Short hair
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(16, 2, 16, 4)

    // Sunglasses
    ctx.fillStyle = '#000000'
    ctx.fillRect(16, 8, 16, 4)
    ctx.fillStyle = '#1A1A3A'
    ctx.fillRect(17, 9, 6, 2)
    ctx.fillRect(25, 9, 6, 2)

    // Earpiece
    ctx.fillStyle = '#333333'
    ctx.fillRect(32, 10, 4, 6)
    ctx.fillStyle = '#222222'
    ctx.fillRect(34, 14, 2, 6)

    // Mouth
    ctx.fillStyle = '#CC8866'
    ctx.fillRect(22, 14, 4, 1)

    // Outline
    ctx.strokeStyle = '#000000'
    ctx.strokeRect(12, 18, 24, 16)
  }

  private static drawLobbyist(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 48
    canvas.height = 52
    ctx.clearRect(0, 0, 48, 52)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(24, 48, 10, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.fillStyle = '#3A3A2A'
    ctx.fillRect(14, 34, 8, 14)
    ctx.fillRect(26, 34, 8, 14)

    // Shoes
    ctx.fillStyle = '#4A3A2A'
    ctx.fillRect(13, 46, 10, 4)
    ctx.fillRect(25, 46, 10, 4)

    // Brown suit
    ctx.fillStyle = '#8B7355'
    ctx.fillRect(12, 18, 24, 18)

    // White shirt
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(18, 18, 12, 10)

    // Power tie
    ctx.fillStyle = '#AA2222'
    ctx.fillRect(22, 18, 4, 14)

    // Arms
    ctx.fillStyle = '#8B7355'
    ctx.fillRect(6, 20, 6, 12)
    ctx.fillRect(36, 20, 6, 12)

    // Money
    ctx.fillStyle = '#228822'
    ctx.fillRect(36, 26, 8, 6)
    ctx.fillStyle = '#44AA44'
    ctx.fillRect(37, 27, 6, 4)

    // Coins
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(40, 36, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(36, 42, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(42, 44, 3, 0, Math.PI * 2)
    ctx.fill()

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(16, 4, 16, 14)

    // Balding hair
    ctx.fillStyle = '#6A5A4A'
    ctx.fillRect(16, 2, 16, 3)
    ctx.fillRect(14, 4, 4, 6)
    ctx.fillRect(30, 4, 4, 6)

    // Eyes
    ctx.fillStyle = '#333333'
    ctx.fillRect(18, 9, 4, 2)
    ctx.fillRect(26, 9, 4, 2)

    // Smirk
    ctx.fillStyle = '#CC8866'
    ctx.fillRect(20, 14, 8, 2)

    // Outline
    ctx.strokeStyle = '#222222'
    ctx.strokeRect(12, 18, 24, 18)
  }

  static generateProjectileSprite(type: string): PIXI.Texture {
    const key = `projectile_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    switch (type) {
      case 'wrench':
        canvas.width = 24
        canvas.height = 24
        ctx.fillStyle = '#888888'
        ctx.fillRect(4, 10, 16, 4)
        ctx.fillStyle = '#666666'
        ctx.fillRect(0, 7, 6, 10)
        ctx.fillRect(18, 8, 6, 8)
        ctx.fillStyle = '#AAAAAA'
        ctx.fillRect(1, 8, 4, 8)
        break

      case 'pistol':
        canvas.width = 10
        canvas.height = 10
        ctx.fillStyle = '#FFFF00'
        ctx.beginPath()
        ctx.arc(5, 5, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(4, 4, 2, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'shotgun':
        canvas.width = 8
        canvas.height = 8
        ctx.fillStyle = '#FF8800'
        ctx.beginPath()
        ctx.arc(4, 4, 3, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'rapidfire':
        canvas.width = 8
        canvas.height = 8
        ctx.fillStyle = '#00FFFF'
        ctx.beginPath()
        ctx.arc(4, 4, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(4, 4, 1, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'laser':
        canvas.width = 32
        canvas.height = 8
        const gradient = ctx.createLinearGradient(0, 0, 32, 0)
        gradient.addColorStop(0, '#FF00FF')
        gradient.addColorStop(0.5, '#FFFFFF')
        gradient.addColorStop(1, '#FF00FF')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 1, 32, 6)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 3, 32, 2)
        break

      case 'spread':
        canvas.width = 10
        canvas.height = 10
        ctx.fillStyle = '#00FF00'
        ctx.beginPath()
        ctx.arc(5, 5, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#88FF88'
        ctx.beginPath()
        ctx.arc(4, 4, 2, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'paperwork':
        canvas.width = 16
        canvas.height = 16
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(2, 2, 12, 12)
        ctx.fillStyle = '#CCCCCC'
        ctx.fillRect(4, 4, 8, 1)
        ctx.fillRect(4, 6, 6, 1)
        ctx.fillRect(4, 8, 8, 1)
        ctx.fillRect(4, 10, 5, 1)
        ctx.strokeStyle = '#999999'
        ctx.strokeRect(2, 2, 12, 12)
        break

      case 'audit_beam':
        canvas.width = 32
        canvas.height = 8
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(0, 0, 32, 8)
        ctx.fillStyle = '#FFFF00'
        ctx.fillRect(0, 2, 32, 4)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 3, 32, 2)
        break

      case 'enemy_pistol':
        canvas.width = 8
        canvas.height = 8
        ctx.fillStyle = '#FF4444'
        ctx.beginPath()
        ctx.arc(4, 4, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FF8888'
        ctx.beginPath()
        ctx.arc(3, 3, 1, 0, Math.PI * 2)
        ctx.fill()
        break

      default:
        canvas.width = 8
        canvas.height = 8
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(4, 4, 3, 0, Math.PI * 2)
        ctx.fill()
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  static generatePickupSprite(type: string): PIXI.Texture {
    const key = `pickup_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const size = 24
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, size, size)

    switch (type) {
      case 'tax_refund_small':
        ctx.fillStyle = '#228822'
        ctx.fillRect(4, 8, 16, 10)
        ctx.fillStyle = '#44AA44'
        ctx.fillRect(5, 9, 14, 8)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 10px Arial'
        ctx.fillText('$', 9, 17)
        break

      case 'tax_refund_large':
        ctx.fillStyle = '#228822'
        ctx.fillRect(2, 6, 20, 14)
        ctx.fillStyle = '#44AA44'
        ctx.fillRect(3, 7, 18, 12)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 8px Arial'
        ctx.fillText('$$$', 5, 15)
        ctx.fillStyle = '#116611'
        ctx.fillRect(4, 18, 16, 2)
        break

      case 'health':
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(9, 4, 6, 16)
        ctx.fillRect(4, 9, 16, 6)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(10, 5, 4, 14)
        ctx.fillRect(5, 10, 14, 4)
        break

      case 'damage_boost':
        ctx.fillStyle = '#FF8800'
        ctx.beginPath()
        ctx.moveTo(12, 2)
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8 - Math.PI / 2
          const r = i % 2 === 0 ? 10 : 5
          ctx.lineTo(12 + Math.cos(angle) * r, 12 + Math.sin(angle) * r)
        }
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#FFCC00'
        ctx.beginPath()
        ctx.arc(12, 12, 4, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'spread_boost':
        ctx.fillStyle = '#00AAFF'
        ctx.beginPath()
        ctx.moveTo(12, 4)
        ctx.lineTo(8, 12)
        ctx.lineTo(16, 12)
        ctx.closePath()
        ctx.fill()
        ctx.fillRect(10, 12, 4, 8)
        ctx.fillRect(4, 10, 3, 10)
        ctx.fillRect(17, 10, 3, 10)
        break

      case 'shield':
        ctx.fillStyle = '#4488FF'
        ctx.beginPath()
        ctx.moveTo(12, 2)
        ctx.lineTo(20, 6)
        ctx.lineTo(20, 14)
        ctx.lineTo(12, 22)
        ctx.lineTo(4, 14)
        ctx.lineTo(4, 6)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#88AAFF'
        ctx.beginPath()
        ctx.moveTo(12, 5)
        ctx.lineTo(17, 8)
        ctx.lineTo(17, 13)
        ctx.lineTo(12, 19)
        ctx.lineTo(7, 13)
        ctx.lineTo(7, 8)
        ctx.closePath()
        ctx.fill()
        break

      case 'extra_life':
        ctx.fillStyle = '#FF4488'
        ctx.beginPath()
        ctx.moveTo(12, 20)
        ctx.bezierCurveTo(4, 14, 4, 6, 12, 10)
        ctx.bezierCurveTo(20, 6, 20, 14, 12, 20)
        ctx.fill()
        ctx.fillStyle = '#FF88AA'
        ctx.beginPath()
        ctx.arc(8, 8, 2, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'weapon_pistol':
      case 'weapon_shotgun':
      case 'weapon_rapidfire':
      case 'weapon_laser':
      case 'weapon_spread':
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(2, 6, 20, 14)
        ctx.fillStyle = '#A0522D'
        ctx.fillRect(4, 8, 16, 10)
        ctx.strokeStyle = '#6B3503'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(2, 10)
        ctx.lineTo(22, 10)
        ctx.moveTo(2, 16)
        ctx.lineTo(22, 16)
        ctx.stroke()
        ctx.fillStyle = '#FFFF00'
        ctx.font = 'bold 10px Arial'
        ctx.fillText('W', 8, 16)
        break

      default:
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(4, 4, 16, 16)
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  static clearCache(): void {
    this.cache.forEach((texture) => texture.destroy(true))
    this.cache.clear()
  }
}
