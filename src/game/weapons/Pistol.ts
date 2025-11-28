import { Weapon, WeaponStats } from './Weapon'

export class Pistol extends Weapon {
  constructor() {
    const stats: WeaponStats = {
      name: 'Pistol',
      damage: 15,
      fireRate: 5,
      projectileSpeed: 500,
      projectileType: 'pistol',
      spread: 1,
      spreadAngle: 0,
      piercing: false
    }
    super(stats)
  }
}
