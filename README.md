# Fluid Platformer

A fluid, fast-paced 2D platformer combining the smooth movement of Ori, classic Castlevania platforming, and retro Mega Man 8-bit aesthetics.

## Features

### Fluid Movement System
- **Smooth acceleration/deceleration** for natural character control
- **Wall sliding and wall jumping** for advanced platforming
- **Double jump** for extended air mobility
- **Dash ability** with cooldown and trail effects
- **Variable jump height** based on button hold duration

### Combat System
- Fast-paced melee attacks with visual feedback
- Attack hitboxes with screen shake and hit stop effects
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
- **Space / W / Up Arrow**: Jump (press again in air for double jump)
- **X / J**: Attack
- **Z / K / Shift**: Dash

## Running the Game

```bash
npm install
npm run dev
```

Then open your browser to `http://localhost:3000`

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
