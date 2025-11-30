import { ProjectileConfig } from '../entities/Projectile'

export interface WeaponStats {
  name: string
  damage: number
  fireRate: number // Shots per second
  projectileSpeed: number
  projectileType: string
  spread: number // Number of projectiles
  spreadAngle: number // Total spread arc in radians
  piercing: boolean
}

export abstract class Weapon {
  public stats: WeaponStats
  protected cooldown: number = 0

  constructor(stats: WeaponStats) {
    this.stats = stats
  }

  /**
   * Get the weapon name for display and effects
   */
  get name(): string {
    return this.stats.name
  }

  update(dt: number): void {
    if (this.cooldown > 0) {
      this.cooldown -= dt
    }
  }

  canFire(): boolean {
    return this.cooldown <= 0
  }

  fire(): ProjectileConfig[] | null {
    if (!this.canFire()) return null

    this.cooldown = 1 / this.stats.fireRate

    const projectiles: ProjectileConfig[] = []

    for (let i = 0; i < this.stats.spread; i++) {
      projectiles.push({
        damage: this.stats.damage,
        speed: this.stats.projectileSpeed,
        piercing: this.stats.piercing,
        type: this.stats.projectileType,
        isPlayerProjectile: true
      })
    }

    return projectiles
  }

  getProjectileAngles(baseAngle: number, spreadMultiplier: number = 1): number[] {
    const numProjectiles = Math.floor(this.stats.spread * spreadMultiplier)
    const angles: number[] = []

    if (numProjectiles === 1) {
      angles.push(baseAngle)
    } else {
      const totalSpread = this.stats.spreadAngle
      const angleStep = totalSpread / (numProjectiles - 1)
      const startAngle = baseAngle - totalSpread / 2

      for (let i = 0; i < numProjectiles; i++) {
        angles.push(startAngle + angleStep * i)
      }
    }

    return angles
  }

  getCooldownProgress(): number {
    const maxCooldown = 1 / this.stats.fireRate
    return Math.max(0, this.cooldown / maxCooldown)
  }
}
