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
      case 'camera_drone':
        this.drawCameraDrone(canvas, ctx)
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

  private static drawCameraDrone(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 40
    canvas.height = 36
    ctx.clearRect(0, 0, 40, 36)

    // Propeller blur effect (top)
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'
    ctx.beginPath()
    ctx.ellipse(10, 6, 8, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(30, 6, 8, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Propeller arms
    ctx.fillStyle = '#444444'
    ctx.fillRect(6, 8, 8, 3)
    ctx.fillRect(26, 8, 8, 3)

    // Main drone body
    ctx.fillStyle = '#333333'
    ctx.fillRect(12, 10, 16, 14)

    // Body details
    ctx.fillStyle = '#555555'
    ctx.fillRect(14, 12, 12, 10)

    // Camera lens (front)
    ctx.fillStyle = '#111111'
    ctx.beginPath()
    ctx.arc(20, 28, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2244AA'
    ctx.beginPath()
    ctx.arc(20, 28, 4, 0, Math.PI * 2)
    ctx.fill()
    // Lens reflection
    ctx.fillStyle = '#88AAFF'
    ctx.beginPath()
    ctx.arc(18, 26, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // LED indicator lights
    ctx.fillStyle = '#FF0000'
    ctx.beginPath()
    ctx.arc(14, 14, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#00FF00'
    ctx.beginPath()
    ctx.arc(26, 14, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Propeller hubs
    ctx.fillStyle = '#222222'
    ctx.beginPath()
    ctx.arc(10, 8, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(30, 8, 3, 0, Math.PI * 2)
    ctx.fill()

    // Landing skids
    ctx.fillStyle = '#333333'
    ctx.fillRect(8, 32, 4, 3)
    ctx.fillRect(28, 32, 4, 3)
    ctx.fillRect(6, 33, 8, 2)
    ctx.fillRect(26, 33, 8, 2)

    // Outline
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 1
    ctx.strokeRect(12, 10, 16, 14)
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

      // Boss projectile types
      case 'audit_beam':
        canvas.width = 200
        canvas.height = 12
        const auditGradient = ctx.createLinearGradient(0, 0, 200, 0)
        auditGradient.addColorStop(0, 'rgba(255,0,0,0)')
        auditGradient.addColorStop(0.1, '#FF0000')
        auditGradient.addColorStop(0.5, '#FFFF00')
        auditGradient.addColorStop(0.9, '#FF0000')
        auditGradient.addColorStop(1, 'rgba(255,0,0,0)')
        ctx.fillStyle = auditGradient
        ctx.fillRect(0, 0, 200, 12)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 4, 200, 4)
        break

      case 'paper_storm':
        canvas.width = 16
        canvas.height = 16
        // Spinning paper
        ctx.fillStyle = '#FFFFFF'
        ctx.save()
        ctx.translate(8, 8)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(-6, -8, 12, 16)
        ctx.restore()
        ctx.fillStyle = '#AAAAAA'
        ctx.fillRect(4, 4, 8, 1)
        ctx.fillRect(4, 7, 6, 1)
        ctx.fillRect(4, 10, 8, 1)
        break

      case 'legislation':
        canvas.width = 18
        canvas.height = 18
        // Rolled up bill/scroll
        ctx.fillStyle = '#F5DEB3'
        ctx.fillRect(2, 4, 14, 10)
        ctx.fillStyle = '#DEB887'
        ctx.beginPath()
        ctx.arc(2, 9, 5, Math.PI / 2, -Math.PI / 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(16, 9, 5, -Math.PI / 2, Math.PI / 2)
        ctx.fill()
        ctx.fillStyle = '#333333'
        ctx.fillRect(4, 6, 10, 1)
        ctx.fillRect(4, 9, 8, 1)
        ctx.fillRect(4, 12, 10, 1)
        break

      case 'gavel_shockwave':
        canvas.width = 32
        canvas.height = 32
        ctx.strokeStyle = '#8B4513'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(16, 16, 12, 0, Math.PI * 2)
        ctx.stroke()
        ctx.strokeStyle = '#A0522D'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(16, 16, 8, 0, Math.PI * 2)
        ctx.stroke()
        break

      case 'tie_breaker_beam':
        canvas.width = 250
        canvas.height = 16
        const tieGradient = ctx.createLinearGradient(0, 0, 250, 0)
        tieGradient.addColorStop(0, 'rgba(0,0,255,0)')
        tieGradient.addColorStop(0.1, '#0000FF')
        tieGradient.addColorStop(0.5, '#00FFFF')
        tieGradient.addColorStop(0.9, '#0000FF')
        tieGradient.addColorStop(1, 'rgba(0,0,255,0)')
        ctx.fillStyle = tieGradient
        ctx.fillRect(0, 0, 250, 16)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 6, 250, 4)
        break

      case 'debate_pulse':
        canvas.width = 48
        canvas.height = 48
        ctx.fillStyle = 'rgba(128, 0, 128, 0.5)'
        ctx.beginPath()
        ctx.arc(24, 24, 22, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#FF00FF'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(24, 24, 20, 0, Math.PI * 2)
        ctx.stroke()
        break

      case 'executive_order':
        canvas.width = 64
        canvas.height = 64
        // Danger zone indicator
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
        ctx.fillRect(0, 0, 64, 64)
        ctx.strokeStyle = '#FF0000'
        ctx.lineWidth = 3
        ctx.setLineDash([8, 4])
        ctx.strokeRect(2, 2, 60, 60)
        ctx.fillStyle = '#FF0000'
        ctx.font = 'bold 12px Arial'
        ctx.fillText('!', 28, 38)
        break

      case 'veto_barrier':
        canvas.width = 48
        canvas.height = 64
        // Reflective shield
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)'
        ctx.beginPath()
        ctx.moveTo(24, 0)
        ctx.lineTo(48, 16)
        ctx.lineTo(48, 48)
        ctx.lineTo(24, 64)
        ctx.lineTo(0, 48)
        ctx.lineTo(0, 16)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 16px Arial'
        ctx.fillText('V', 18, 38)
        break

      case 'drone_shot':
        canvas.width = 10
        canvas.height = 10
        ctx.fillStyle = '#FF00FF'
        ctx.beginPath()
        ctx.arc(5, 5, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(4, 4, 1, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'airstrike_reticle':
        canvas.width = 48
        canvas.height = 48
        ctx.strokeStyle = '#FF0000'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(24, 24, 20, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(24, 24, 12, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(24, 0)
        ctx.lineTo(24, 48)
        ctx.moveTo(0, 24)
        ctx.lineTo(48, 24)
        ctx.stroke()
        break

      case 'secret_service_shot':
        canvas.width = 10
        canvas.height = 10
        ctx.fillStyle = '#333333'
        ctx.beginPath()
        ctx.arc(5, 5, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#666666'
        ctx.beginPath()
        ctx.arc(4, 4, 2, 0, Math.PI * 2)
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

  /**
   * Generate boss sprite based on boss type
   * Bosses are larger and more detailed than regular enemies
   *
   * Boss types and their names:
   * - irs_commissioner: "Harold Pemberton" (80x80)
   * - senator / senator_navy: "Senator Richard Thornwood" (64x64)
   * - senator_charcoal: "Senator James Caldwell" (64x64)
   * - speaker: "Speaker Margaret Morrison" (72x72)
   * - vice_president: "Vice President Thomas Hartley" (64x64)
   * - president: "President William J. Maxwell" (80x80)
   */
  static generateBossSprite(type: string): PIXI.Texture {
    const key = `boss_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    switch (type) {
      case 'irs_commissioner':
        this.drawIRSCommissioner(canvas, ctx)
        break
      case 'senator':
      case 'senator_navy':
        this.drawSenator(canvas, ctx, 'navy')
        break
      case 'senator_charcoal':
        this.drawSenator(canvas, ctx, 'charcoal')
        break
      case 'speaker':
        this.drawSpeaker(canvas, ctx)
        break
      case 'vice_president':
        this.drawVicePresident(canvas, ctx)
        break
      case 'president':
        this.drawPresident(canvas, ctx)
        break
      default:
        // Default boss placeholder
        canvas.width = 80
        canvas.height = 80
        ctx.fillStyle = '#AA0000'
        ctx.fillRect(10, 10, 60, 60)
        ctx.fillStyle = '#FF0000'
        ctx.font = 'bold 16px Arial'
        ctx.fillText('BOSS', 18, 45)
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  /**
   * IRS Commissioner - "Harold Pemberton"
   * Large, heavy-set man with rolled sleeves, loose tie, sweating profusely
   * Red-faced from stress, intimidating presence - The ultimate tax collector
   */
  private static drawIRSCommissioner(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 80
    canvas.height = 80
    ctx.clearRect(0, 0, 80, 80)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.ellipse(40, 76, 22, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs - heavy set
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(22, 52, 14, 24)
    ctx.fillRect(44, 52, 14, 24)

    // Shoes
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(20, 72, 16, 6)
    ctx.fillRect(44, 72, 16, 6)

    // Body - White dress shirt (no jacket, sleeves rolled)
    ctx.fillStyle = '#F0F0F0'
    ctx.fillRect(14, 24, 52, 32)

    // Rolled up sleeves - exposed forearms
    ctx.fillStyle = '#FFAA88' // Reddish skin tone (stressed)
    ctx.fillRect(8, 32, 8, 16)
    ctx.fillRect(64, 32, 8, 16)

    // Shirt wrinkles/details
    ctx.fillStyle = '#DDDDDD'
    ctx.fillRect(20, 28, 2, 24)
    ctx.fillRect(58, 28, 2, 24)

    // Loose tie - askew and disheveled
    ctx.fillStyle = '#CC0000'
    ctx.beginPath()
    ctx.moveTo(38, 24)
    ctx.lineTo(44, 24)
    ctx.lineTo(46, 54)
    ctx.lineTo(40, 56)
    ctx.lineTo(36, 54)
    ctx.closePath()
    ctx.fill()
    // Tie knot - loose
    ctx.fillStyle = '#990000'
    ctx.fillRect(37, 22, 8, 6)

    // Suspenders
    ctx.fillStyle = '#333333'
    ctx.fillRect(24, 24, 4, 28)
    ctx.fillRect(52, 24, 4, 28)

    // Hands - meaty
    ctx.fillStyle = '#FFAA88'
    ctx.fillRect(6, 44, 10, 8)
    ctx.fillRect(64, 44, 10, 8)

    // Clipboard (right hand)
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(68, 38, 10, 14)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(69, 40, 8, 10)
    ctx.fillStyle = '#AA0000'
    ctx.fillRect(70, 42, 6, 1)
    ctx.fillRect(70, 44, 6, 1)
    ctx.fillRect(70, 46, 6, 1)

    // Head - red/flushed face (stressed)
    ctx.fillStyle = '#FFAA88'
    ctx.fillRect(24, 2, 32, 24)

    // Bald top with side hair
    ctx.fillStyle = '#666666'
    ctx.fillRect(22, 8, 6, 10)
    ctx.fillRect(52, 8, 6, 10)

    // Furrowed brow
    ctx.fillStyle = '#FF9977'
    ctx.fillRect(28, 6, 24, 4)

    // Glasses - stern
    ctx.fillStyle = '#222222'
    ctx.fillRect(26, 10, 10, 6)
    ctx.fillRect(44, 10, 10, 6)
    ctx.fillRect(36, 12, 8, 2)
    ctx.fillStyle = '#4466AA'
    ctx.fillRect(27, 11, 8, 4)
    ctx.fillRect(45, 11, 8, 4)

    // Angry eyebrows
    ctx.fillStyle = '#444444'
    ctx.beginPath()
    ctx.moveTo(26, 10)
    ctx.lineTo(36, 8)
    ctx.lineTo(36, 9)
    ctx.lineTo(26, 11)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(54, 10)
    ctx.lineTo(44, 8)
    ctx.lineTo(44, 9)
    ctx.lineTo(54, 11)
    ctx.fill()

    // Frown
    ctx.fillStyle = '#CC7766'
    ctx.fillRect(34, 20, 12, 3)

    // Sweat drops
    ctx.fillStyle = '#88CCFF'
    ctx.beginPath()
    ctx.ellipse(22, 12, 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(58, 14, 2, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(20, 20, 2, 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Double chin
    ctx.fillStyle = '#FF9988'
    ctx.fillRect(32, 24, 16, 4)

    // Outline
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 2
    ctx.strokeRect(14, 24, 52, 32)
  }

  /**
   * Senator - "Senator Richard Thornwood" (navy) / "Senator James Caldwell" (charcoal)
   * Slick politician with American flag pin, expensive suit, confident stance
   */
  private static drawSenator(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, variant: 'navy' | 'charcoal' = 'navy'): void {
    canvas.width = 64
    canvas.height = 64
    ctx.clearRect(0, 0, 64, 64)

    // Color variants
    const suitColor = variant === 'navy' ? '#1A2A4A' : '#3A3A3A'
    const suitLight = variant === 'navy' ? '#2A3A5A' : '#4A4A4A'
    const tieColor = variant === 'navy' ? '#CC2222' : '#1A4A8A'

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.ellipse(32, 61, 16, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.fillStyle = suitColor
    ctx.fillRect(18, 42, 10, 18)
    ctx.fillRect(36, 42, 10, 18)

    // Shoes - expensive
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(16, 58, 12, 5)
    ctx.fillRect(36, 58, 12, 5)

    // Expensive suit body
    ctx.fillStyle = suitColor
    ctx.fillRect(12, 20, 40, 26)

    // Suit lapels
    ctx.fillStyle = suitLight
    ctx.beginPath()
    ctx.moveTo(12, 20)
    ctx.lineTo(24, 20)
    ctx.lineTo(28, 36)
    ctx.lineTo(12, 36)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(52, 20)
    ctx.lineTo(40, 20)
    ctx.lineTo(36, 36)
    ctx.lineTo(52, 36)
    ctx.fill()

    // White shirt
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(26, 20, 12, 14)

    // Tie
    ctx.fillStyle = tieColor
    ctx.fillRect(30, 20, 4, 20)

    // Arms - confident pose
    ctx.fillStyle = suitColor
    ctx.fillRect(4, 22, 10, 18)
    ctx.fillRect(50, 22, 10, 18)

    // Pointing hand (right)
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(54, 18, 8, 6)
    ctx.fillRect(60, 20, 4, 2) // Pointing finger

    // Hand with papers (left)
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(2, 36, 8, 6)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 30, 8, 10)
    ctx.fillStyle = '#AAAAAA'
    ctx.fillRect(1, 32, 6, 1)
    ctx.fillRect(1, 35, 6, 1)

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(20, 2, 24, 20)

    // Distinguished gray/white hair
    ctx.fillStyle = '#888888'
    ctx.fillRect(18, 0, 28, 5)
    ctx.fillRect(16, 2, 6, 8)
    ctx.fillRect(42, 2, 6, 8)

    // Eyes - confident
    ctx.fillStyle = '#333333'
    ctx.fillRect(24, 9, 3, 2)
    ctx.fillRect(37, 9, 3, 2)

    // Politician smile - big white teeth
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(28, 15, 8, 3)
    ctx.strokeStyle = '#CC8866'
    ctx.lineWidth = 1
    ctx.strokeRect(28, 15, 8, 3)

    // American flag pin on lapel
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(14, 24, 5, 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(14, 26, 5, 1)
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(14, 27, 5, 1)
    ctx.fillStyle = '#0000AA'
    ctx.fillRect(14, 24, 2, 4)
    // Stars (tiny dots)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(14, 24, 1, 1)
    ctx.fillRect(15, 25, 1, 1)

    // Outline
    ctx.strokeStyle = '#111122'
    ctx.lineWidth = 1
    ctx.strokeRect(12, 20, 40, 26)
  }

  /**
   * Speaker of the House - "Speaker Margaret Morrison"
   * Standing at podium with gavel raised, formal attire, commanding presence
   */
  private static drawSpeaker(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 72
    canvas.height = 72
    ctx.clearRect(0, 0, 72, 72)

    // Podium
    ctx.fillStyle = '#5C3317'
    ctx.fillRect(12, 38, 48, 32)
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(15, 41, 42, 26)
    // Podium seal - House of Representatives
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(36, 54, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0000AA'
    ctx.beginPath()
    ctx.arc(36, 54, 7, 0, Math.PI * 2)
    ctx.fill()
    // Eagle silhouette
    ctx.fillStyle = '#FFD700'
    ctx.fillRect(33, 52, 6, 2)
    ctx.fillRect(35, 50, 2, 6)

    // Body behind podium
    ctx.fillStyle = '#2A3A5A'
    ctx.fillRect(22, 20, 28, 22)

    // White shirt/blouse
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(30, 20, 12, 12)

    // Formal tie/accessory
    ctx.fillStyle = '#8B0000'
    ctx.fillRect(34, 20, 4, 16)

    // Arms on podium
    ctx.fillStyle = '#2A3A5A'
    ctx.fillRect(12, 30, 12, 10)
    ctx.fillRect(48, 30, 12, 10)

    // Hands
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(12, 36, 10, 5)
    ctx.fillRect(50, 36, 10, 5)

    // Gavel raised in right hand
    ctx.fillStyle = '#5C3317'
    ctx.fillRect(58, 20, 5, 18)
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(55, 16, 11, 6)
    // Gavel head highlight
    ctx.fillStyle = '#A0522D'
    ctx.fillRect(56, 17, 9, 4)

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(24, 2, 24, 20)

    // Hair - styled
    ctx.fillStyle = '#4A3A2A'
    ctx.fillRect(22, 0, 28, 5)
    ctx.fillRect(20, 2, 6, 10)
    ctx.fillRect(46, 2, 6, 10)
    // Hair wave detail
    ctx.fillStyle = '#5A4A3A'
    ctx.fillRect(24, 1, 8, 3)
    ctx.fillRect(40, 1, 8, 3)

    // Glasses
    ctx.fillStyle = '#333333'
    ctx.fillRect(26, 8, 8, 5)
    ctx.fillRect(38, 8, 8, 5)
    ctx.fillRect(34, 9, 4, 2)
    ctx.fillStyle = '#88AACC'
    ctx.fillRect(27, 9, 6, 3)
    ctx.fillRect(39, 9, 6, 3)

    // Stern/authoritative expression
    ctx.fillStyle = '#CC8866'
    ctx.fillRect(32, 16, 8, 2)

    // Outline
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 2
    ctx.strokeRect(12, 38, 48, 32)
  }

  /**
   * Vice President - "Vice President Thomas Hartley"
   * Professional suit, standing pose with subtle authority symbols
   */
  private static drawVicePresident(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 64
    canvas.height = 64
    ctx.clearRect(0, 0, 64, 64)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.ellipse(32, 61, 16, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.fillStyle = '#1A1A2A'
    ctx.fillRect(18, 42, 10, 18)
    ctx.fillRect(36, 42, 10, 18)

    // Shoes
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(16, 58, 12, 5)
    ctx.fillRect(36, 58, 12, 5)

    // Dark formal suit
    ctx.fillStyle = '#1A1A2A'
    ctx.fillRect(12, 20, 40, 26)

    // Suit lapels
    ctx.fillStyle = '#252535'
    ctx.beginPath()
    ctx.moveTo(12, 20)
    ctx.lineTo(22, 20)
    ctx.lineTo(26, 34)
    ctx.lineTo(12, 34)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(52, 20)
    ctx.lineTo(42, 20)
    ctx.lineTo(38, 34)
    ctx.lineTo(52, 34)
    ctx.fill()

    // White shirt
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(26, 20, 12, 14)

    // Blue tie
    ctx.fillStyle = '#1A3A6A'
    ctx.fillRect(30, 20, 4, 20)

    // Arms - professional stance
    ctx.fillStyle = '#1A1A2A'
    ctx.fillRect(4, 22, 10, 18)
    ctx.fillRect(50, 22, 10, 18)

    // Hands
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(4, 36, 8, 6)
    ctx.fillRect(52, 36, 8, 6)

    // Head
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(20, 2, 24, 20)

    // White/silver hair - distinguished
    ctx.fillStyle = '#CCCCCC'
    ctx.fillRect(18, 0, 28, 5)
    ctx.fillRect(16, 2, 6, 8)
    ctx.fillRect(42, 2, 6, 8)

    // Eyes
    ctx.fillStyle = '#333333'
    ctx.fillRect(24, 9, 3, 2)
    ctx.fillRect(37, 9, 3, 2)

    // Confident smile
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(28, 16, 8, 3)
    ctx.strokeStyle = '#CC8866'
    ctx.lineWidth = 1
    ctx.strokeRect(28, 16, 8, 3)

    // VP seal pin on lapel
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(16, 26, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0000AA'
    ctx.beginPath()
    ctx.arc(16, 26, 2, 0, Math.PI * 2)
    ctx.fill()
    // Eagle detail
    ctx.fillStyle = '#FFD700'
    ctx.fillRect(14, 26, 4, 1)

    // Outline
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 1
    ctx.strokeRect(12, 20, 40, 26)
  }

  /**
   * President - "President William J. Maxwell"
   * The final boss - dark suit, red tie, gray hair, most imposing of all
   * Behind podium with American flags, presidential seal
   */
  private static drawPresident(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    canvas.width = 80
    canvas.height = 80
    ctx.clearRect(0, 0, 80, 80)

    // American flags on sides (behind everything)
    // Left flag
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(2, 4, 3, 40)
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(5, 4, 10, 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(5, 6, 10, 2)
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(5, 8, 10, 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(5, 10, 10, 2)
    ctx.fillStyle = '#0000AA'
    ctx.fillRect(5, 4, 4, 8)
    // Right flag
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(75, 4, 3, 40)
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(65, 4, 10, 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(65, 6, 10, 2)
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(65, 8, 10, 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(65, 10, 10, 2)
    ctx.fillStyle = '#0000AA'
    ctx.fillRect(71, 4, 4, 8)

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.ellipse(40, 77, 20, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Legs
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(24, 52, 12, 24)
    ctx.fillRect(44, 52, 12, 24)

    // Shoes
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(22, 74, 14, 5)
    ctx.fillRect(44, 74, 14, 5)

    // Presidential suit - dark and distinguished
    ctx.fillStyle = '#1A1A2A'
    ctx.fillRect(16, 24, 48, 32)

    // Suit lapels - subtle gold trim
    ctx.fillStyle = '#2A2A3A'
    ctx.beginPath()
    ctx.moveTo(16, 24)
    ctx.lineTo(28, 24)
    ctx.lineTo(34, 44)
    ctx.lineTo(16, 44)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(64, 24)
    ctx.lineTo(52, 24)
    ctx.lineTo(46, 44)
    ctx.lineTo(64, 44)
    ctx.fill()

    // White shirt
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(32, 24, 16, 18)

    // Red power tie
    ctx.fillStyle = '#AA0000'
    ctx.fillRect(37, 24, 6, 26)
    ctx.fillStyle = '#880000'
    ctx.fillRect(37, 36, 6, 3) // Tie stripe

    // Arms - commanding pose
    ctx.fillStyle = '#1A1A2A'
    ctx.fillRect(6, 28, 12, 22)
    ctx.fillRect(62, 28, 12, 22)

    // Hands
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(6, 46, 10, 6)
    ctx.fillRect(64, 46, 10, 6)

    // Head - prominent
    ctx.fillStyle = '#FFCC99'
    ctx.fillRect(24, 2, 32, 24)

    // Distinguished gray hair
    ctx.fillStyle = '#777777'
    ctx.fillRect(22, 0, 36, 6)
    ctx.fillRect(20, 2, 6, 10)
    ctx.fillRect(54, 2, 6, 10)

    // Eyes - determined, powerful
    ctx.fillStyle = '#2A4A6A'
    ctx.fillRect(30, 10, 4, 3)
    ctx.fillRect(46, 10, 4, 3)
    ctx.fillStyle = '#000000'
    ctx.fillRect(31, 11, 2, 1)
    ctx.fillRect(47, 11, 2, 1)

    // Confident presidential smile
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(34, 18, 12, 4)
    ctx.strokeStyle = '#CC8866'
    ctx.lineWidth = 1
    ctx.strokeRect(34, 18, 12, 4)

    // Presidential seal pin
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(20, 32, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(20, 32, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0000AA'
    ctx.beginPath()
    ctx.arc(20, 32, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Outline
    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 2
    ctx.strokeRect(16, 24, 48, 32)
  }
}
