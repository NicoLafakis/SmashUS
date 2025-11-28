import { Weapon, WeaponStats } from './Weapon'

export class SpreadShot extends Weapon {
  constructor() {
    const stats: WeaponStats = {
      name: 'Spread Shot',
      damage: 12,
      fireRate: 4,
      projectileSpeed: 500,
      projectileType: 'spread',
      spread: 3,
      spreadAngle: Math.PI / 9, // 20 degrees
      piercing: false
    }
    super(stats)
  }
}
