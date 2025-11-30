/**
 * UpgradeManager - Handles all persistent upgrades and economy
 *
 * Manages:
 * - Player money (separate from score)
 * - Purchased upgrades and their levels
 * - Upgrade definitions and costs
 * - Weapon evolution tracking
 */

// ============================================================================
// UPGRADE DEFINITIONS
// ============================================================================

export type UpgradeCategory = 'weapons' | 'defense' | 'utility' | 'items'

export interface UpgradeDefinition {
  id: string
  name: string
  description: string
  category: UpgradeCategory
  maxLevel: number
  baseCost: number
  costMultiplier: number // Cost increases per level
  effect: UpgradeEffect
  icon: string // Character for pixel art icon
}

export interface UpgradeEffect {
  stat: string
  valuePerLevel: number
  isPercent?: boolean // If true, value is a percentage modifier
}

export interface OwnedUpgrade {
  id: string
  level: number
}

// All available upgrades in the game
export const UPGRADES: UpgradeDefinition[] = [
  // === WEAPONS ===
  {
    id: 'weapon_damage',
    name: 'Firepower',
    description: 'Increase weapon damage',
    category: 'weapons',
    maxLevel: 5,
    baseCost: 500,
    costMultiplier: 1.8,
    effect: { stat: 'damageMultiplier', valuePerLevel: 0.15, isPercent: true },
    icon: '!'
  },
  {
    id: 'weapon_firerate',
    name: 'Quick Trigger',
    description: 'Increase fire rate',
    category: 'weapons',
    maxLevel: 5,
    baseCost: 400,
    costMultiplier: 1.7,
    effect: { stat: 'fireRateMultiplier', valuePerLevel: 0.12, isPercent: true },
    icon: '>'
  },
  {
    id: 'weapon_spread',
    name: 'Wide Shot',
    description: 'Add extra projectiles',
    category: 'weapons',
    maxLevel: 3,
    baseCost: 800,
    costMultiplier: 2.0,
    effect: { stat: 'bonusSpread', valuePerLevel: 1 },
    icon: '*'
  },
  {
    id: 'weapon_pierce',
    name: 'Piercing Rounds',
    description: 'Shots pass through enemies',
    category: 'weapons',
    maxLevel: 1,
    baseCost: 1500,
    costMultiplier: 1,
    effect: { stat: 'piercingShots', valuePerLevel: 1 },
    icon: '/'
  },

  // === DEFENSE ===
  {
    id: 'defense_maxhp',
    name: 'Vitality',
    description: 'Increase max health',
    category: 'defense',
    maxLevel: 5,
    baseCost: 300,
    costMultiplier: 1.6,
    effect: { stat: 'maxHealth', valuePerLevel: 25 },
    icon: '+'
  },
  {
    id: 'defense_shield',
    name: 'Shield Capacity',
    description: 'Increase max shields',
    category: 'defense',
    maxLevel: 3,
    baseCost: 600,
    costMultiplier: 2.0,
    effect: { stat: 'maxShield', valuePerLevel: 1 },
    icon: 'O'
  },
  {
    id: 'defense_armor',
    name: 'Tough Skin',
    description: 'Reduce damage taken',
    category: 'defense',
    maxLevel: 4,
    baseCost: 450,
    costMultiplier: 1.8,
    effect: { stat: 'damageReduction', valuePerLevel: 0.08, isPercent: true },
    icon: '#'
  },
  {
    id: 'defense_regen',
    name: 'Regeneration',
    description: 'Slowly heal over time',
    category: 'defense',
    maxLevel: 3,
    baseCost: 700,
    costMultiplier: 2.0,
    effect: { stat: 'healthRegen', valuePerLevel: 1 }, // HP per 5 seconds
    icon: '@'
  },

  // === UTILITY ===
  {
    id: 'utility_speed',
    name: 'Swift Feet',
    description: 'Increase movement speed',
    category: 'utility',
    maxLevel: 4,
    baseCost: 350,
    costMultiplier: 1.6,
    effect: { stat: 'moveSpeed', valuePerLevel: 0.10, isPercent: true },
    icon: '^'
  },
  {
    id: 'utility_magnet',
    name: 'Pickup Magnet',
    description: 'Increase pickup range',
    category: 'utility',
    maxLevel: 3,
    baseCost: 400,
    costMultiplier: 1.5,
    effect: { stat: 'pickupRadius', valuePerLevel: 30 },
    icon: 'U'
  },
  {
    id: 'utility_luck',
    name: 'Lucky Star',
    description: 'Better drop rates',
    category: 'utility',
    maxLevel: 3,
    baseCost: 500,
    costMultiplier: 1.8,
    effect: { stat: 'dropChance', valuePerLevel: 0.05, isPercent: true },
    icon: '$'
  },
  {
    id: 'utility_greed',
    name: 'Tax Collector',
    description: 'Enemies drop more money',
    category: 'utility',
    maxLevel: 4,
    baseCost: 450,
    costMultiplier: 1.7,
    effect: { stat: 'moneyMultiplier', valuePerLevel: 0.20, isPercent: true },
    icon: '%'
  },

  // === ITEMS (consumables, reset each run) ===
  {
    id: 'item_health_potion',
    name: 'Health Potion',
    description: 'Restore 50 HP',
    category: 'items',
    maxLevel: 99, // Can buy multiple
    baseCost: 200,
    costMultiplier: 1.0,
    effect: { stat: 'healthPotion', valuePerLevel: 50 },
    icon: 'H'
  },
  {
    id: 'item_shield_charge',
    name: 'Shield Cell',
    description: 'Add 1 shield charge',
    category: 'items',
    maxLevel: 99,
    baseCost: 300,
    costMultiplier: 1.0,
    effect: { stat: 'shieldCharge', valuePerLevel: 1 },
    icon: 'S'
  },
  {
    id: 'item_extra_life',
    name: 'Extra Life',
    description: 'Gain an additional life',
    category: 'items',
    maxLevel: 99,
    baseCost: 1000,
    costMultiplier: 1.5, // Gets more expensive
    effect: { stat: 'extraLife', valuePerLevel: 1 },
    icon: 'L'
  }
]

// ============================================================================
// WEAPON EVOLUTION DEFINITIONS
// ============================================================================

export interface WeaponEvolution {
  baseWeapon: string
  evolvedWeapon: string
  killsRequired: number
  cost: number
  name: string
  description: string
}

export const WEAPON_EVOLUTIONS: WeaponEvolution[] = [
  {
    baseWeapon: 'Pistol',
    evolvedWeapon: 'Magnum',
    killsRequired: 50,
    cost: 1000,
    name: 'Magnum',
    description: 'High-powered single shot'
  },
  {
    baseWeapon: 'Shotgun',
    evolvedWeapon: 'Double Barrel',
    killsRequired: 40,
    cost: 1200,
    name: 'Double Barrel',
    description: 'Two shots, twice the spread'
  },
  {
    baseWeapon: 'RapidFire',
    evolvedWeapon: 'Minigun',
    killsRequired: 100,
    cost: 1500,
    name: 'Minigun',
    description: 'Insane fire rate'
  },
  {
    baseWeapon: 'Laser',
    evolvedWeapon: 'Plasma Beam',
    killsRequired: 60,
    cost: 1300,
    name: 'Plasma Beam',
    description: 'Wider, more powerful beam'
  },
  {
    baseWeapon: 'SpreadShot',
    evolvedWeapon: 'Nova Cannon',
    killsRequired: 70,
    cost: 1400,
    name: 'Nova Cannon',
    description: '360-degree burst fire'
  }
]

// ============================================================================
// UPGRADE MANAGER CLASS
// ============================================================================

class UpgradeManagerClass {
  // Player's current money
  private _money: number = 0

  // Owned upgrades (persistent for the run)
  private _ownedUpgrades: Map<string, number> = new Map()

  // Consumable items (used when entering levels)
  private _consumables: Map<string, number> = new Map()

  // Weapon kill tracking for evolutions
  private _weaponKills: Map<string, number> = new Map()

  // Unlocked weapon evolutions
  private _unlockedEvolutions: Set<string> = new Set()

  // Computed stat bonuses (cached for performance)
  private _statBonuses: Map<string, number> = new Map()
  private _bonusesDirty: boolean = true

  // ========================================
  // MONEY MANAGEMENT
  // ========================================

  get money(): number {
    return this._money
  }

  addMoney(amount: number): void {
    // Apply money multiplier from upgrades
    const multiplier = 1 + this.getStatBonus('moneyMultiplier')
    this._money += Math.floor(amount * multiplier)
  }

  spendMoney(amount: number): boolean {
    if (this._money >= amount) {
      this._money -= amount
      return true
    }
    return false
  }

  setMoney(amount: number): void {
    this._money = amount
  }

  // ========================================
  // UPGRADE MANAGEMENT
  // ========================================

  getUpgradeLevel(upgradeId: string): number {
    return this._ownedUpgrades.get(upgradeId) || 0
  }

  canPurchaseUpgrade(upgradeId: string): { canBuy: boolean; reason?: string } {
    const upgrade = UPGRADES.find(u => u.id === upgradeId)
    if (!upgrade) {
      return { canBuy: false, reason: 'Upgrade not found' }
    }

    const currentLevel = this.getUpgradeLevel(upgradeId)
    if (currentLevel >= upgrade.maxLevel) {
      return { canBuy: false, reason: 'Max level reached' }
    }

    const cost = this.getUpgradeCost(upgradeId)
    if (this._money < cost) {
      return { canBuy: false, reason: 'Not enough money' }
    }

    return { canBuy: true }
  }

  getUpgradeCost(upgradeId: string): number {
    const upgrade = UPGRADES.find(u => u.id === upgradeId)
    if (!upgrade) return 0

    const currentLevel = this.getUpgradeLevel(upgradeId)
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel))
  }

  purchaseUpgrade(upgradeId: string): boolean {
    const { canBuy } = this.canPurchaseUpgrade(upgradeId)
    if (!canBuy) return false

    const cost = this.getUpgradeCost(upgradeId)
    if (!this.spendMoney(cost)) return false

    const currentLevel = this.getUpgradeLevel(upgradeId)
    this._ownedUpgrades.set(upgradeId, currentLevel + 1)
    this._bonusesDirty = true

    // Handle consumable items specially
    const upgrade = UPGRADES.find(u => u.id === upgradeId)
    if (upgrade?.category === 'items') {
      const currentCount = this._consumables.get(upgradeId) || 0
      this._consumables.set(upgradeId, currentCount + 1)
    }

    return true
  }

  // ========================================
  // STAT BONUSES
  // ========================================

  getStatBonus(stat: string): number {
    if (this._bonusesDirty) {
      this.recalculateBonuses()
    }
    return this._statBonuses.get(stat) || 0
  }

  private recalculateBonuses(): void {
    this._statBonuses.clear()

    for (const upgrade of UPGRADES) {
      if (upgrade.category === 'items') continue // Items don't give stat bonuses

      const level = this.getUpgradeLevel(upgrade.id)
      if (level > 0) {
        const currentBonus = this._statBonuses.get(upgrade.effect.stat) || 0
        this._statBonuses.set(
          upgrade.effect.stat,
          currentBonus + (upgrade.effect.valuePerLevel * level)
        )
      }
    }

    this._bonusesDirty = false
  }

  // ========================================
  // CONSUMABLES
  // ========================================

  getConsumableCount(itemId: string): number {
    return this._consumables.get(itemId) || 0
  }

  useConsumable(itemId: string): number | null {
    const count = this._consumables.get(itemId) || 0
    if (count <= 0) return null

    this._consumables.set(itemId, count - 1)

    const upgrade = UPGRADES.find(u => u.id === itemId)
    return upgrade?.effect.valuePerLevel || 0
  }

  // ========================================
  // WEAPON EVOLUTION
  // ========================================

  addWeaponKill(weaponName: string): void {
    const current = this._weaponKills.get(weaponName) || 0
    this._weaponKills.set(weaponName, current + 1)
  }

  getWeaponKills(weaponName: string): number {
    return this._weaponKills.get(weaponName) || 0
  }

  canEvolveWeapon(weaponName: string): WeaponEvolution | null {
    const evolution = WEAPON_EVOLUTIONS.find(e => e.baseWeapon === weaponName)
    if (!evolution) return null
    if (this._unlockedEvolutions.has(evolution.evolvedWeapon)) return null

    const kills = this.getWeaponKills(weaponName)
    if (kills < evolution.killsRequired) return null
    if (this._money < evolution.cost) return null

    return evolution
  }

  evolveWeapon(weaponName: string): string | null {
    const evolution = this.canEvolveWeapon(weaponName)
    if (!evolution) return null

    if (!this.spendMoney(evolution.cost)) return null

    this._unlockedEvolutions.add(evolution.evolvedWeapon)
    return evolution.evolvedWeapon
  }

  isWeaponUnlocked(weaponName: string): boolean {
    return this._unlockedEvolutions.has(weaponName)
  }

  // ========================================
  // PERSISTENCE
  // ========================================

  reset(): void {
    this._money = 0
    this._ownedUpgrades.clear()
    this._consumables.clear()
    this._weaponKills.clear()
    this._unlockedEvolutions.clear()
    this._statBonuses.clear()
    this._bonusesDirty = true
  }

  // Reset only consumables (between runs, keep upgrades)
  resetConsumables(): void {
    this._consumables.clear()
  }

  // Get all upgrades for a category
  getUpgradesByCategory(category: UpgradeCategory): UpgradeDefinition[] {
    return UPGRADES.filter(u => u.category === category)
  }

  // Debug: Get current state
  getState(): object {
    return {
      money: this._money,
      upgrades: Object.fromEntries(this._ownedUpgrades),
      consumables: Object.fromEntries(this._consumables),
      weaponKills: Object.fromEntries(this._weaponKills),
      unlockedEvolutions: Array.from(this._unlockedEvolutions),
      statBonuses: Object.fromEntries(this._statBonuses)
    }
  }
}

// Singleton instance
export const UpgradeManager = new UpgradeManagerClass()

// Helper function for easy access
export function getUpgradeManager(): UpgradeManagerClass {
  return UpgradeManager
}
