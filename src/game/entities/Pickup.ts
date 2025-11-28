import { Entity } from './Entity'
import { SpriteGenerator } from '../utils/SpriteGenerator'

export type PickupType =
  | 'tax_refund_small'
  | 'tax_refund_large'
  | 'health'
  | 'damage_boost'
  | 'spread_boost'
  | 'shield'
  | 'extra_life'
  | 'weapon_pistol'
  | 'weapon_shotgun'
  | 'weapon_rapidfire'
  | 'weapon_laser'
  | 'weapon_spread'

export interface PickupConfig {
  type: PickupType
  value?: number // For score or health amount
  duration?: number // For timed effects
}

export const PICKUP_CONFIGS: Record<PickupType, PickupConfig> = {
  tax_refund_small: { type: 'tax_refund_small', value: 100 },
  tax_refund_large: { type: 'tax_refund_large', value: 500 },
  health: { type: 'health', value: 25 },
  damage_boost: { type: 'damage_boost', duration: 10 },
  spread_boost: { type: 'spread_boost', duration: 10 },
  shield: { type: 'shield', value: 3 },
  extra_life: { type: 'extra_life' },
  weapon_pistol: { type: 'weapon_pistol' },
  weapon_shotgun: { type: 'weapon_shotgun' },
  weapon_rapidfire: { type: 'weapon_rapidfire' },
  weapon_laser: { type: 'weapon_laser' },
  weapon_spread: { type: 'weapon_spread' }
}

// Drop rates for different pickup types
export const PICKUP_DROP_RATES: { type: PickupType; weight: number }[] = [
  { type: 'tax_refund_small', weight: 40 },
  { type: 'tax_refund_large', weight: 10 },
  { type: 'health', weight: 20 },
  { type: 'damage_boost', weight: 8 },
  { type: 'spread_boost', weight: 8 },
  { type: 'shield', weight: 6 },
  { type: 'extra_life', weight: 2 }, // Rare!
  { type: 'weapon_pistol', weight: 6 },
  { type: 'weapon_shotgun', weight: 4 },
  { type: 'weapon_rapidfire', weight: 4 },
  { type: 'weapon_laser', weight: 3 },
  { type: 'weapon_spread', weight: 4 }
]

export class Pickup extends Entity {
  public pickupType: PickupType
  public config: PickupConfig
  private lifetime: number = 10 // Despawn after 10 seconds
  private bobTimer: number = 0

  constructor(type: PickupType, x: number, y: number) {
    super(SpriteGenerator.generatePickupSprite(type), 20, 20)
    this.pickupType = type
    this.config = PICKUP_CONFIGS[type]
    this.x = x
    this.y = y
  }

  update(dt: number): void {
    this.lifetime -= dt
    if (this.lifetime <= 0) {
      this.active = false
    }

    // Bob up and down
    this.bobTimer += dt
    this.sprite.y = this.y + Math.sin(this.bobTimer * 4) * 3

    // Flash when about to despawn
    if (this.lifetime < 3) {
      this.sprite.alpha = Math.sin(this.lifetime * 8) > 0 ? 1 : 0.5
    }

    this.sprite.x = this.x
  }

  static getRandomPickupType(): PickupType {
    const totalWeight = PICKUP_DROP_RATES.reduce((sum, p) => sum + p.weight, 0)
    let random = Math.random() * totalWeight

    for (const pickup of PICKUP_DROP_RATES) {
      random -= pickup.weight
      if (random <= 0) {
        return pickup.type
      }
    }

    return 'tax_refund_small' // Fallback
  }
}
