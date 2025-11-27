class Player {
  constructor(x, y, audioEngine, particleSystem) {
    this.x = x
    this.y = y
    this.width = 32
    this.height = 32
    this.vx = 0
    this.vy = 0

    // Physics constants for fluid movement
    this.acceleration = 1.2
    this.maxSpeed = 6
    this.friction = 0.85
    this.airFriction = 0.95
    this.jumpPower = 12
    this.gravity = 0.6
    this.maxFallSpeed = 15
    this.wallSlideSpeed = 2

    // State
    this.grounded = false
    this.onWall = false
    this.wallDirection = 0
    this.canDoubleJump = true
    this.facing = 1

    // Combat
    this.attacking = false
    this.attackTimer = 0
    this.attackDuration = 0.3
    this.attackCooldown = 0
    this.attackRange = 40
    this.health = 3
    this.maxHealth = 3
    this.invincible = false
    this.invincibleTimer = 0

    // Animation
    this.animFrame = 0
    this.animTimer = 0
    this.animSpeed = 0.15

    // Dash ability
    this.canDash = true
    this.dashing = false
    this.dashTimer = 0
    this.dashDuration = 0.2
    this.dashSpeed = 15
    this.dashCooldown = 0

    // Trail effect
    this.trail = []
    this.trailMaxLength = 8

    this.audio = audioEngine
    this.particles = particleSystem
  }

  update(deltaTime, input, platforms) {
    const prevGrounded = this.grounded
    const prevY = this.y

    // Update timers
    if (this.attackTimer > 0) this.attackTimer -= deltaTime
    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime
    if (this.dashCooldown > 0) this.dashCooldown -= deltaTime
    if (this.invincibleTimer > 0) this.invincibleTimer -= deltaTime
    else this.invincible = false

    // Handle dash
    if (this.dashing) {
      this.dashTimer -= deltaTime
      if (this.dashTimer <= 0) {
        this.dashing = false
        this.vx *= 0.5
      } else {
        this.particles.emitDash(this.x, this.y + this.height / 2)
      }
    }

    // Movement input
    if (!this.dashing && !this.attacking) {
      if (input.left) {
        this.vx -= this.acceleration
        this.facing = -1
      }
      if (input.right) {
        this.vx += this.acceleration
        this.facing = 1
      }

      // Dash
      if (input.dash && this.canDash && this.dashCooldown <= 0) {
        this.dashing = true
        this.dashTimer = this.dashDuration
        this.dashCooldown = 0.5
        this.vx = this.facing * this.dashSpeed
        this.vy = 0
      }
    }

    // Attack
    if (input.attack && this.attackCooldown <= 0 && !this.attacking) {
      this.attacking = true
      this.attackTimer = this.attackDuration
      this.attackCooldown = 0.4
      this.audio.playAttack()
    }

    if (this.attackTimer <= 0) {
      this.attacking = false
    }

    // Apply friction
    if (this.grounded && !this.dashing) {
      this.vx *= this.friction
    } else {
      this.vx *= this.airFriction
    }

    // Clamp horizontal speed
    if (!this.dashing) {
      this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx))
    }

    // Wall slide detection
    this.onWall = false
    if (!this.grounded && Math.abs(this.vx) > 0.5) {
      for (const platform of platforms) {
        if (this.y + this.height > platform.y &&
            this.y < platform.y + platform.height) {
          if (this.vx > 0 && this.x + this.width >= platform.x && this.x + this.width <= platform.x + 10) {
            this.onWall = true
            this.wallDirection = 1
          } else if (this.vx < 0 && this.x <= platform.x + platform.width && this.x >= platform.x + platform.width - 10) {
            this.onWall = true
            this.wallDirection = -1
          }
        }
      }
    }

    // Gravity and jumping
    if (!this.grounded && !this.dashing) {
      if (this.onWall && this.vy > 0) {
        // Wall slide
        this.vy = Math.min(this.vy, this.wallSlideSpeed)
      } else {
        this.vy += this.gravity
        this.vy = Math.min(this.vy, this.maxFallSpeed)
      }
    }

    // Jump
    if (input.jump && !input.jumpPressed) {
      input.jumpPressed = true

      if (this.grounded) {
        this.vy = -this.jumpPower
        this.grounded = false
        this.canDoubleJump = true
        this.audio.playJump()
        this.particles.emitJump(this.x + this.width / 2, this.y + this.height)
      } else if (this.onWall) {
        // Wall jump
        this.vy = -this.jumpPower
        this.vx = -this.wallDirection * this.maxSpeed * 1.2
        this.onWall = false
        this.canDoubleJump = true
        this.audio.playJump()
        this.particles.emitJump(this.x + this.width / 2, this.y + this.height / 2)
      } else if (this.canDoubleJump) {
        // Double jump
        this.vy = -this.jumpPower * 0.9
        this.canDoubleJump = false
        this.audio.playJump()
        this.particles.emitJump(this.x + this.width / 2, this.y + this.height / 2)
      }
    }

    if (!input.jump) {
      input.jumpPressed = false
    }

    // Variable jump height
    if (!input.jump && this.vy < 0) {
      this.vy *= 0.85
    }

    // Apply velocity
    this.x += this.vx
    this.y += this.vy

    // Collision detection
    this.grounded = false

    for (const platform of platforms) {
      if (this.x + this.width > platform.x &&
          this.x < platform.x + platform.width) {

        // Vertical collision
        if (prevY + this.height <= platform.y && this.y + this.height > platform.y) {
          // Landing on top
          this.y = platform.y - this.height
          this.vy = 0
          this.grounded = true

          if (!prevGrounded && !this.dashing) {
            this.audio.playLand()
            this.particles.emitLand(this.x + this.width / 2, this.y + this.height)
          }
        } else if (prevY >= platform.y + platform.height && this.y < platform.y + platform.height) {
          // Hitting from below
          this.y = platform.y + platform.height
          this.vy = 0
        }
      }

      if (this.y + this.height > platform.y &&
          this.y < platform.y + platform.height) {

        // Horizontal collision
        if (this.vx > 0 && this.x + this.width > platform.x && this.x < platform.x) {
          this.x = platform.x - this.width
          this.vx = 0
        } else if (this.vx < 0 && this.x < platform.x + platform.width && this.x + this.width > platform.x + platform.width) {
          this.x = platform.x + platform.width
          this.vx = 0
        }
      }
    }

    // Update animation
    this.animTimer += deltaTime
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0
      this.animFrame = (this.animFrame + 1) % 4
    }

    // Update trail
    this.trail.push({ x: this.x, y: this.y, alpha: 1 })
    if (this.trail.length > this.trailMaxLength) {
      this.trail.shift()
    }
    this.trail.forEach((t, i) => {
      t.alpha = i / this.trailMaxLength * 0.3
    })
  }

  takeDamage() {
    if (this.invincible) return false

    this.health--
    this.invincible = true
    this.invincibleTimer = 1.5
    this.audio.playHit()
    this.particles.emitHit(this.x + this.width / 2, this.y + this.height / 2)

    if (this.health <= 0) {
      this.audio.playDeath()
      this.particles.emitDeath(this.x + this.width / 2, this.y + this.height / 2)
      return true
    }

    return false
  }

  getAttackBox() {
    if (!this.attacking) return null

    return {
      x: this.x + (this.facing > 0 ? this.width : -this.attackRange),
      y: this.y,
      width: this.attackRange,
      height: this.height
    }
  }

  render(ctx, spriteRenderer) {
    // Render trail when dashing
    if (this.dashing || Math.abs(this.vx) > 4) {
      this.trail.forEach(t => {
        spriteRenderer.drawSprite(
          ctx,
          'player',
          t.x + this.width / 2,
          t.y + this.height / 2,
          1,
          t.alpha,
          this.facing < 0,
          0
        )
      })
    }

    // Render player with invincibility flashing
    const shouldRender = !this.invincible || Math.floor(this.invincibleTimer * 20) % 2 === 0

    if (shouldRender) {
      const rotation = this.attacking ? Math.sin(this.attackTimer * 30) * 0.2 : 0

      spriteRenderer.drawSprite(
        ctx,
        'player',
        this.x + this.width / 2,
        this.y + this.height / 2,
        1,
        1,
        this.facing < 0,
        rotation
      )
    }

    // Render attack hitbox (debug/visual effect)
    if (this.attacking) {
      const attackBox = this.getAttackBox()
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)'
      ctx.fillRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height)

      // Attack slash effect
      ctx.strokeStyle = '#ffcc00'
      ctx.lineWidth = 3
      ctx.globalAlpha = 1 - (this.attackTimer / this.attackDuration)
      ctx.beginPath()
      const slashX = this.x + this.width / 2 + this.facing * 25
      const slashY = this.y + this.height / 2
      ctx.arc(slashX, slashY, 20, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }
}

export default Player
