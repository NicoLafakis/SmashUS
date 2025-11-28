import { Weapon, WeaponStats } from './Weapon'

export class RapidFire extends Weapon {
  constructor() {
    const stats: WeaponStats = {
      name: 'Rapid Fire',
      damage: 8,
      fireRate: 12,
      projectileSpeed: 550,
      projectileType: 'rapidfire',
      spread: 1,
      spreadAngle: 0,
      piercing: false
    }
    super(stats)
  }
}
