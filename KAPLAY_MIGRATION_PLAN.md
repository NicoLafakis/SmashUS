# SmashUS - KAPLAY Migration Plan

This document outlines a comprehensive migration from Pixi.js to KAPLAY, transforming SmashUS into a polished retro arcade experience with audio, particles, screen shake, and simplified code.

## Table of Contents
1. [Project Setup](#1-project-setup)
2. [Entity System Migration](#2-entity-system-migration)
3. [Collision System](#3-collision-system)
4. [Boss Hazard System](#4-boss-hazard-system)
5. [Audio System](#5-audio-system)
6. [Particle Effects](#6-particle-effects)
7. [Camera System](#7-camera-system)
8. [Complete Example: Main Game File](#8-complete-example)

---

## 1. Project Setup

### Current Setup (Remove)
```json
{
  "dependencies": {
    "pixi.js": "^7.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### New Setup
```json
{
  "dependencies": {
    "kaplay": "^3001.0.0"
  }
}
```

### New Entry Point (replaces main.tsx, App.tsx, Game.ts)

```typescript
// src/main.ts
import kaplay from "kaplay"

// Initialize KAPLAY - replaces ~90 lines across 3 files
const k = kaplay({
  width: 1280,
  height: 720,
  background: [26, 26, 46],      // 0x1a1a2e
  crisp: true,                    // Pixel-perfect rendering
  stretch: true,                  // Fill container
  letterbox: true,                // Maintain aspect ratio
  debug: true,                    // Built-in debug mode (F1)
  debugKey: "f1",
})

// Export for use in other files
export default k
export const {
  add, destroy, pos, sprite, area, body, health, text, rect, circle,
  color, opacity, scale, rotate, anchor, z, timer, state, animate,
  onUpdate, onDraw, onCollide, onKeyDown, onKeyPress, onMouseDown,
  shake, flash, play, loadSprite, loadSound, go, scene, wait, loop,
  vec2, rgb, rand, choose, width, height, center, mousePos, isKeyDown,
  dt, time, camPos, camScale, camRot,
} = k
```

**Benefits:**
- No React dependency (saves ~45KB)
- No manual canvas resize handling
- No custom GameLoop class needed
- Built-in debug mode
- Pixel-perfect rendering by default

---

## 2. Entity System Migration

### Current Entity Base Class (41 lines)
```typescript
// Current: src/game/entities/Entity.ts
export abstract class Entity {
  public sprite: PIXI.Sprite
  public x: number = 0
  public y: number = 0
  public vx: number = 0
  public vy: number = 0
  public width: number
  public height: number
  public active: boolean = true
  // ... constructor, update, getBounds, updateSprite, destroy
}
```

### KAPLAY Equivalent: No Base Class Needed!

KAPLAY uses composition over inheritance. Entities are composed of components:

```typescript
// No Entity.ts needed - use component composition instead

// Example: Creating any entity
const entity = add([
  sprite("enemy"),           // Renders sprite
  pos(100, 200),            // Position (x, y)
  area(),                    // Collision detection
  anchor("center"),          // Origin point
  "enemy",                   // Tag for collision queries
])

// Movement is just updating pos
entity.onUpdate(() => {
  entity.pos.x += entity.vx * dt()
  entity.pos.y += entity.vy * dt()
})
```

### Current Player Class (168 lines) → KAPLAY (~60 lines)

```typescript
// src/entities/player.ts
import { add, pos, sprite, area, anchor, health, onUpdate, onKeyDown,
         isKeyDown, mousePos, width, height, dt, shake, play } from "../main"

export function createPlayer() {
  const player = add([
    sprite("player"),
    pos(width() / 2, height() / 2),
    area({ width: 28, height: 28 }),
    anchor("center"),
    health(100),
    {
      // Custom properties
      speed: 200,
      lives: 3,
      score: 0,
      shield: 0,
      damageMultiplier: 1,
      spreadMultiplier: 1,
      damageBoostTimer: 0,
      spreadBoostTimer: 0,
      weapon: "wrench",
      invincibleTimer: 0,
    },
    "player",
  ])

  // Movement - replaces handleInput method
  player.onUpdate(() => {
    let moveX = 0
    let moveY = 0

    if (isKeyDown("left") || isKeyDown("a")) moveX = -1
    if (isKeyDown("right") || isKeyDown("d")) moveX = 1
    if (isKeyDown("up") || isKeyDown("w")) moveY = -1
    if (isKeyDown("down") || isKeyDown("s")) moveY = 1

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707
      moveY *= 0.707
    }

    player.pos.x += moveX * player.speed * dt()
    player.pos.y += moveY * player.speed * dt()

    // Clamp to bounds
    player.pos.x = Math.max(14, Math.min(width() - 14, player.pos.x))
    player.pos.y = Math.max(14, Math.min(height() - 14, player.pos.y))

    // Face mouse direction
    player.flipX = mousePos().x < player.pos.x

    // Handle invincibility flash
    if (player.invincibleTimer > 0) {
      player.invincibleTimer -= dt()
      player.opacity = Math.sin(player.invincibleTimer * 20) > 0 ? 1 : 0.3
      if (player.invincibleTimer <= 0) player.opacity = 1
    }

    // Handle powerup timers
    if (player.damageBoostTimer > 0) {
      player.damageBoostTimer -= dt()
      if (player.damageBoostTimer <= 0) player.damageMultiplier = 1
    }
    if (player.spreadBoostTimer > 0) {
      player.spreadBoostTimer -= dt()
      if (player.spreadBoostTimer <= 0) player.spreadMultiplier = 1
    }
  })

  // Damage handling - replaces takeDamage method
  player.on("hurt", () => {
    if (player.invincibleTimer > 0) return

    if (player.shield > 0) {
      player.shield--
      player.invincibleTimer = 0.5
      play("shield_hit")
      return
    }

    shake(8)  // SCREEN SHAKE ON HIT!
    play("player_hurt")
    player.flash(rgb(255, 0, 0))  // Flash red!
    player.invincibleTimer = 1

    if (player.hp() <= 0) {
      player.lives--
      if (player.lives > 0) {
        player.heal(100)
      } else {
        go("gameover", { score: player.score })
      }
    }
  })

  return player
}
```

### Current Enemy Class → KAPLAY

```typescript
// src/entities/enemy.ts
import { add, pos, sprite, area, anchor, health, onUpdate, dt,
         destroy, play, shake } from "../main"
import { spawnParticles } from "../effects/particles"

export const ENEMY_CONFIGS = {
  intern: { health: 10, speed: 250, damage: 5, score: 50, behavior: "chase" },
  bureaucrat: { health: 40, speed: 100, damage: 10, score: 100, behavior: "ranged" },
  irs_agent: { health: 30, speed: 150, damage: 15, score: 150, behavior: "ranged" },
  secret_service: { health: 25, speed: 200, damage: 12, score: 200, behavior: "flank" },
  lobbyist: { health: 35, speed: 120, damage: 8, score: 250, behavior: "avoid" },
}

export function createEnemy(type: string, x: number, y: number) {
  const config = ENEMY_CONFIGS[type]

  const enemy = add([
    sprite(type),
    pos(x, y),
    area(),
    anchor("center"),
    health(config.health),
    {
      speed: config.speed,
      damage: config.damage,
      scoreValue: config.score,
      behavior: config.behavior,
      shootCooldown: 0,
      aimAngle: 0,
    },
    "enemy",
    type,  // Additional tag for specific enemy type
  ])

  // AI behavior based on type
  enemy.onUpdate(() => {
    const player = get("player")[0]
    if (!player) return

    const dir = player.pos.sub(enemy.pos).unit()
    enemy.aimAngle = Math.atan2(dir.y, dir.x)

    switch (enemy.behavior) {
      case "chase":
        enemy.pos = enemy.pos.add(dir.scale(enemy.speed * dt()))
        break
      case "ranged":
        // Move towards player until in range, then stop and shoot
        const dist = enemy.pos.dist(player.pos)
        if (dist > 300) {
          enemy.pos = enemy.pos.add(dir.scale(enemy.speed * dt()))
        }
        break
      case "flank":
        // Strafe around player
        const perpendicular = vec2(-dir.y, dir.x)
        enemy.pos = enemy.pos.add(perpendicular.scale(enemy.speed * dt()))
        break
      case "avoid":
        // Keep distance from player
        if (enemy.pos.dist(player.pos) < 200) {
          enemy.pos = enemy.pos.sub(dir.scale(enemy.speed * dt()))
        }
        break
    }

    // Shooting logic for ranged enemies
    if (enemy.behavior !== "chase") {
      enemy.shootCooldown -= dt()
      if (enemy.shootCooldown <= 0) {
        spawnEnemyProjectile(enemy)
        enemy.shootCooldown = 1.5
      }
    }
  })

  // Death handling
  enemy.on("death", () => {
    play("enemy_death")
    shake(3)
    spawnParticles(enemy.pos, "enemy_death")

    // Drop pickup chance
    if (Math.random() < 0.35) {
      spawnPickup(enemy.pos)
    }

    destroy(enemy)
  })

  return enemy
}
```

---

## 3. Collision System

### Current Approach (GameScene.ts:651-848 = ~200 lines)
```typescript
// Manual AABB collision checks everywhere
private handleCollisions(): void {
  const playerBounds = this.player.getBounds()

  for (const proj of this.projectiles) {
    if (!proj.active || !proj.isPlayerProjectile) continue
    const projBounds = proj.getBounds()

    for (const enemy of this.room.getAliveEnemies()) {
      if (!enemy.active) continue
      const enemyBounds = enemy.getBounds()

      if (aabbIntersects(projBounds, enemyBounds)) {
        // Handle collision...
      }
    }
  }
  // ... 200 more lines of manual collision checking
}
```

### KAPLAY Approach (~40 lines total)

```typescript
// src/systems/collisions.ts
import { onCollide, shake, play, destroy } from "../main"
import { spawnParticles } from "../effects/particles"

export function setupCollisions() {
  // Player bullets hit enemies
  onCollide("player_bullet", "enemy", (bullet, enemy) => {
    if (bullet.piercing) {
      if (bullet.hitIds.has(enemy.id)) return
      bullet.hitIds.add(enemy.id)
    } else {
      destroy(bullet)
    }

    enemy.hurt(bullet.damage)
    play("hit")
    spawnParticles(bullet.pos, "hit_spark")
  })

  // Player bullets hit boss
  onCollide("player_bullet", "boss", (bullet, boss) => {
    if (boss.invulnerable) return

    destroy(bullet)
    boss.hurt(bullet.damage)
    play("boss_hit")
    boss.flash(rgb(255, 255, 255))
  })

  // Enemy bullets hit player
  onCollide("enemy_bullet", "player", (bullet, player) => {
    destroy(bullet)
    player.hurt(bullet.damage)
  })

  // Player touches enemy (contact damage)
  onCollide("player", "enemy", (player, enemy) => {
    player.hurt(10)
  })

  // Player touches boss
  onCollide("player", "boss", (player, boss) => {
    player.hurt(boss.contactDamage)
  })

  // Player collects pickup
  onCollide("player", "pickup", (player, pickup) => {
    play("pickup")
    pickup.collect(player)
    destroy(pickup)
  })

  // Player hit by hazard
  onCollide("player", "hazard", (player, hazard) => {
    player.hurt(hazard.damage)
  })
}
```

**Benefits:**
- Tag-based collision is declarative and readable
- No manual iteration over arrays
- Automatic cleanup when entities are destroyed
- ~80% less code

---

## 4. Boss Hazard System

### Current: 7 separate hazard classes (~400 lines total)
- BeamSweep.ts
- Shockwave.ts
- LingeringZone.ts
- TargetReticle.ts
- Explosion.ts
- ReflectiveBarrier.ts
- BossHazard.ts (base)

### KAPLAY: Simple functions with built-in effects

```typescript
// src/effects/hazards.ts
import { add, pos, circle, rect, rotate, opacity, scale, color,
         onUpdate, wait, destroy, dt, rgb, anchor, area } from "../main"

// Shockwave - expands outward from a point
export function spawnShockwave(x: number, y: number, opts: {
  maxRadius?: number,
  speed?: number,
  damage?: number,
  color?: [number, number, number],
} = {}) {
  const { maxRadius = 200, speed = 300, damage = 15, color: col = [255, 100, 100] } = opts

  const shockwave = add([
    pos(x, y),
    circle(0),
    color(...col),
    opacity(0.7),
    anchor("center"),
    area({ shape: new Circle(vec2(0), 0) }),
    { radius: 0, damage },
    "hazard",
  ])

  shockwave.onUpdate(() => {
    shockwave.radius += speed * dt()
    shockwave.radius = shockwave.radius  // Update circle radius
    shockwave.area.shape.radius = shockwave.radius
    shockwave.opacity -= dt() * 2

    if (shockwave.radius >= maxRadius) {
      destroy(shockwave)
    }
  })

  return shockwave
}

// Beam sweep - rotating laser from boss
export function spawnBeamSweep(boss: any, opts: {
  startAngle?: number,
  endAngle?: number,
  length?: number,
  width?: number,
  duration?: number,
  damage?: number,
} = {}) {
  const { startAngle = 0, endAngle = Math.PI, length = 400,
          width = 20, duration = 2, damage = 20 } = opts

  const beam = add([
    pos(boss.pos),
    rect(length, width),
    color(255, 50, 50),
    opacity(0.8),
    anchor("left"),
    rotate(startAngle * 180 / Math.PI),
    area(),
    { elapsed: 0, damage },
    "hazard",
  ])

  beam.onUpdate(() => {
    // Follow boss position
    beam.pos = boss.pos

    // Rotate from start to end angle
    beam.elapsed += dt()
    const progress = beam.elapsed / duration
    const currentAngle = startAngle + (endAngle - startAngle) * progress
    beam.angle = currentAngle * 180 / Math.PI

    // Pulse effect
    beam.opacity = 0.6 + Math.sin(beam.elapsed * 10) * 0.2

    if (beam.elapsed >= duration) {
      destroy(beam)
    }
  })

  return beam
}

// Target reticle with delayed explosion
export function spawnTargetReticle(x: number, y: number, opts: {
  radius?: number,
  delay?: number,
  explosionDamage?: number,
} = {}) {
  const { radius = 60, delay = 1.5, explosionDamage = 25 } = opts

  const reticle = add([
    pos(x, y),
    circle(radius),
    color(255, 0, 0),
    opacity(0.3),
    anchor("center"),
  ])

  // Pulsing animation
  reticle.onUpdate(() => {
    reticle.opacity = 0.2 + Math.sin(time() * 8) * 0.2
  })

  // Explode after delay
  wait(delay, () => {
    destroy(reticle)
    spawnExplosion(x, y, { radius, damage: explosionDamage })
  })

  return reticle
}

// Explosion - instant damage in radius
export function spawnExplosion(x: number, y: number, opts: {
  radius?: number,
  damage?: number,
  duration?: number,
} = {}) {
  const { radius = 80, damage = 30, duration = 0.3 } = opts

  play("explosion")
  shake(10)  // Screen shake!

  const explosion = add([
    pos(x, y),
    circle(radius),
    color(255, 200, 50),
    opacity(1),
    anchor("center"),
    area({ shape: new Circle(vec2(0), radius) }),
    { damage },
    "hazard",
  ])

  // Quick fade out
  explosion.onUpdate(() => {
    explosion.opacity -= dt() / duration
    explosion.scale = explosion.scale.add(vec2(dt() * 2))

    if (explosion.opacity <= 0) {
      destroy(explosion)
    }
  })

  return explosion
}

// Lingering damage zone
export function spawnLingeringZone(x: number, y: number, opts: {
  radius?: number,
  duration?: number,
  damage?: number,
  damageInterval?: number,
} = {}) {
  const { radius = 100, duration = 5, damage = 5, damageInterval = 0.5 } = opts

  const zone = add([
    pos(x, y),
    circle(radius),
    color(100, 255, 100),
    opacity(0.4),
    anchor("center"),
    area({ shape: new Circle(vec2(0), radius) }),
    { damage, nextDamageTime: 0 },
    "lingering_zone",
  ])

  // The collision system handles damage with damageInterval check
  zone.onUpdate(() => {
    zone.opacity = 0.3 + Math.sin(time() * 3) * 0.1
  })

  wait(duration, () => destroy(zone))

  return zone
}
```

---

## 5. Audio System

### Current: NO AUDIO

### KAPLAY: Dead Simple

```typescript
// src/systems/audio.ts
import { loadSound, play, volume } from "../main"

// Load all sounds at startup
export async function loadAudio() {
  // Player sounds
  loadSound("shoot", "sounds/shoot.wav")
  loadSound("player_hurt", "sounds/hurt.wav")
  loadSound("player_death", "sounds/death.wav")
  loadSound("pickup", "sounds/pickup.wav")
  loadSound("weapon_switch", "sounds/weapon.wav")

  // Enemy sounds
  loadSound("enemy_death", "sounds/enemy_death.wav")
  loadSound("enemy_shoot", "sounds/enemy_shoot.wav")

  // Boss sounds
  loadSound("boss_intro", "sounds/boss_intro.wav")
  loadSound("boss_hit", "sounds/boss_hit.wav")
  loadSound("boss_death", "sounds/boss_death.wav")
  loadSound("boss_attack", "sounds/boss_attack.wav")

  // Effects
  loadSound("explosion", "sounds/explosion.wav")
  loadSound("shield_hit", "sounds/shield.wav")
  loadSound("hit", "sounds/hit.wav")

  // Music
  loadSound("music_gameplay", "sounds/music_gameplay.ogg")
  loadSound("music_boss", "sounds/music_boss.ogg")
  loadSound("music_menu", "sounds/music_menu.ogg")
}

// Music controller
let currentMusic: any = null

export function playMusic(track: string) {
  if (currentMusic) {
    currentMusic.stop()
  }
  currentMusic = play(track, { loop: true, volume: 0.5 })
}

export function stopMusic() {
  if (currentMusic) {
    currentMusic.stop()
    currentMusic = null
  }
}

// Usage throughout the game:
// play("shoot")
// play("explosion", { volume: 0.8 })
// playMusic("music_boss")
```

### Recommended Free Sound Resources:
- **Kenney.nl** - https://kenney.nl/assets?q=audio (CC0)
- **OpenGameArt** - https://opengameart.org/art-search-advanced?field_art_type_tid=12
- **Freesound** - https://freesound.org (various licenses)
- **BFXR** - https://www.bfxr.net (generate 8-bit sounds)
- **ChipTone** - https://sfbgames.itch.io/chiptone (generate chiptune sounds)

---

## 6. Particle Effects

### Current: NO PARTICLES

### KAPLAY: Built-in or Simple Custom

```typescript
// src/effects/particles.ts
import { add, pos, circle, rect, color, opacity, scale, rotate, move,
         lifespan, anchor, choose, rand, vec2, destroy, onUpdate, dt } from "../main"

// Reusable particle burst
export function spawnParticles(position: any, type: string) {
  const configs = {
    // Enemy death - red/orange burst
    enemy_death: {
      count: 12,
      colors: [[255, 100, 50], [255, 150, 0], [255, 50, 50]],
      speed: [100, 200],
      size: [3, 8],
      lifetime: [0.3, 0.6],
    },
    // Hit spark - yellow/white
    hit_spark: {
      count: 6,
      colors: [[255, 255, 200], [255, 255, 100]],
      speed: [80, 150],
      size: [2, 5],
      lifetime: [0.1, 0.3],
    },
    // Boss death - big explosion
    boss_death: {
      count: 30,
      colors: [[255, 200, 50], [255, 100, 0], [255, 255, 200]],
      speed: [150, 350],
      size: [5, 15],
      lifetime: [0.5, 1.2],
    },
    // Pickup collected - sparkles
    pickup: {
      count: 8,
      colors: [[100, 255, 100], [200, 255, 200]],
      speed: [50, 100],
      size: [3, 6],
      lifetime: [0.3, 0.5],
    },
    // Money/score burst
    money: {
      count: 10,
      colors: [[50, 200, 50], [100, 255, 100]],
      speed: [80, 150],
      size: [4, 8],
      lifetime: [0.4, 0.8],
    },
  }

  const config = configs[type] || configs.hit_spark

  for (let i = 0; i < config.count; i++) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(config.speed[0], config.speed[1])
    const col = choose(config.colors)
    const size = rand(config.size[0], config.size[1])
    const lifetime = rand(config.lifetime[0], config.lifetime[1])

    const particle = add([
      pos(position.x || position, position.y || 0),
      circle(size),
      color(...col),
      opacity(1),
      anchor("center"),
      move(angle * 180 / Math.PI, speed),
      lifespan(lifetime, { fade: 0.5 }),
      scale(1),
    ])

    // Shrink over time
    particle.onUpdate(() => {
      particle.scale = particle.scale.sub(vec2(dt() * 2))
    })
  }
}

// Trail effect for projectiles
export function addTrail(entity: any, options: {
  color?: [number, number, number],
  size?: number,
  interval?: number,
} = {}) {
  const { color: col = [255, 255, 100], size = 4, interval = 0.02 } = options
  let trailTimer = 0

  entity.onUpdate(() => {
    trailTimer += dt()
    if (trailTimer >= interval) {
      trailTimer = 0

      add([
        pos(entity.pos),
        circle(size),
        color(...col),
        opacity(0.6),
        anchor("center"),
        lifespan(0.15, { fade: 0.1 }),
      ])
    }
  })
}

// Dust puff when player lands/stops
export function spawnDust(position: any) {
  for (let i = 0; i < 5; i++) {
    const offsetX = rand(-10, 10)

    add([
      pos(position.x + offsetX, position.y + 10),
      circle(rand(3, 6)),
      color(150, 150, 150),
      opacity(0.5),
      anchor("center"),
      move(rand(250, 290), rand(30, 60)),
      lifespan(0.3, { fade: 0.2 }),
    ])
  }
}
```

---

## 7. Camera System

### Current: Static Camera

### KAPLAY: Built-in Camera Features

```typescript
// src/systems/camera.ts
import { camPos, camScale, camRot, shake, tween, vec2, width, height,
         onUpdate, get, dt } from "../main"

// Smooth camera follow
export function setupCameraFollow() {
  onUpdate(() => {
    const player = get("player")[0]
    if (!player) return

    // Smooth follow with slight offset toward mouse
    const mouseOffset = mousePos().sub(center()).scale(0.1)
    const targetPos = player.pos.add(mouseOffset)

    // Lerp camera position
    const currentPos = camPos()
    const newPos = currentPos.lerp(targetPos, 5 * dt())

    // Clamp to level bounds (optional)
    newPos.x = Math.max(width() / 2, Math.min(LEVEL_WIDTH - width() / 2, newPos.x))
    newPos.y = Math.max(height() / 2, Math.min(LEVEL_HEIGHT - height() / 2, newPos.y))

    camPos(newPos)
  })
}

// Boss intro zoom
export function bossIntroZoom(bossPos: any) {
  const originalPos = camPos()

  // Zoom to boss
  return new Promise<void>((resolve) => {
    tween(
      camPos(),
      bossPos,
      0.5,
      (p) => camPos(p),
      easings.easeOutCubic
    )

    tween(
      1,
      1.2,
      0.5,
      (s) => camScale(s),
      easings.easeOutCubic
    )

    wait(1, () => {
      // Zoom back
      tween(
        camPos(),
        vec2(width() / 2, height() / 2),
        0.5,
        (p) => camPos(p),
        easings.easeOutCubic
      )

      tween(
        1.2,
        1,
        0.5,
        (s) => camScale(s),
        easings.easeOutCubic
      )

      wait(0.5, resolve)
    })
  })
}

// Death zoom
export function deathSlowMo() {
  // Slow motion effect
  setTimeScale(0.3)
  shake(15)

  wait(0.5, () => {
    setTimeScale(1)
  })
}

// Screen shake is built-in!
// Just call: shake(intensity)
// Examples:
//   shake(5)   - light hit
//   shake(10)  - big hit
//   shake(20)  - explosion
//   shake(30)  - boss death
```

---

## 8. Complete Example: Main Game File

Here's how the entire game structure looks with KAPLAY:

```typescript
// src/main.ts
import kaplay from "kaplay"

const k = kaplay({
  width: 1280,
  height: 720,
  background: [26, 26, 46],
  crisp: true,
  stretch: true,
  letterbox: true,
})

// Make everything available globally
export default k
export const {
  add, destroy, pos, sprite, area, body, health, text, rect, circle,
  color, opacity, scale, rotate, anchor, z, timer, state, animate,
  onUpdate, onDraw, onCollide, onKeyDown, onKeyPress, onMouseDown,
  shake, play, loadSprite, loadSound, go, scene, wait, loop,
  vec2, rgb, rand, choose, width, height, center, mousePos, isKeyDown,
  dt, time, camPos, camScale, camRot, get, lifespan, move,
} = k

// Load assets
loadSprite("player", "sprites/player.png")
loadSprite("intern", "sprites/intern.png")
loadSprite("bureaucrat", "sprites/bureaucrat.png")
// ... more sprites

loadSound("shoot", "sounds/shoot.wav")
loadSound("explosion", "sounds/explosion.wav")
// ... more sounds

// Import game modules
import { createPlayer } from "./entities/player"
import { createEnemy, spawnWave } from "./entities/enemy"
import { setupCollisions } from "./systems/collisions"
import { spawnParticles } from "./effects/particles"
import { playMusic } from "./systems/audio"

// Title scene
scene("title", () => {
  playMusic("music_menu")

  add([
    text("SMASH US", { size: 72 }),
    pos(center()),
    anchor("center"),
    color(255, 50, 50),
  ])

  add([
    text("John Q. Public vs The Government", { size: 24 }),
    pos(center().add(0, 60)),
    anchor("center"),
  ])

  add([
    text("Click to Start", { size: 20 }),
    pos(center().add(0, 150)),
    anchor("center"),
    opacity(1),
  ]).onUpdate(function() {
    this.opacity = 0.5 + Math.sin(time() * 4) * 0.5
  })

  onClick(() => go("game", { level: 1, room: 1 }))
})

// Main game scene
scene("game", ({ level, room }) => {
  // Setup collision handlers
  setupCollisions()

  // Play appropriate music
  if (room === maxRoomsPerLevel[level]) {
    playMusic("music_boss")
  } else {
    playMusic("music_gameplay")
  }

  // Create player
  const player = createPlayer()

  // Track game state
  let score = 0
  let roomCleared = false

  // Spawn enemies based on level/room
  const roomConfig = generateRoomConfig(level, room)
  spawnWave(roomConfig)

  // HUD
  const scoreText = add([
    text("Score: 0", { size: 20 }),
    pos(width() - 10, 10),
    anchor("topright"),
    z(100),
  ])

  const healthBar = add([
    rect(200, 20),
    pos(10, 10),
    color(0, 255, 0),
    z(100),
  ])

  // Update HUD
  onUpdate(() => {
    scoreText.text = `Score: ${player.score}`
    healthBar.width = (player.hp() / 100) * 200
    healthBar.color = player.hp() > 50 ? rgb(0, 255, 0) :
                      player.hp() > 25 ? rgb(255, 255, 0) : rgb(255, 0, 0)
  })

  // Shooting
  onMouseDown("left", () => {
    if (!player.canShoot) return

    const dir = mousePos().sub(player.pos).unit()
    const angle = Math.atan2(dir.y, dir.x)

    fireWeapon(player, angle)
    play("shoot")
  })

  // Check room clear
  onUpdate(() => {
    if (roomCleared) return

    const enemies = get("enemy")
    if (enemies.length === 0) {
      roomCleared = true

      add([
        text("ROOM CLEARED!", { size: 48 }),
        pos(center()),
        anchor("center"),
        color(100, 255, 100),
        lifespan(2),
      ])

      player.score += 500

      wait(2, () => {
        // Next room
        const nextRoom = room + 1
        if (nextRoom > maxRoomsPerLevel[level]) {
          // Next level
          go("game", { level: level + 1, room: 1 })
        } else {
          go("game", { level, room: nextRoom })
        }
      })
    }
  })
})

// Game over scene
scene("gameover", ({ score }) => {
  stopMusic()

  add([
    text("GAME OVER", { size: 64 }),
    pos(center()),
    anchor("center"),
    color(255, 50, 50),
  ])

  add([
    text(`Final Score: ${score}`, { size: 32 }),
    pos(center().add(0, 80)),
    anchor("center"),
  ])

  add([
    text("Click to Restart", { size: 20 }),
    pos(center().add(0, 150)),
    anchor("center"),
  ])

  onClick(() => go("title"))
})

// Start the game
go("title")
```

---

## Migration Summary

| Metric | Current (Pixi.js) | After (KAPLAY) |
|--------|------------------|----------------|
| **Total Files** | ~35 | ~15 |
| **Lines of Code** | ~3500 | ~1500 |
| **Dependencies** | 5 | 1 |
| **Bundle Size** | ~200KB | ~100KB |
| **Screen Shake** | Not implemented | `shake(10)` |
| **Particles** | Not implemented | Built-in |
| **Audio** | Not implemented | Built-in |
| **Camera Effects** | Not implemented | Built-in |
| **Collision Code** | ~200 lines | ~40 lines |
| **Entity Classes** | 5 classes | Component functions |

---

## Next Steps

1. **Install KAPLAY**: `npm install kaplay`
2. **Remove old dependencies**: `npm uninstall pixi.js react react-dom @types/react @types/react-dom @vitejs/plugin-react`
3. **Start with Title Scene**: Port the simplest scene first
4. **Port Player**: Convert to component-based approach
5. **Add Audio**: Immediate improvement with minimal effort
6. **Add Particles/Shake**: Make the game feel alive
7. **Port Enemies & Bosses**: Use the simplified collision system
8. **Polish**: Camera effects, more particles, screen transitions

The game already has solid design - bosses, weapons, levels. KAPLAY just lets you focus on that design instead of building engine features from scratch.
