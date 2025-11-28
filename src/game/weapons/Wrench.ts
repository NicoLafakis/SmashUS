import { Weapon, WeaponStats } from './Weapon'

export class Wrench extends Weapon {
  constructor() {
    const stats: WeaponStats = {
      name: 'Wrench',
      damage: 10,
      fireRate: 3,
      projectileSpeed: 400,
      projectileType: 'wrench',
      spread: 1,
      spreadAngle: 0,
      piercing: false
    }
    super(stats)
  }
}
