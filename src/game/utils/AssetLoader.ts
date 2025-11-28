import * as PIXI from 'pixi.js'

export interface SpriteSheetData {
  frames: Record<string, {
    frame: { x: number; y: number; w: number; h: number }
    sourceSize: { w: number; h: number }
    spriteSourceSize: { x: number; y: number; w: number; h: number }
  }>
  meta: {
    image: string
    size: { w: number; h: number }
    scale: number
  }
  animations?: Record<string, string[]>
}

export interface AnimationData {
  frames: PIXI.Texture[]
  speed: number // frames per second
}

export class AssetLoader {
  private static instance: AssetLoader
  private textures: Map<string, PIXI.Texture> = new Map()
  private spriteSheets: Map<string, PIXI.Spritesheet> = new Map()
  private loaded: boolean = false
  private usePlaceholders: boolean = true // Use procedural sprites until assets exist

  private constructor() {}

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader()
    }
    return AssetLoader.instance
  }

  async loadAll(): Promise<void> {
    if (this.loaded) return

    try {
      // Attempt to load actual assets
      await this.loadAssets()
      this.usePlaceholders = false
      console.log('Assets loaded successfully')
    } catch (error) {
      // Assets not available, use placeholders
      console.log('Assets not found, using procedural placeholders')
      this.usePlaceholders = true
    }

    this.loaded = true
  }

  private async loadAssets(): Promise<void> {
    const assetManifest = {
      bundles: [
        {
          name: 'sprites',
          assets: [
            { name: 'player', srcs: 'assets/sprites/player/player.json' },
            { name: 'intern', srcs: 'assets/sprites/enemies/intern.json' },
            { name: 'bureaucrat', srcs: 'assets/sprites/enemies/bureaucrat.json' },
            { name: 'irs_agent', srcs: 'assets/sprites/enemies/irs_agent.json' },
            { name: 'secret_service', srcs: 'assets/sprites/enemies/secret_service.json' },
            { name: 'lobbyist', srcs: 'assets/sprites/enemies/lobbyist.json' },
            { name: 'projectiles', srcs: 'assets/sprites/weapons/projectiles.json' },
            { name: 'pickups', srcs: 'assets/sprites/pickups/pickups.json' },
            { name: 'props', srcs: 'assets/sprites/environment/props/props.json' },
            { name: 'ui', srcs: 'assets/sprites/ui/hud.json' },
          ]
        },
        {
          name: 'tilesets',
          assets: [
            { name: 'irs_building', srcs: 'assets/sprites/environment/tiles/irs_building.png' },
            { name: 'capitol', srcs: 'assets/sprites/environment/tiles/capitol.png' },
            { name: 'house_chamber', srcs: 'assets/sprites/environment/tiles/house_chamber.png' },
            { name: 'senate_chamber', srcs: 'assets/sprites/environment/tiles/senate_chamber.png' },
            { name: 'white_house', srcs: 'assets/sprites/environment/tiles/white_house.png' },
          ]
        },
        {
          name: 'bosses',
          assets: [
            { name: 'irs_commissioner', srcs: 'assets/sprites/bosses/irs_commissioner.json' },
            { name: 'senator', srcs: 'assets/sprites/bosses/senator.json' },
            { name: 'speaker', srcs: 'assets/sprites/bosses/speaker.json' },
            { name: 'vice_president', srcs: 'assets/sprites/bosses/vice_president.json' },
            { name: 'president', srcs: 'assets/sprites/bosses/president.json' },
          ]
        }
      ]
    }

    await PIXI.Assets.init({ manifest: assetManifest })

    // Load sprite bundles
    const sprites = await PIXI.Assets.loadBundle('sprites')

    // Store sprite sheets
    for (const [name, sheet] of Object.entries(sprites)) {
      if (sheet instanceof PIXI.Spritesheet) {
        this.spriteSheets.set(name, sheet)
      }
    }
  }

  isUsingPlaceholders(): boolean {
    return this.usePlaceholders
  }

  getTexture(name: string): PIXI.Texture | null {
    return this.textures.get(name) || null
  }

  getSpriteSheet(name: string): PIXI.Spritesheet | null {
    return this.spriteSheets.get(name) || null
  }

  getAnimation(sheetName: string, animationName: string): PIXI.Texture[] | null {
    const sheet = this.spriteSheets.get(sheetName)
    if (!sheet) return null

    return sheet.animations[animationName] || null
  }

  getFrame(sheetName: string, frameName: string): PIXI.Texture | null {
    const sheet = this.spriteSheets.get(sheetName)
    if (!sheet) return null

    return sheet.textures[frameName] || null
  }

  // Create an animated sprite from a sprite sheet
  createAnimatedSprite(
    sheetName: string,
    animationName: string,
    speed: number = 0.1
  ): PIXI.AnimatedSprite | null {
    const frames = this.getAnimation(sheetName, animationName)
    if (!frames || frames.length === 0) return null

    const sprite = new PIXI.AnimatedSprite(frames)
    sprite.animationSpeed = speed
    sprite.play()
    return sprite
  }
}

// Animation helper class for entities
export class AnimationController {
  private sprite: PIXI.AnimatedSprite | PIXI.Sprite
  private animations: Map<string, PIXI.Texture[]> = new Map()
  private currentAnimation: string = ''
  private isAnimatedSprite: boolean = false

  constructor(sprite: PIXI.AnimatedSprite | PIXI.Sprite) {
    this.sprite = sprite
    this.isAnimatedSprite = sprite instanceof PIXI.AnimatedSprite
  }

  addAnimation(name: string, frames: PIXI.Texture[]): void {
    this.animations.set(name, frames)
  }

  play(animationName: string, loop: boolean = true): void {
    if (this.currentAnimation === animationName) return
    if (!this.isAnimatedSprite) return

    const frames = this.animations.get(animationName)
    if (!frames) return

    const animSprite = this.sprite as PIXI.AnimatedSprite
    animSprite.textures = frames
    animSprite.loop = loop
    animSprite.gotoAndPlay(0)
    this.currentAnimation = animationName
  }

  stop(): void {
    if (this.isAnimatedSprite) {
      (this.sprite as PIXI.AnimatedSprite).stop()
    }
  }

  getCurrentAnimation(): string {
    return this.currentAnimation
  }
}

// Helper to determine animation direction based on velocity
export function getDirectionFromVelocity(vx: number, vy: number): string {
  if (Math.abs(vx) > Math.abs(vy)) {
    return vx > 0 ? 'right' : 'left'
  } else if (vy !== 0) {
    return vy > 0 ? 'down' : 'up'
  }
  return 'down' // default
}

// Helper to get animation name
export function getAnimationName(action: string, direction: string): string {
  return `${action}_${direction}`
}
