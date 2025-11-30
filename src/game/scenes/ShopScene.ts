import * as PIXI from 'pixi.js'
import { Scene } from './Scene'
import { Game, GAME_WIDTH, GAME_HEIGHT } from '../Game'
import { playSound } from '../systems/AudioManager'
import { playMusic } from '../systems/MusicManager'
import {
  UpgradeManager,
  UpgradeDefinition,
  UpgradeCategory
} from '../systems/UpgradeManager'

/**
 * ShopScene - 16-bit RPG style upgrade shop
 *
 * Appears between levels. Player can spend money on upgrades.
 * Features pixel art background, shopkeeper NPC, and cursor navigation.
 */

// Shop color palette (matches our pixel art style)
const SHOP_COLORS = {
  // Background
  floor: 0x5c4033,
  floorDark: 0x3d2817,
  wall: 0x8b7355,
  wallDark: 0x6b5344,
  wallLight: 0xa08566,

  // Furniture
  counter: 0x6b4423,
  counterTop: 0x8b5a2b,
  shelf: 0x5c4033,
  shelfLight: 0x7c5a43,

  // UI
  panelBg: 0x2a2a3a,
  panelBorder: 0x4a4a5a,
  panelHighlight: 0x6a6a8a,
  textWhite: 0xffffff,
  textGold: 0xffcc00,
  textGray: 0x888888,
  textGreen: 0x44ff44,
  textRed: 0xff4444,

  // Selection
  cursorColor: 0xffcc00,
  selectedBg: 0x3a3a5a,
}

// Category definitions
const CATEGORIES: { id: UpgradeCategory; name: string; icon: string }[] = [
  { id: 'weapons', name: 'WEAPONS', icon: '!' },
  { id: 'defense', name: 'DEFENSE', icon: '+' },
  { id: 'utility', name: 'UTILITY', icon: '^' },
  { id: 'items', name: 'ITEMS', icon: '*' },
]

// Shopkeeper dialogue lines
const SHOPKEEPER_GREETINGS = [
  "Welcome, patriot! Looking to\nstick it to the government?",
  "Ah, a fellow tax-payer!\nBrowse my wares.",
  "The bureaucrats won't know\nwhat hit 'em!",
  "Upgrades for the revolution!\nWhat'll it be?",
]

const SHOPKEEPER_PURCHASE = [
  "Excellent choice!",
  "That'll serve you well!",
  "A wise investment!",
  "The IRS won't see it coming!",
]

const SHOPKEEPER_NO_MONEY = [
  "Need more cash, friend.",
  "Come back when you're richer!",
  "Kill more bureaucrats first!",
]

export class ShopScene extends Scene {
  // UI State
  private selectedCategory: number = 0
  private selectedItem: number = 0
  private currentItems: UpgradeDefinition[] = []

  // UI Elements
  private shopkeeperDialogue!: PIXI.Text
  private moneyDisplay!: PIXI.Text
  private categoryTabs: PIXI.Container[] = []
  private itemCards: PIXI.Container[] = []
  private itemDescriptionPanel!: PIXI.Container
  private cursor!: PIXI.Graphics

  // Animation
  private cursorBlink: number = 0
  private dialogueTimer: number = 0

  // Level to return to after shopping
  private nextLevel: number = 1

  constructor(game: Game) {
    super(game)
  }

  setNextLevel(level: number): void {
    this.nextLevel = level
  }

  init(data?: Record<string, unknown>): void {
    // Store the next level from data
    if (data?.nextLevel && typeof data.nextLevel === 'number') {
      this.nextLevel = data.nextLevel
    }

    // Play shop music (use menu music for now)
    playMusic('menu')

    // Draw background
    this.drawShopBackground()

    // Draw shopkeeper
    this.drawShopkeeper()

    // Create UI panels
    this.createMoneyDisplay()
    this.createCategoryTabs()
    this.createItemGrid()
    this.createDescriptionPanel()
    this.createCursor()

    // Create controls hint
    this.createControlsHint()

    // Set initial state
    this.setRandomGreeting()
    this.updateCategory()
  }

  // ============================================
  // BACKGROUND DRAWING
  // ============================================

  private drawShopBackground(): void {
    const bg = new PIXI.Graphics()

    // Floor (wooden planks)
    bg.beginFill(SHOP_COLORS.floor)
    bg.drawRect(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4)
    bg.endFill()

    // Floor plank lines
    bg.lineStyle(2, SHOP_COLORS.floorDark)
    for (let y = GAME_HEIGHT * 0.6; y < GAME_HEIGHT; y += 20) {
      bg.moveTo(0, y)
      bg.lineTo(GAME_WIDTH, y)
    }

    // Wall
    bg.beginFill(SHOP_COLORS.wall)
    bg.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.6)
    bg.endFill()

    // Wall wainscoting
    bg.beginFill(SHOP_COLORS.wallDark)
    bg.drawRect(0, GAME_HEIGHT * 0.45, GAME_WIDTH, GAME_HEIGHT * 0.15)
    bg.endFill()

    // Wall trim
    bg.beginFill(SHOP_COLORS.wallLight)
    bg.drawRect(0, GAME_HEIGHT * 0.44, GAME_WIDTH, 4)
    bg.drawRect(0, GAME_HEIGHT * 0.59, GAME_WIDTH, 4)
    bg.endFill()

    // Counter
    this.drawCounter(bg)

    // Shelves
    this.drawShelves(bg)

    this.container.addChild(bg)
  }

  private drawCounter(bg: PIXI.Graphics): void {
    const counterY = GAME_HEIGHT * 0.55
    const counterHeight = 80

    // Counter front
    bg.beginFill(SHOP_COLORS.counter)
    bg.drawRect(50, counterY, GAME_WIDTH - 100, counterHeight)
    bg.endFill()

    // Counter top
    bg.beginFill(SHOP_COLORS.counterTop)
    bg.drawRect(45, counterY - 8, GAME_WIDTH - 90, 12)
    bg.endFill()

    // Counter details (wood grain)
    bg.lineStyle(1, SHOP_COLORS.floorDark, 0.3)
    for (let x = 60; x < GAME_WIDTH - 100; x += 40) {
      bg.moveTo(x, counterY + 10)
      bg.lineTo(x, counterY + counterHeight - 10)
    }
  }

  private drawShelves(bg: PIXI.Graphics): void {
    // Left shelf
    this.drawShelf(bg, 30, 80, 120, 150)

    // Right shelf
    this.drawShelf(bg, GAME_WIDTH - 150, 80, 120, 150)

    // Draw some items on shelves (decorative)
    this.drawShelfItems(bg)
  }

  private drawShelf(bg: PIXI.Graphics, x: number, y: number, w: number, h: number): void {
    // Shelf back
    bg.beginFill(SHOP_COLORS.shelf)
    bg.drawRect(x, y, w, h)
    bg.endFill()

    // Shelf boards
    bg.beginFill(SHOP_COLORS.shelfLight)
    bg.drawRect(x - 5, y + 40, w + 10, 6)
    bg.drawRect(x - 5, y + 90, w + 10, 6)
    bg.drawRect(x - 5, y + h - 4, w + 10, 6)
    bg.endFill()
  }

  private drawShelfItems(bg: PIXI.Graphics): void {
    // Left shelf items (potions/bottles)
    const potionColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff]

    // Row 1
    for (let i = 0; i < 3; i++) {
      this.drawPotion(bg, 45 + i * 35, 55, potionColors[i % potionColors.length])
    }

    // Row 2
    for (let i = 0; i < 3; i++) {
      this.drawPotion(bg, 45 + i * 35, 105, potionColors[(i + 2) % potionColors.length])
    }

    // Right shelf items
    for (let i = 0; i < 3; i++) {
      this.drawPotion(bg, GAME_WIDTH - 135 + i * 35, 55, potionColors[(i + 3) % potionColors.length])
    }
    for (let i = 0; i < 3; i++) {
      this.drawPotion(bg, GAME_WIDTH - 135 + i * 35, 105, potionColors[(i + 1) % potionColors.length])
    }
  }

  private drawPotion(bg: PIXI.Graphics, x: number, y: number, color: number): void {
    // Bottle
    bg.beginFill(0x888888, 0.5)
    bg.drawRect(x + 4, y, 12, 20)
    bg.endFill()

    // Liquid
    bg.beginFill(color)
    bg.drawRect(x + 5, y + 8, 10, 11)
    bg.endFill()

    // Cork
    bg.beginFill(0x8b4513)
    bg.drawRect(x + 6, y - 3, 8, 5)
    bg.endFill()
  }

  // ============================================
  // SHOPKEEPER
  // ============================================

  private drawShopkeeper(): void {
    const keeperContainer = new PIXI.Container()
    keeperContainer.x = GAME_WIDTH / 2
    keeperContainer.y = GAME_HEIGHT * 0.42

    // Draw pixel art shopkeeper (simple figure behind counter)
    const keeper = new PIXI.Graphics()

    // Body (green apron)
    keeper.beginFill(0x228822)
    keeper.drawRect(-20, 0, 40, 50)
    keeper.endFill()

    // Head
    keeper.beginFill(0xffccaa)
    keeper.drawRect(-15, -30, 30, 30)
    keeper.endFill()

    // Hair
    keeper.beginFill(0x553322)
    keeper.drawRect(-15, -35, 30, 10)
    keeper.drawRect(-17, -30, 6, 15)
    keeper.drawRect(11, -30, 6, 15)
    keeper.endFill()

    // Eyes
    keeper.beginFill(0x000000)
    keeper.drawRect(-8, -20, 4, 4)
    keeper.drawRect(4, -20, 4, 4)
    keeper.endFill()

    // Smile
    keeper.beginFill(0xcc8866)
    keeper.drawRect(-5, -10, 10, 3)
    keeper.endFill()

    // Arms
    keeper.beginFill(0xffccaa)
    keeper.drawRect(-30, 10, 12, 8)
    keeper.drawRect(18, 10, 12, 8)
    keeper.endFill()

    keeperContainer.addChild(keeper)

    // Dialogue bubble
    const bubble = new PIXI.Graphics()
    bubble.beginFill(0xffffff)
    bubble.drawRoundedRect(-150, -100, 300, 60, 8)
    bubble.endFill()

    // Bubble tail
    bubble.beginFill(0xffffff)
    bubble.moveTo(-10, -40)
    bubble.lineTo(10, -40)
    bubble.lineTo(0, -30)
    bubble.closePath()
    bubble.endFill()

    // Bubble border
    bubble.lineStyle(2, 0x333333)
    bubble.drawRoundedRect(-150, -100, 300, 60, 8)

    keeperContainer.addChild(bubble)

    // Dialogue text
    this.shopkeeperDialogue = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0x333333,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 280,
    })
    this.shopkeeperDialogue.anchor.set(0.5)
    this.shopkeeperDialogue.y = -70
    keeperContainer.addChild(this.shopkeeperDialogue)

    this.container.addChild(keeperContainer)
  }

  private setRandomGreeting(): void {
    const greeting = SHOPKEEPER_GREETINGS[Math.floor(Math.random() * SHOPKEEPER_GREETINGS.length)]
    this.setDialogue(greeting)
  }

  private setDialogue(text: string): void {
    this.shopkeeperDialogue.text = text
    this.dialogueTimer = 3
  }

  // ============================================
  // UI ELEMENTS
  // ============================================

  private createMoneyDisplay(): void {
    const panel = new PIXI.Container()
    panel.x = GAME_WIDTH - 200
    panel.y = 20

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(SHOP_COLORS.panelBg, 0.9)
    bg.lineStyle(2, SHOP_COLORS.panelBorder)
    bg.drawRoundedRect(0, 0, 180, 40, 4)
    bg.endFill()
    panel.addChild(bg)

    // Dollar sign
    const dollarSign = new PIXI.Text('$', {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fill: SHOP_COLORS.textGold,
    })
    dollarSign.x = 15
    dollarSign.y = 8
    panel.addChild(dollarSign)

    // Money amount
    this.moneyDisplay = new PIXI.Text('0', {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fill: SHOP_COLORS.textWhite,
    })
    this.moneyDisplay.x = 40
    this.moneyDisplay.y = 8
    panel.addChild(this.moneyDisplay)

    this.container.addChild(panel)
  }

  private createCategoryTabs(): void {
    const tabContainer = new PIXI.Container()
    tabContainer.x = 20
    tabContainer.y = GAME_HEIGHT * 0.65

    const tabWidth = 120
    const tabHeight = 30

    CATEGORIES.forEach((cat, i) => {
      const tab = new PIXI.Container()
      tab.x = i * (tabWidth + 5)

      // Tab background
      const bg = new PIXI.Graphics()
      bg.beginFill(i === 0 ? SHOP_COLORS.selectedBg : SHOP_COLORS.panelBg)
      bg.lineStyle(2, SHOP_COLORS.panelBorder)
      bg.drawRoundedRect(0, 0, tabWidth, tabHeight, 4)
      bg.endFill()
      tab.addChild(bg)

      // Tab text
      const text = new PIXI.Text(`${cat.icon} ${cat.name}`, {
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'bold',
        fill: i === 0 ? SHOP_COLORS.textGold : SHOP_COLORS.textGray,
      })
      text.anchor.set(0.5)
      text.x = tabWidth / 2
      text.y = tabHeight / 2
      tab.addChild(text)

      this.categoryTabs.push(tab)
      tabContainer.addChild(tab)
    })

    this.container.addChild(tabContainer)
  }

  private createItemGrid(): void {
    // This will be populated by updateCategory()
  }

  private createDescriptionPanel(): void {
    this.itemDescriptionPanel = new PIXI.Container()
    this.itemDescriptionPanel.x = GAME_WIDTH - 280
    this.itemDescriptionPanel.y = GAME_HEIGHT * 0.65

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(SHOP_COLORS.panelBg, 0.95)
    bg.lineStyle(2, SHOP_COLORS.panelBorder)
    bg.drawRoundedRect(0, 0, 260, 200, 8)
    bg.endFill()
    this.itemDescriptionPanel.addChild(bg)

    // Title placeholder
    const title = new PIXI.Text('SELECT AN ITEM', {
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'bold',
      fill: SHOP_COLORS.textGold,
    })
    title.name = 'title'
    title.x = 15
    title.y = 15
    this.itemDescriptionPanel.addChild(title)

    // Description placeholder
    const desc = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: SHOP_COLORS.textWhite,
      wordWrap: true,
      wordWrapWidth: 230,
    })
    desc.name = 'description'
    desc.x = 15
    desc.y = 45
    this.itemDescriptionPanel.addChild(desc)

    // Effect text
    const effect = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: SHOP_COLORS.textGreen,
    })
    effect.name = 'effect'
    effect.x = 15
    effect.y = 90
    this.itemDescriptionPanel.addChild(effect)

    // Level text
    const level = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: SHOP_COLORS.textGray,
    })
    level.name = 'level'
    level.x = 15
    level.y = 115
    this.itemDescriptionPanel.addChild(level)

    // Cost text
    const cost = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 'bold',
      fill: SHOP_COLORS.textGold,
    })
    cost.name = 'cost'
    cost.x = 15
    cost.y = 145
    this.itemDescriptionPanel.addChild(cost)

    // Buy prompt
    const buyPrompt = new PIXI.Text('[SPACE] to Purchase', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: SHOP_COLORS.textGray,
    })
    buyPrompt.name = 'buyPrompt'
    buyPrompt.x = 15
    buyPrompt.y = 175
    this.itemDescriptionPanel.addChild(buyPrompt)

    this.container.addChild(this.itemDescriptionPanel)
  }

  private createCursor(): void {
    this.cursor = new PIXI.Graphics()
    this.cursor.lineStyle(3, SHOP_COLORS.cursorColor)
    this.cursor.drawRoundedRect(0, 0, 200, 40, 4)
    this.cursor.visible = false
    this.container.addChild(this.cursor)
  }

  private createControlsHint(): void {
    const hint = new PIXI.Text(
      '[A/D] Category   [W/S] Item   [SPACE] Buy   [ENTER] Continue',
      {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: SHOP_COLORS.textGray,
      }
    )
    hint.anchor.set(0.5, 1)
    hint.x = GAME_WIDTH / 2
    hint.y = GAME_HEIGHT - 10
    this.container.addChild(hint)
  }

  // ============================================
  // CATEGORY & ITEMS
  // ============================================

  private updateCategory(): void {
    // Update tab visuals
    this.categoryTabs.forEach((tab, i) => {
      const bg = tab.children[0] as PIXI.Graphics
      const text = tab.children[1] as PIXI.Text

      bg.clear()
      bg.beginFill(i === this.selectedCategory ? SHOP_COLORS.selectedBg : SHOP_COLORS.panelBg)
      bg.lineStyle(2, SHOP_COLORS.panelBorder)
      bg.drawRoundedRect(0, 0, 120, 30, 4)
      bg.endFill()

      text.style.fill = i === this.selectedCategory ? SHOP_COLORS.textGold : SHOP_COLORS.textGray
    })

    // Get items for this category
    const category = CATEGORIES[this.selectedCategory].id
    this.currentItems = UpgradeManager.getUpgradesByCategory(category)

    // Reset selection
    this.selectedItem = 0

    // Rebuild item list
    this.rebuildItemList()
    this.updateItemDescription()
  }

  private rebuildItemList(): void {
    // Remove old item cards
    this.itemCards.forEach(card => card.destroy())
    this.itemCards = []

    // Create item list container
    const listContainer = new PIXI.Container()
    listContainer.x = 20
    listContainer.y = GAME_HEIGHT * 0.72

    this.currentItems.forEach((item, i) => {
      const card = this.createItemCard(item, i)
      card.y = i * 45
      this.itemCards.push(card)
      listContainer.addChild(card)
    })

    this.container.addChild(listContainer)
    this.updateCursorPosition()
  }

  private createItemCard(item: UpgradeDefinition, index: number): PIXI.Container {
    const card = new PIXI.Container()
    const currentLevel = UpgradeManager.getUpgradeLevel(item.id)
    const cost = UpgradeManager.getUpgradeCost(item.id)
    const maxed = currentLevel >= item.maxLevel

    // Background
    const bg = new PIXI.Graphics()
    bg.beginFill(index === this.selectedItem ? SHOP_COLORS.selectedBg : SHOP_COLORS.panelBg, 0.8)
    bg.drawRoundedRect(0, 0, 200, 40, 4)
    bg.endFill()
    card.addChild(bg)

    // Icon
    const icon = new PIXI.Text(item.icon, {
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold',
      fill: maxed ? SHOP_COLORS.textGray : SHOP_COLORS.textGold,
    })
    icon.x = 10
    icon.y = 10
    card.addChild(icon)

    // Name
    const name = new PIXI.Text(item.name, {
      fontFamily: 'Arial',
      fontSize: 14,
      fontWeight: 'bold',
      fill: maxed ? SHOP_COLORS.textGray : SHOP_COLORS.textWhite,
    })
    name.x = 35
    name.y = 5
    card.addChild(name)

    // Level/Max indicator
    const levelText = maxed
      ? 'MAXED'
      : `Lv.${currentLevel}/${item.maxLevel}`
    const level = new PIXI.Text(levelText, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: maxed ? SHOP_COLORS.textGreen : SHOP_COLORS.textGray,
    })
    level.x = 35
    level.y = 23
    card.addChild(level)

    // Cost
    if (!maxed) {
      const canAfford = UpgradeManager.money >= cost
      const costText = new PIXI.Text(`$${cost}`, {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: canAfford ? SHOP_COLORS.textGold : SHOP_COLORS.textRed,
      })
      costText.anchor.set(1, 0.5)
      costText.x = 190
      costText.y = 20
      card.addChild(costText)
    }

    return card
  }

  private updateItemDescription(): void {
    if (this.currentItems.length === 0) {
      return
    }

    const item = this.currentItems[this.selectedItem]
    const currentLevel = UpgradeManager.getUpgradeLevel(item.id)
    const cost = UpgradeManager.getUpgradeCost(item.id)
    const maxed = currentLevel >= item.maxLevel
    const canAfford = UpgradeManager.money >= cost

    // Update title
    const title = this.itemDescriptionPanel.getChildByName('title') as PIXI.Text
    title.text = item.name

    // Update description
    const desc = this.itemDescriptionPanel.getChildByName('description') as PIXI.Text
    desc.text = item.description

    // Update effect
    const effect = this.itemDescriptionPanel.getChildByName('effect') as PIXI.Text
    const effectValue = item.effect.isPercent
      ? `+${(item.effect.valuePerLevel * 100).toFixed(0)}%`
      : `+${item.effect.valuePerLevel}`
    effect.text = `Effect: ${effectValue} per level`

    // Update level
    const level = this.itemDescriptionPanel.getChildByName('level') as PIXI.Text
    level.text = maxed
      ? 'Level: MAX'
      : `Level: ${currentLevel} / ${item.maxLevel}`

    // Update cost
    const costText = this.itemDescriptionPanel.getChildByName('cost') as PIXI.Text
    costText.text = maxed ? 'MAXED OUT' : `Cost: $${cost}`
    costText.style.fill = maxed
      ? SHOP_COLORS.textGreen
      : canAfford
        ? SHOP_COLORS.textGold
        : SHOP_COLORS.textRed

    // Update buy prompt
    const buyPrompt = this.itemDescriptionPanel.getChildByName('buyPrompt') as PIXI.Text
    if (maxed) {
      buyPrompt.text = 'Already at max level!'
      buyPrompt.style.fill = SHOP_COLORS.textGray
    } else if (!canAfford) {
      buyPrompt.text = 'Not enough money!'
      buyPrompt.style.fill = SHOP_COLORS.textRed
    } else {
      buyPrompt.text = '[SPACE] to Purchase'
      buyPrompt.style.fill = SHOP_COLORS.textGreen
    }
  }

  private updateCursorPosition(): void {
    if (this.currentItems.length === 0) {
      this.cursor.visible = false
      return
    }

    this.cursor.visible = true
    this.cursor.x = 20
    this.cursor.y = GAME_HEIGHT * 0.72 + this.selectedItem * 45
  }

  // ============================================
  // INPUT & UPDATE
  // ============================================

  private inputCooldown: number = 0
  private lastKeyState = { w: false, s: false, a: false, d: false, space: false, enter: false }

  update(dt: number): void {
    // Update money display
    this.moneyDisplay.text = UpgradeManager.money.toString()

    // Cursor blink
    this.cursorBlink += dt
    this.cursor.alpha = 0.7 + Math.sin(this.cursorBlink * 8) * 0.3

    // Dialogue timer
    if (this.dialogueTimer > 0) {
      this.dialogueTimer -= dt
    }

    // Input cooldown
    if (this.inputCooldown > 0) {
      this.inputCooldown -= dt
      return
    }

    // Handle keyboard input
    const keys = {
      w: this.game.input.isKeyDown('KeyW') || this.game.input.isKeyDown('ArrowUp'),
      s: this.game.input.isKeyDown('KeyS') || this.game.input.isKeyDown('ArrowDown'),
      a: this.game.input.isKeyDown('KeyA') || this.game.input.isKeyDown('ArrowLeft'),
      d: this.game.input.isKeyDown('KeyD') || this.game.input.isKeyDown('ArrowRight'),
      space: this.game.input.isKeyDown('Space'),
      enter: this.game.input.isKeyDown('Enter'),
    }

    // Category navigation (A/D or Left/Right)
    if (keys.a && !this.lastKeyState.a) {
      this.selectedCategory = (this.selectedCategory - 1 + CATEGORIES.length) % CATEGORIES.length
      this.updateCategory()
      playSound('menu_select')
      this.inputCooldown = 0.15
    } else if (keys.d && !this.lastKeyState.d) {
      this.selectedCategory = (this.selectedCategory + 1) % CATEGORIES.length
      this.updateCategory()
      playSound('menu_select')
      this.inputCooldown = 0.15
    }

    // Item navigation (W/S or Up/Down)
    if (keys.w && !this.lastKeyState.w && this.currentItems.length > 0) {
      this.selectedItem = (this.selectedItem - 1 + this.currentItems.length) % this.currentItems.length
      this.rebuildItemList()
      this.updateItemDescription()
      playSound('menu_select')
      this.inputCooldown = 0.15
    } else if (keys.s && !this.lastKeyState.s && this.currentItems.length > 0) {
      this.selectedItem = (this.selectedItem + 1) % this.currentItems.length
      this.rebuildItemList()
      this.updateItemDescription()
      playSound('menu_select')
      this.inputCooldown = 0.15
    }

    // Purchase (Space)
    if (keys.space && !this.lastKeyState.space && this.currentItems.length > 0) {
      this.attemptPurchase()
      this.inputCooldown = 0.2
    }

    // Continue (Enter)
    if (keys.enter && !this.lastKeyState.enter) {
      this.continueToLevel()
    }

    this.lastKeyState = { ...keys }
  }

  private attemptPurchase(): void {
    const item = this.currentItems[this.selectedItem]
    const { canBuy, reason } = UpgradeManager.canPurchaseUpgrade(item.id)

    if (canBuy) {
      UpgradeManager.purchaseUpgrade(item.id)
      playSound('pickup')

      // Success dialogue
      const successMsg = SHOPKEEPER_PURCHASE[Math.floor(Math.random() * SHOPKEEPER_PURCHASE.length)]
      this.setDialogue(successMsg)

      // Refresh display
      this.rebuildItemList()
      this.updateItemDescription()
    } else {
      playSound('player_hurt')

      // Failure dialogue
      if (reason === 'Not enough money') {
        const failMsg = SHOPKEEPER_NO_MONEY[Math.floor(Math.random() * SHOPKEEPER_NO_MONEY.length)]
        this.setDialogue(failMsg)
      } else if (reason === 'Max level reached') {
        this.setDialogue("That one's maxed out!")
      }
    }
  }

  private continueToLevel(): void {
    playSound('menu_select')
    // Return to game at the appropriate level with data
    this.game.sceneManager.switchTo('game', {
      fromShop: true,
      level: this.nextLevel,
      room: 1
    })
  }

  destroy(): void {
    this.categoryTabs = []
    this.itemCards = []
    super.destroy()
  }
}
