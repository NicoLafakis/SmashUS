import React, { useEffect, useRef, useState } from 'react'
import AudioEngine from '../engine/AudioEngine'
import SpriteRenderer from '../engine/SpriteRenderer'
import ParticleSystem from '../engine/ParticleSystem'
import Player from '../entities/Player'
import Enemy from '../entities/Enemy'
import LevelGenerator from '../world/LevelGenerator'

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720

function Game() {
  const canvasRef = useRef(null)
  const gameStateRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    // Initialize game systems
    const audio = new AudioEngine()
    const spriteRenderer = new SpriteRenderer()
    const particles = new ParticleSystem()
    const levelGen = new LevelGenerator(CANVAS_WIDTH, CANVAS_HEIGHT)

    // Generate sprites
    spriteRenderer.generateSprite('player', 32, ['#4ecdc4', '#ff6b6b', '#ffe66d'])
    spriteRenderer.generateSprite('enemy', 24, ['#ff6b6b', '#fff', '#333'])

    // Generate level
    const { platforms, spawnPoints } = levelGen.generate()

    // Create player
    const player = new Player(100, CANVAS_HEIGHT - 200, audio, particles)

    // Create enemies
    const enemies = spawnPoints.slice(0, 15).map(spawn =>
      new Enemy(spawn.x, spawn.y, 'walker')
    )

    // Input state
    const input = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      attack: false,
      dash: false
    }

    // Camera
    const camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      shake: 0,
      shakeX: 0,
      shakeY: 0
    }

    // Screen effects
    const effects = {
      hitStop: 0,
      flash: 0,
      flashColor: '#fff'
    }

    // Background layers for parallax
    const bgLayers = [
      { x: 0, y: 0, speed: 0.1, color: '#0a0a1a' },
      { x: 0, y: 0, speed: 0.3, color: '#1a1a2e' },
      { x: 0, y: 0, speed: 0.5, color: '#16213e' }
    ]

    // Keyboard events
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true
      if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') input.jump = true
      if (e.code === 'KeyX' || e.code === 'KeyJ') input.attack = true
      if (e.code === 'KeyZ' || e.code === 'KeyK' || e.code === 'ShiftLeft') input.dash = true
    }

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false
      if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') input.jump = false
      if (e.code === 'KeyX' || e.code === 'KeyJ') input.attack = false
      if (e.code === 'KeyZ' || e.code === 'KeyK' || e.code === 'ShiftLeft') input.dash = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Game state
    gameStateRef.current = {
      player,
      enemies,
      platforms,
      particles,
      camera,
      effects,
      audio,
      spriteRenderer,
      levelGen,
      bgLayers,
      score: 0,
      musicTimer: 0
    }

    // Game loop
    let lastTime = performance.now()
    let running = true

    const gameLoop = (currentTime) => {
      if (!running) return

      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const state = gameStateRef.current
      if (!state) return

      // Hit stop effect
      if (state.effects.hitStop > 0) {
        state.effects.hitStop -= deltaTime
        requestAnimationFrame(gameLoop)
        return
      }

      // Update player
      state.player.update(deltaTime, input, state.platforms)

      // Update enemies
      state.enemies.forEach(enemy => {
        if (enemy.alive) {
          enemy.update(deltaTime, state.player, state.platforms)

          // Check player attack collision
          const attackBox = state.player.getAttackBox()
          if (attackBox) {
            const enemyBounds = enemy.getBounds()
            if (attackBox.x < enemyBounds.x + enemyBounds.width &&
                attackBox.x + attackBox.width > enemyBounds.x &&
                attackBox.y < enemyBounds.y + enemyBounds.height &&
                attackBox.y + attackBox.height > enemyBounds.y) {

              if (enemy.takeDamage(1)) {
                state.score += 100
                setScore(state.score)
                state.particles.emitDeath(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)
                state.audio.playHit()
                state.effects.hitStop = 0.05
                state.camera.shake = 0.3
              }
            }
          }

          // Check enemy collision with player
          if (!state.player.invincible) {
            const playerBounds = {
              x: state.player.x,
              y: state.player.y,
              width: state.player.width,
              height: state.player.height
            }
            const enemyBounds = enemy.getBounds()

            if (playerBounds.x < enemyBounds.x + enemyBounds.width &&
                playerBounds.x + playerBounds.width > enemyBounds.x &&
                playerBounds.y < enemyBounds.y + enemyBounds.height &&
                playerBounds.y + playerBounds.height > enemyBounds.y) {

              if (state.player.takeDamage()) {
                setGameOver(true)
                running = false
              } else {
                state.effects.flash = 0.2
                state.effects.flashColor = '#ff0000'
                state.camera.shake = 0.5
              }
            }
          }
        }
      })

      // Update particles
      state.particles.update(deltaTime)

      // Update camera to follow player smoothly
      state.camera.targetX = state.player.x - CANVAS_WIDTH / 2 + state.player.width / 2
      state.camera.targetY = state.player.y - CANVAS_HEIGHT / 2 + state.player.height / 2
      state.camera.x += (state.camera.targetX - state.camera.x) * 0.1
      state.camera.y += (state.camera.targetY - state.camera.y) * 0.05

      // Clamp camera
      state.camera.y = Math.max(0, Math.min(state.camera.y, CANVAS_HEIGHT))

      // Camera shake
      if (state.camera.shake > 0) {
        state.camera.shake -= deltaTime
        state.camera.shakeX = (Math.random() - 0.5) * state.camera.shake * 20
        state.camera.shakeY = (Math.random() - 0.5) * state.camera.shake * 20
      } else {
        state.camera.shakeX = 0
        state.camera.shakeY = 0
      }

      // Update effects
      if (state.effects.flash > 0) {
        state.effects.flash -= deltaTime
      }

      // Background music loop
      state.musicTimer += deltaTime
      if (state.musicTimer > 1.5) {
        state.musicTimer = 0
        state.audio.playBackgroundMusic()
      }

      // Render
      render(ctx, state)

      requestAnimationFrame(gameLoop)
    }

    requestAnimationFrame(gameLoop)

    return () => {
      running = false
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const render = (ctx, state) => {
    const cam = state.camera

    // Clear canvas
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.save()
    ctx.translate(-cam.x + cam.shakeX, -cam.y + cam.shakeY)

    // Draw parallax background layers
    state.bgLayers.forEach((layer, i) => {
      const offsetX = cam.x * layer.speed
      const offsetY = cam.y * layer.speed

      ctx.fillStyle = layer.color
      ctx.globalAlpha = 0.3

      // Draw stars/pixels for depth
      const starCount = 50 - i * 15
      for (let j = 0; j < starCount; j++) {
        const x = ((j * 127) % (CANVAS_WIDTH * 2)) + offsetX % (CANVAS_WIDTH * 2)
        const y = ((j * 97) % CANVAS_HEIGHT) + offsetY % CANVAS_HEIGHT
        const size = 1 + (j % 3)
        ctx.fillRect(x, y, size, size)
      }

      ctx.globalAlpha = 1
    })

    // Draw platforms
    state.levelGen.render(ctx)

    // Draw enemies
    state.enemies.forEach(enemy => {
      enemy.render(ctx, state.spriteRenderer)
    })

    // Draw player
    state.player.render(ctx, state.spriteRenderer)

    // Draw particles
    state.particles.render(ctx)

    ctx.restore()

    // Draw HUD
    renderHUD(ctx, state)

    // Screen flash effect
    if (state.effects.flash > 0) {
      ctx.fillStyle = state.effects.flashColor
      ctx.globalAlpha = state.effects.flash
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.globalAlpha = 1
    }
  }

  const renderHUD = (ctx, state) => {
    // Health
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 20px "Courier New"'
    ctx.fillText('HEALTH', 20, 30)

    for (let i = 0; i < state.player.maxHealth; i++) {
      if (i < state.player.health) {
        ctx.fillStyle = '#ff6b6b'
      } else {
        ctx.fillStyle = '#333'
      }
      ctx.fillRect(20 + i * 40, 40, 30, 30)
    }

    // Score
    ctx.fillStyle = '#fff'
    ctx.fillText(`SCORE: ${state.score}`, 20, 100)

    // Controls hint
    ctx.font = '14px "Courier New"'
    ctx.fillStyle = '#888'
    ctx.fillText('ARROWS/WASD: Move | SPACE: Jump | X: Attack | Z: Dash', 20, CANVAS_HEIGHT - 20)

    // Ability cooldowns
    const dashCooldown = Math.max(0, state.player.dashCooldown)
    if (dashCooldown > 0) {
      ctx.fillStyle = '#4ecdc4'
      ctx.fillRect(20, 120, 100 * (1 - dashCooldown / 0.5), 10)
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(20, 120, 100, 10)
    }
  }

  const handleRestart = () => {
    setGameOver(false)
    setScore(0)
    window.location.reload()
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#000'
    }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #333',
          imageRendering: 'pixelated',
          maxWidth: '100%',
          maxHeight: '90vh'
        }}
      />

      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          fontFamily: '"Courier New", monospace',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '40px',
          border: '4px solid #ff6b6b',
          borderRadius: '10px'
        }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', color: '#ff6b6b' }}>GAME OVER</h1>
          <p style={{ fontSize: '24px', margin: '0 0 30px 0' }}>Final Score: {score}</p>
          <button
            onClick={handleRestart}
            style={{
              fontSize: '20px',
              padding: '15px 40px',
              background: '#4ecdc4',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              fontWeight: 'bold'
            }}
          >
            RESTART
          </button>
        </div>
      )}
    </div>
  )
}

export default Game
