import { Weapon, WeaponStats } from './Weapon'

export class Shotgun extends Weapon {
  constructor() {
    const stats: WeaponStats = {
      name: 'Shotgun',
      damage: 8,
      fireRate: 2,
      projectileSpeed: 450,
      projectileType: 'shotgun',
      spread: 5,
      spreadAngle: Math.PI / 6, // 30 degrees
      piercing: false
    }
    super(stats)
  }
}
