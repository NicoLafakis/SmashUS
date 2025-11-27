# BoomerangQuest

A fluid, fast-paced 2D platformer combining the smooth movement of Ori, classic Castlevania platforming, and retro Mega Man 8-bit aesthetics. Wield your boomerang to defeat enemies in this action-packed adventure!

## Features

### Fluid Movement System
- **Smooth acceleration/deceleration** for natural character control
- **Wall sliding and wall jumping** for advanced platforming
- **Double jump** for extended air mobility
- **Dash ability** with cooldown and trail effects
- **Variable jump height** based on button hold duration

### Boomerang Combat System
- **Click and hold** to charge your boomerang throw
- **Release** to throw at cursor position
- Boomerang flies out and **returns to you automatically**
- **Fully charged throws** deal double damage and travel further
- Visual charge indicator with particles and glowing effects
- Boomerang can hit multiple enemies on its path
- Enemy AI with patrol, chase, and attack states
- Health system with invincibility frames

### Visual Effects
- **Particle system** for jumps, landings, dashes, hits, and deaths
- **Motion trails** during high-speed movement
- **Screen shake** for impactful hits
- **Hit stop** (freeze frames) for combat feedback
- **Screen flash effects** for damage
- **Parallax scrolling backgrounds** with depth layers
- **Pixel-perfect rendering** for authentic retro look

### Audio (8-bit style)
- Procedurally generated 8-bit sound effects using Web Audio API
- Jump, land, attack, hit, death, and powerup sounds
- Dynamic background music loop

### Level Design
- Procedurally generated platforms with variety
- Multiple gameplay sections: ground, floating platforms, vertical towers, descents
- Enemy spawn points throughout the level
- Smooth camera following with lerp

## Controls

- **Arrow Keys / WASD**: Move left/right
- **W / Space / Up Arrow**: Jump (press again in air for double jump)
- **Left Mouse Button**: Hold to charge, release to throw boomerang
- **Z / K / Shift**: Dash

## Boomerang Mechanics

- **Quick Throw**: Click and release quickly for a standard boomerang throw
- **Charged Throw**: Hold for 1 second to fully charge - deals 2x damage and travels 60% further
- **Smart Tracking**: Boomerang automatically returns to you after reaching max distance
- **Multi-Hit**: Can damage multiple enemies during flight and return
- **Visual Feedback**: Charge ring appears around player, turns yellow when fully charged
- **Cooldown System**: Longer cooldown for charged throws

## Running the Game

```bash
npm install
npm run dev
```

Then open your browser to `http://localhost:3001` (or the port shown in your terminal)

## Tech Stack

- React 18
- Vite
- Canvas API for rendering
- Web Audio API for 8-bit sound generation

## Game Architecture

- **Entity System**: Player and Enemy classes with physics
- **Particle System**: Flexible particle emitter for visual effects
- **Sprite Renderer**: Procedural pixel art generation
- **Audio Engine**: 8-bit sound synthesis
- **Level Generator**: Procedural platform creation
- **Camera System**: Smooth following with shake effects

## Performance

- 60 FPS target with delta time calculations
- Efficient particle pooling
- Pixel-perfect rendering with `imageSmoothingEnabled: false`
- Canvas-based rendering for smooth animations
