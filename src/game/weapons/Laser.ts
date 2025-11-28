import { Weapon, WeaponStats } from './Weapon'

export class Laser extends Weapon {
  constructor() {
    const stats: WeaponStats = {
      name: 'Laser',
      damage: 25,
      fireRate: 2,
      projectileSpeed: 800,
      projectileType: 'laser',
      spread: 1,
      spreadAngle: 0,
      piercing: true // Pierces enemies
    }
    super(stats)
  }
}
