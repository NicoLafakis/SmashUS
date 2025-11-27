class Enemy {
  constructor(x, y, type = 'walker') {
    this.x = x
    this.y = y
    this.width = 24
    this.height = 24
    this.vx = 0
    this.vy = 0
    this.type = type
    this.health = 2
    this.alive = true
    this.facing = -1

    // AI state
    this.state = 'patrol'
    this.patrolDirection = Math.random() > 0.5 ? 1 : -1
    this.aggroRange = 200
    this.attackRange = 40
    this.speed = 2
    this.jumpTimer = 0
    this.attackTimer = 0
    this.stateTimer = 0

    // Animation
    this.animFrame = 0
    this.animTimer = 0
    this.animSpeed = 0.2

    // Physics
    this.gravity = 0.6
    this.maxFallSpeed = 15
    this.grounded = false
  }

  update(deltaTime, player, platforms) {
    if (!this.alive) return

    const prevY = this.y
    this.stateTimer += deltaTime
    this.animTimer += deltaTime
    this.jumpTimer = Math.max(0, this.jumpTimer - deltaTime)
    this.attackTimer = Math.max(0, this.attackTimer - deltaTime)

    // Calculate distance to player
    const dx = player.x - this.x
    const dy = player.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // AI state machine
    if (distance < this.aggroRange) {
      this.state = 'chase'
    } else if (this.state === 'chase' && distance > this.aggroRange * 1.5) {
      this.state = 'patrol'
    }

    // Behavior based on state
    if (this.state === 'patrol') {
      this.vx = this.patrolDirection * this.speed * 0.5

      // Change direction randomly
      if (this.stateTimer > 2) {
        this.stateTimer = 0
        if (Math.random() > 0.7) {
          this.patrolDirection *= -1
        }
      }
    } else if (this.state === 'chase') {
      // Move towards player
      if (Math.abs(dx) > this.attackRange) {
        this.vx = Math.sign(dx) * this.speed
        this.facing = Math.sign(dx)
      } else {
        this.vx *= 0.8
      }

      // Jump if player is above
      if (dy < -50 && this.grounded && this.jumpTimer <= 0) {
        this.vy = -10
        this.grounded = false
        this.jumpTimer = 1
      }

      // Attack if in range
      if (distance < this.attackRange && this.attackTimer <= 0) {
        this.attackTimer = 1
      }
    }

    // Apply gravity
    if (!this.grounded) {
      this.vy += this.gravity
      this.vy = Math.min(this.vy, this.maxFallSpeed)
    }

    // Apply velocity
    this.x += this.vx * deltaTime * 60
    this.y += this.vy

    // Collision with platforms
    this.grounded = false
    for (const platform of platforms) {
      if (this.x + this.width > platform.x &&
          this.x < platform.x + platform.width) {

        if (prevY + this.height <= platform.y && this.y + this.height > platform.y) {
          this.y = platform.y - this.height
          this.vy = 0
          this.grounded = true
        }
      }

      if (this.y + this.height > platform.y &&
          this.y < platform.y + platform.height) {

        if (this.vx > 0 && this.x + this.width > platform.x && this.x < platform.x) {
          this.x = platform.x - this.width
          this.vx = 0
          if (this.state === 'patrol') {
            this.patrolDirection *= -1
          }
        } else if (this.vx < 0 && this.x < platform.x + platform.width && this.x + this.width > platform.x + platform.width) {
          this.x = platform.x + platform.width
          this.vx = 0
          if (this.state === 'patrol') {
            this.patrolDirection *= -1
          }
        }
      }
    }

    // Update animation
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0
      this.animFrame = (this.animFrame + 1) % 2
    }
  }

  takeDamage(damage = 1) {
    this.health -= damage
    if (this.health <= 0) {
      this.alive = false
      return true
    }
    return false
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }

  render(ctx, spriteRenderer) {
    if (!this.alive) return

    // Pulsing effect when attacking
    const scale = this.attackTimer > 0 ? 1 + Math.sin(this.attackTimer * 20) * 0.1 : 1

    spriteRenderer.drawSprite(
      ctx,
      'enemy',
      this.x + this.width / 2,
      this.y + this.height / 2,
      scale,
      1,
      this.facing < 0,
      0
    )

    // Health bar
    const barWidth = this.width
    const barHeight = 3
    const healthPercent = this.health / 2

    ctx.fillStyle = '#333'
    ctx.fillRect(this.x, this.y - 8, barWidth, barHeight)

    ctx.fillStyle = healthPercent > 0.5 ? '#6bcf7f' : '#ff6b6b'
    ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight)
  }
}

export default Enemy
