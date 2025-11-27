class Boomerang {
  constructor(x, y, targetX, targetY, player, charged = false) {
    this.x = x
    this.y = y
    this.startX = x
    this.startY = y
    this.player = player
    this.charged = charged

    // Calculate throw direction
    const dx = targetX - x
    const dy = targetY - y
    const distance = Math.sqrt(dx * dx + dy * dy)

    this.directionX = dx / distance
    this.directionY = dy / distance

    // Properties
    this.speed = charged ? 18 : 12
    this.maxDistance = charged ? 400 : 250
    this.distanceTraveled = 0
    this.returning = false
    this.active = true
    this.rotation = 0
    this.rotationSpeed = charged ? 0.4 : 0.3
    this.size = charged ? 24 : 16

    // Trail
    this.trail = []
    this.trailMaxLength = charged ? 12 : 8

    // Damage
    this.damage = charged ? 2 : 1
    this.hitEnemies = new Set()
  }

  update(deltaTime) {
    if (!this.active) return false

    const speed = this.speed * 60 * deltaTime

    if (!this.returning) {
      // Flying away from player
      this.x += this.directionX * speed
      this.y += this.directionY * speed
      this.distanceTraveled += speed

      // Check if should return
      if (this.distanceTraveled >= this.maxDistance) {
        this.returning = true
      }
    } else {
      // Returning to player
      const dx = this.player.x + this.player.width / 2 - this.x
      const dy = this.player.y + this.player.height / 2 - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 20) {
        // Caught by player
        this.active = false
        return false
      }

      // Move towards player
      this.directionX = dx / distance
      this.directionY = dy / distance
      this.x += this.directionX * speed * 1.2
      this.y += this.directionY * speed * 1.2
    }

    // Update rotation
    this.rotation += this.rotationSpeed

    // Update trail
    this.trail.push({ x: this.x, y: this.y, alpha: 1, rotation: this.rotation })
    if (this.trail.length > this.trailMaxLength) {
      this.trail.shift()
    }
    this.trail.forEach((t, i) => {
      t.alpha = i / this.trailMaxLength * 0.6
    })

    return true
  }

  getBounds() {
    return {
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      width: this.size,
      height: this.size
    }
  }

  hitEnemy(enemy) {
    if (this.hitEnemies.has(enemy)) return false
    this.hitEnemies.add(enemy)
    return true
  }

  render(ctx, spriteRenderer) {
    if (!this.active) return

    // Render trail
    this.trail.forEach(t => {
      spriteRenderer.drawSprite(
        ctx,
        this.charged ? 'boomerang-charged' : 'boomerang',
        t.x,
        t.y,
        0.8,
        t.alpha,
        false,
        t.rotation
      )
    })

    // Render boomerang
    spriteRenderer.drawSprite(
      ctx,
      this.charged ? 'boomerang-charged' : 'boomerang',
      this.x,
      this.y,
      1,
      1,
      false,
      this.rotation
    )

    // Glow effect for charged boomerang
    if (this.charged) {
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#ffff00'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
}

export default Boomerang
