import * as PIXI from 'pixi.js'

/**
 * Pixel Art Sprite Generator
 *
 * All sprites use a consistent pixel grid with a limited color palette.
 * Base unit: 1 pixel = 1 canvas pixel (scaled up by PIXI)
 *
 * Standard sizes:
 * - Regular entities: 32x32
 * - Large enemies: 32x40
 * - Bosses: 48x48 or 48x56
 * - Projectiles: 8x8 to 16x16
 * - Pickups: 16x16
 */

// ============================================================================
// COLOR PALETTE - 16 unified colors for consistent look
// ============================================================================
const PALETTE = {
  // Skin tones
  skin: '#FFCCAA',
  skinDark: '#DDAA88',
  skinShadow: '#BB8866',

  // Hair colors
  hairBrown: '#553322',
  hairBlack: '#222222',
  hairGray: '#888888',
  hairWhite: '#CCCCCC',

  // Clothing - Player
  flannel: '#CC3333',
  flannelDark: '#AA2222',
  jeans: '#4466AA',
  jeansDark: '#335588',

  // Clothing - Enemies/Officials
  suitNavy: '#223355',
  suitNavyLight: '#334466',
  suitBlack: '#1A1A1A',
  suitGray: '#444444',
  suitBrown: '#665544',

  // Accents
  shirtWhite: '#FFFFFF',
  tieRed: '#CC0000',
  tieBlue: '#2244AA',

  // Objects
  paper: '#EEEEEE',
  paperLines: '#AAAAAA',
  wood: '#885533',
  woodDark: '#664422',
  metal: '#666666',
  metalDark: '#444444',
  gold: '#FFCC00',

  // Effects
  black: '#000000',
  shadow: '#00000066',

  // Projectiles
  bulletYellow: '#FFFF00',
  bulletOrange: '#FF8800',
  bulletRed: '#FF4444',
  bulletCyan: '#00FFFF',
  bulletGreen: '#44FF44',
  bulletPurple: '#FF44FF',
  laserPink: '#FF00FF',

  // Pickups
  healthRed: '#FF0000',
  healthPink: '#FF8888',
  moneyGreen: '#22AA22',
  moneyLight: '#44CC44',
  powerOrange: '#FF8800',
  powerYellow: '#FFCC00',
  shieldBlue: '#4488FF',
  shieldLight: '#88BBFF',
}

// ============================================================================
// PIXEL DRAWING HELPERS
// ============================================================================

/**
 * Draw a single pixel (actually a 1x1 rectangle)
 */
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, 1, 1)
}

/**
 * Draw a rectangle of pixels
 */
function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

/**
 * Draw multiple pixels from a pattern array
 * Pattern is an array of strings where each character represents a color
 */
function drawPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pattern: string[],
  colorMap: Record<string, string>
): void {
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      const char = pattern[row][col]
      if (char !== ' ' && char !== '.') {
        const color = colorMap[char]
        if (color) {
          px(ctx, x + col, y + row, color)
        }
      }
    }
  }
}

// ============================================================================
// SPRITE GENERATOR CLASS
// ============================================================================

export class SpriteGenerator {
  private static cache: Map<string, PIXI.Texture> = new Map()

  // ==========================================================================
  // PLAYER SPRITE - John Q. Public (32x32)
  // ==========================================================================
  static generatePlayerSprite(): PIXI.Texture {
    const key = 'player'
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    // Color map for pattern
    const colors: Record<string, string> = {
      'H': PALETTE.hairBrown,    // Hair
      'S': PALETTE.skin,         // Skin
      's': PALETTE.skinDark,     // Skin shadow
      'E': PALETTE.black,        // Eyes
      'M': PALETTE.skinShadow,   // Mouth
      'R': PALETTE.flannel,      // Red flannel
      'r': PALETTE.flannelDark,  // Flannel shadow
      'W': PALETTE.shirtWhite,   // White undershirt
      'J': PALETTE.jeans,        // Jeans
      'j': PALETTE.jeansDark,    // Jeans shadow
      'B': PALETTE.wood,         // Brown shoes
    }

    // 32x32 pixel art pattern
    const pattern = [
      '                                ',
      '                                ',
      '          HHHHHHHH              ',
      '         HHHHHHHHHH             ',
      '         HHsSSSSsHH             ',
      '         HsSSSSSSsH             ',
      '          SSSSSSSS              ',
      '          SEESSEESS             ',
      '          SSSSSSSS              ',
      '          SSMMMSS               ',
      '           SSSS                 ',
      '          WWWWWW                ',
      '         RRWWWWrRR              ',
      '        RRRrWWrRRRR             ',
      '        RRRrrrRRRRR             ',
      '       sRRRRRRRRRRRs            ',
      '       SRRRRRRRRRRRS            ',
      '       SRRRRRRRRRRRs            ',
      '        RRRRRRRRRR              ',
      '        RRRRRRRRRR              ',
      '         JJJJJJJJ               ',
      '         JJJjjJJJ               ',
      '         JJJjjJJJ               ',
      '         JJJ  JJJ               ',
      '         JJJ  JJJ               ',
      '         JJj  jJJ               ',
      '         BBB  BBB               ',
      '         BBB  BBB               ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  // ==========================================================================
  // ENEMY SPRITES (32x32)
  // ==========================================================================
  static generateEnemySprite(type: string): PIXI.Texture {
    const key = `enemy_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    switch (type) {
      case 'intern':
        this.drawIntern(ctx)
        break
      case 'bureaucrat':
        this.drawBureaucrat(ctx)
        break
      case 'irs_agent':
        this.drawIRSAgent(ctx)
        break
      case 'secret_service':
        this.drawSecretService(ctx)
        break
      case 'lobbyist':
        this.drawLobbyist(ctx)
        break
      case 'camera_drone':
        this.drawCameraDrone(ctx)
        break
      default:
        // Fallback - red square
        rect(ctx, 8, 8, 16, 16, '#FF0000')
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  private static drawIntern(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairBlack,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': PALETTE.black,
      'G': PALETTE.suitGray,
      'g': '#333333',
      'W': PALETTE.shirtWhite,
      'T': PALETTE.tieRed,
      'P': PALETTE.paper,
      'B': PALETTE.black,
    }

    const pattern = [
      '                                ',
      '                                ',
      '          HHHHHH                ',
      '         HHHHHHHH               ',
      '          SSSSSS                ',
      '          SSSSSS                ',
      '          SEESSE                ',
      '          SSSSSS                ',
      '           SSSS                 ',
      '          WWWWWW                ',
      '         GGWTTWgGG              ',
      '         GGGTTGGGG              ',
      '        PGGGGGGGGP              ',
      '        PGGGTTGGGP              ',
      '        PGGGTTGGGP              ',
      '         GGGGGGGG               ',
      '        sGGGGGGGGs              ',
      '         GGGGGGGG               ',
      '          GGGGGG                ',
      '          GG  GG                ',
      '          GG  GG                ',
      '          gg  gg                ',
      '          BB  BB                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawBureaucrat(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairGray,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': PALETTE.black,
      'L': '#88AACC', // Glasses lens
      'F': PALETTE.black, // Glasses frame
      'N': PALETTE.suitNavy,
      'n': PALETTE.suitNavyLight,
      'W': PALETTE.shirtWhite,
      'T': PALETTE.tieBlue,
      'P': PALETTE.paper,
      'p': PALETTE.paperLines,
      'B': PALETTE.black,
    }

    const pattern = [
      '                                ',
      '         HHHHHHHH               ',
      '        H  HHHH  H              ',
      '        H SSSSSS H              ',
      '          SSSSSS                ',
      '         FLLFFLLF               ',
      '         FLEEFLEE               ',
      '          SSSSSS                ',
      '          SsssS                 ',
      '           SSSS                 ',
      '          WWWWWW                ',
      '         NNWTTWNNN              ',
      '        PNNNTTNNNNP             ',
      '        PNNNTTNNNNP             ',
      '        pNNNNNNNNNp             ',
      '        pNNNNNNNNNp             ',
      '         NNNNNNNN               ',
      '        sNNNNNNNNs              ',
      '         NNNNNNNN               ',
      '          NNNNNN                ',
      '          NN  NN                ',
      '          NN  NN                ',
      '          nn  nn                ',
      '          BB  BB                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawIRSAgent(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairBlack,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': PALETTE.black,
      'L': '#446688',
      'F': PALETTE.black,
      'K': PALETTE.suitBlack,
      'k': '#111111',
      'W': PALETTE.shirtWhite,
      'T': PALETTE.tieRed,
      'C': PALETTE.wood, // Clipboard
      'c': PALETTE.paper,
      'B': PALETTE.black,
    }

    const pattern = [
      '                                ',
      '                                ',
      '          HHHHHH                ',
      '         HHHHHHHH               ',
      '         H SSSS H               ',
      '          SSSSSS                ',
      '         FLLEELLF               ',
      '          SSSSSS                ',
      '          SsssS                 ',
      '           SSSS                 ',
      '          WWWWWW                ',
      '         KKWTTWKKK              ',
      '         KKKTTKKKKCC            ',
      '         KKKTTKKKKCc            ',
      '         KKKKKKKKKCc            ',
      '         KKKKKKKKK              ',
      '        sKKKKKKKKKs             ',
      '         KKKKKKKKK              ',
      '          KKKKKK                ',
      '          KK  KK                ',
      '          KK  KK                ',
      '          kk  kk                ',
      '          BB  BB                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawSecretService(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairBlack,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'G': PALETTE.black, // Sunglasses
      'g': '#1A1A3A',
      'K': PALETTE.suitBlack,
      'k': '#0A0A0A',
      'W': PALETTE.shirtWhite,
      'E': '#333333', // Earpiece
      'e': '#222222',
      'U': PALETTE.metalDark, // Gun
      'B': PALETTE.black,
    }

    const pattern = [
      '                                ',
      '                                ',
      '          HHHHHH                ',
      '         HHHHHHHH               ',
      '          SSSSSS                ',
      '          SSSSSSE               ',
      '         GGGGGGGGe              ',
      '         gGGggGGge              ',
      '          SSSSSS                ',
      '           SSSS                 ',
      '          WWWWWW                ',
      '         KKWWWWKKK              ',
      '         KKKKKKKKK              ',
      '         KKKKKKKKKU             ',
      '         KKKKKKKKKUU            ',
      '         KKKKKKKKK              ',
      '        sKKKKKKKKKs             ',
      '         KKKKKKKKK              ',
      '          KKKKKK                ',
      '          KK  KK                ',
      '          KK  KK                ',
      '          kk  kk                ',
      '          BB  BB                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawLobbyist(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairBrown,
      'h': '#443322',
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': PALETTE.black,
      'N': PALETTE.suitBrown,
      'n': '#554433',
      'W': PALETTE.shirtWhite,
      'T': PALETTE.tieRed,
      'M': PALETTE.moneyGreen,
      'm': PALETTE.moneyLight,
      'G': PALETTE.gold,
      'B': PALETTE.wood,
    }

    const pattern = [
      '                                ',
      '                                ',
      '          HHHHHH                ',
      '         hHHHHHHh               ',
      '         h SSSS h               ',
      '          SSSSSS                ',
      '          SEESSE                ',
      '          SSSSSS                ',
      '          SsssS                 ',
      '           SSSS                 ',
      '          WWWWWW                ',
      '         NNWTTWNNN              ',
      '        MNNNTTNNNNG             ',
      '        mNNNTTNNNNG             ',
      '        mNNNNNNNNN              ',
      '         NNNNNNNNG              ',
      '        sNNNNNNNNsG             ',
      '         NNNNNNNN               ',
      '          NNNNNN                ',
      '          NN  NN                ',
      '          NN  NN                ',
      '          nn  nn                ',
      '          BB  BB                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawCameraDrone(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'D': PALETTE.metalDark,
      'd': PALETTE.metal,
      'P': '#666666', // Propeller blur
      'L': '#2244AA', // Camera lens
      'l': '#4466CC',
      'R': '#FF0000', // Red LED
      'G': '#00FF00', // Green LED
      'B': PALETTE.black,
    }

    const pattern = [
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '       PPP      PPP             ',
      '      PPPPP    PPPPP            ',
      '       DDD      DDD             ',
      '        DD      DD              ',
      '        DDDDDDDDDD              ',
      '        DDDDDDDDDD              ',
      '       RDDDDDDDDDDG             ',
      '       DDddddddddDD             ',
      '       DDddddddddDD             ',
      '       DDddddddddDD             ',
      '        DDDDDDDDDD              ',
      '        DDDDDDDDDD              ',
      '          BBBBB                 ',
      '         BLLLlLB                ',
      '         BLLllLB                ',
      '         BLlllLB                ',
      '          BBBBB                 ',
      '        DD      DD              ',
      '       DDD      DDD             ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
      '                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  // ==========================================================================
  // BOSS SPRITES (48x48)
  // ==========================================================================
  static generateBossSprite(type: string): PIXI.Texture {
    const key = `boss_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    canvas.width = 48
    canvas.height = 48
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    switch (type) {
      case 'irs_commissioner':
        this.drawIRSCommissioner(ctx)
        break
      case 'senator':
      case 'senator_navy':
        this.drawSenator(ctx, 'navy')
        break
      case 'senator_charcoal':
        this.drawSenator(ctx, 'charcoal')
        break
      case 'speaker':
        this.drawSpeaker(ctx)
        break
      case 'vice_president':
        this.drawVicePresident(ctx)
        break
      case 'president':
        this.drawPresident(ctx)
        break
      default:
        rect(ctx, 8, 8, 32, 32, '#AA0000')
        rect(ctx, 12, 12, 24, 24, '#FF0000')
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  private static drawIRSCommissioner(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairGray,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'f': '#FFAA88', // Flushed skin
      'E': PALETTE.black,
      'L': '#88AACC',
      'F': PALETTE.black,
      'W': PALETTE.shirtWhite,
      'w': '#DDDDDD',
      'T': PALETTE.tieRed,
      't': '#AA0000',
      'X': '#333333', // Suspenders
      'P': PALETTE.paper,
      'p': PALETTE.paperLines,
      'C': PALETTE.wood,
      'D': '#00AAFF', // Sweat
      'K': PALETTE.suitBlack,
      'B': PALETTE.black,
    }

    const pattern = [
      '                                                ',
      '              HHHHHHHHHH                        ',
      '             H  HHHHHH  H                       ',
      '            H  ffffffff  H                      ',
      '               ffffffff                         ',
      '               ffffffff                         ',
      '              FLLFFLLF                          ',
      '             DFLEEFLEEF                         ',
      '             DfffffffffffD                      ',
      '              fffsssfff D                       ',
      '               ffffffff                         ',
      '              WWWWWWWWWW                        ',
      '             XWWWWWWWWWWX                       ',
      '            sXWWWTTWWWWXs                       ',
      '            sWWWWTTWWWWWs                       ',
      '            SWWWWTTTWWWWSCC                     ',
      '            SWWWWTTTWWWWSCPp                    ',
      '            SWWWWTTTWWWWS CPp                   ',
      '            sWWWWWWWWWWWs                       ',
      '             XWWWWWWWWWX                        ',
      '             XWWWWWWWWWX                        ',
      '              WWWWWWWWW                         ',
      '              WWWWWWWWW                         ',
      '               WWWWWWW                          ',
      '              KKKKKKKKKK                        ',
      '              KKK    KKK                        ',
      '              KKK    KKK                        ',
      '              KKK    KKK                        ',
      '              KKK    KKK                        ',
      '              BBB    BBB                        ',
      '              BBB    BBB                        ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawSenator(ctx: CanvasRenderingContext2D, variant: 'navy' | 'charcoal'): void {
    const suitMain = variant === 'navy' ? '#223355' : '#3A3A3A'
    const suitLight = variant === 'navy' ? '#334466' : '#4A4A4A'
    const tie = variant === 'navy' ? PALETTE.tieRed : PALETTE.tieBlue

    const colors: Record<string, string> = {
      'H': PALETTE.hairGray,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': PALETTE.black,
      'N': suitMain,
      'n': suitLight,
      'W': PALETTE.shirtWhite,
      'T': tie,
      'G': PALETTE.gold, // Flag pin
      'R': '#CC0000',
      'U': '#0000AA',
      'P': PALETTE.paper,
      'M': '#FFFFFF', // Teeth
      'B': PALETTE.black,
    }

    const pattern = [
      '                                                ',
      '                                                ',
      '              HHHHHHHHHH                        ',
      '             HHHHHHHHHHHH                       ',
      '            HH SSSSSSSS HH                      ',
      '            H  SSSSSSSS  H                      ',
      '               SSSSSSSS                         ',
      '               SEESSEES                         ',
      '               SSSSSSSS                         ',
      '               SSMMMMS                          ',
      '                SSSSSS                          ',
      '               WWWWWWWW                         ',
      '             nNNWWTTWWNNn                       ',
      '            GNNNNWTTWNNNNN                      ',
      '            RNNNNNTTNNNNN                       ',
      '            UNNNNNTTNNNNN                       ',
      '            NNNNNNTTNNNNN                       ',
      '           sNNNNNNNNNNNNNs                      ',
      '           SNNNNNNNNNNNNS                       ',
      '            NNNNNNNNNNNN                        ',
      '             NNNNNNNNNN                         ',
      '              NNNNNNNN                          ',
      '              NNN  NNN                          ',
      '              NNN  NNN                          ',
      '              NNN  NNN                          ',
      '              NNN  NNN                          ',
      '              nnn  nnn                          ',
      '              BBB  BBB                          ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawSpeaker(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': '#4A3A2A',
      'h': '#5A4A3A',
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': PALETTE.black,
      'L': '#88AACC',
      'F': PALETTE.black,
      'N': PALETTE.suitNavy,
      'n': PALETTE.suitNavyLight,
      'W': PALETTE.shirtWhite,
      'T': '#8B0000',
      'P': PALETTE.wood, // Podium
      'p': PALETTE.woodDark,
      'G': PALETTE.gold, // Gavel
      'g': '#DDAA00',
      'A': '#FFD700', // Seal
      'B': PALETTE.black,
    }

    const pattern = [
      '                                                ',
      '                                                ',
      '              HhHHHHHhH                         ',
      '             HHHHHHHHHHH                        ',
      '            HH SSSSSSSS HH                      ',
      '            H  SSSSSSSS  H                      ',
      '               SSSSSSSS                         ',
      '              FLLFFLLF                          ',
      '              FLEEFLEE                          ',
      '               SSssSSS                          ',
      '                SSSS                            ',
      '              WWWWWWWW                          ',
      '             NNWWWWWWNN              GGG        ',
      '             NNNWTTWNN              gGGGg       ',
      '             NNNNTTNNNN              GGG        ',
      '             NNNNTTNNNN               G         ',
      '            sNNNNNNNNNNs              G         ',
      '            SNNNNNNNNNNSG            sG         ',
      '             NNNNNNNNNNG              G         ',
      '             pppppppppp               G         ',
      '            pPPPPPPPPPPp                        ',
      '            pPPPAAAAPPPp                        ',
      '            pPPPAAAAPPPp                        ',
      '            pPPPPPPPPPPp                        ',
      '            pPPPPPPPPPPp                        ',
      '            pppppppppppp                        ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawVicePresident(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairWhite,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': PALETTE.black,
      'K': PALETTE.suitBlack,
      'k': '#111111',
      'W': PALETTE.shirtWhite,
      'T': PALETTE.tieBlue,
      'G': PALETTE.gold,
      'g': '#DDAA00',
      'M': '#FFFFFF',
      'B': PALETTE.black,
    }

    const pattern = [
      '                                                ',
      '                                                ',
      '              HHHHHHHHHH                        ',
      '             HHHHHHHHHHHH                       ',
      '            HH SSSSSSSS HH                      ',
      '            H  SSSSSSSS  H                      ',
      '               SSSSSSSS                         ',
      '               SEESSEES                         ',
      '               SSSSSSSS                         ',
      '               SSMMMMS                          ',
      '                SSSSSS                          ',
      '               WWWWWWWW                         ',
      '             GKKWWTTWWKK                        ',
      '             gKKWWTTWWKK                        ',
      '              KKKKTTKKKK                        ',
      '              KKKKTTKKKK                        ',
      '              KKKKTTKKKK                        ',
      '             sKKKKKKKKKKs                       ',
      '             SKKKKKKKKKKS                       ',
      '              KKKKKKKKKK                        ',
      '               KKKKKKKK                         ',
      '                KKKKKK                          ',
      '               KKK  KKK                         ',
      '               KKK  KKK                         ',
      '               KKK  KKK                         ',
      '               KKK  KKK                         ',
      '               kkk  kkk                         ',
      '               BBB  BBB                         ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawPresident(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'H': PALETTE.hairGray,
      'S': PALETTE.skin,
      's': PALETTE.skinDark,
      'E': '#2A4A6A',
      'e': PALETTE.black,
      'K': PALETTE.suitBlack,
      'k': '#0A0A0A',
      'W': PALETTE.shirtWhite,
      'T': '#AA0000',
      't': '#880000',
      'G': PALETTE.gold,
      'g': '#DDAA00',
      'M': '#FFFFFF',
      'R': '#CC0000', // Flag
      'U': '#0000AA',
      'F': '#8B4513', // Flag pole
      'B': PALETTE.black,
    }

    const pattern = [
      '                                                ',
      '    F                                    F      ',
      '    FRRU                                URRFP   ',
      '    FRRUW                              WURRFP   ',
      '    F             HHHHHHHHHH              F     ',
      '    F            HHHHHHHHHHHH             F     ',
      '    F           HH SSSSSSSS HH            F     ',
      '    F           H  SSSSSSSS  H            F     ',
      '                   SSSSSSSS                     ',
      '                   SEeeSEeS                     ',
      '                   SSSSSSSS                     ',
      '                   SSMMMMS                      ',
      '                    SSSSSS                      ',
      '                   WWWWWWWW                     ',
      '                 GKKWWTTWWKKG                   ',
      '                 gKKWWTTWWKKg                   ',
      '                  KKKKtTKKKK                    ',
      '                  KKKKtTKKKK                    ',
      '                  KKKKTTKKKK                    ',
      '                 sKKKKKKKKKKs                   ',
      '                 SKKKKKKKKKKS                   ',
      '                  KKKKKKKKKK                    ',
      '                   KKKKKKKK                     ',
      '                    KKKKKK                      ',
      '                   KKK  KKK                     ',
      '                   KKK  KKK                     ',
      '                   KKK  KKK                     ',
      '                   KKK  KKK                     ',
      '                   kkk  kkk                     ',
      '                   BBB  BBB                     ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
      '                                                ',
    ]

    drawPattern(ctx, 0, 0, pattern, colors)
  }

  // ==========================================================================
  // PROJECTILE SPRITES (8x8 to 16x16)
  // ==========================================================================
  static generateProjectileSprite(type: string): PIXI.Texture {
    const key = `projectile_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    switch (type) {
      case 'wrench':
        canvas.width = 16
        canvas.height = 16
        this.drawWrenchProjectile(ctx)
        break
      case 'pistol':
        canvas.width = 8
        canvas.height = 8
        this.drawBulletProjectile(ctx, PALETTE.bulletYellow, '#FFFFFF')
        break
      case 'shotgun':
        canvas.width = 6
        canvas.height = 6
        this.drawBulletProjectile(ctx, PALETTE.bulletOrange, PALETTE.bulletYellow)
        break
      case 'rapidfire':
        canvas.width = 6
        canvas.height = 6
        this.drawBulletProjectile(ctx, PALETTE.bulletCyan, '#FFFFFF')
        break
      case 'laser':
        canvas.width = 24
        canvas.height = 6
        this.drawLaserProjectile(ctx)
        break
      case 'spread':
        canvas.width = 8
        canvas.height = 8
        this.drawBulletProjectile(ctx, PALETTE.bulletGreen, '#AAFFAA')
        break
      case 'enemy_pistol':
        canvas.width = 6
        canvas.height = 6
        this.drawBulletProjectile(ctx, PALETTE.bulletRed, '#FF8888')
        break
      case 'paperwork':
        canvas.width = 12
        canvas.height = 12
        this.drawPaperProjectile(ctx)
        break
      case 'audit_beam':
        canvas.width = 32
        canvas.height = 8
        this.drawBeamProjectile(ctx, '#FF0000', '#FFFF00')
        break
      case 'drone_shot':
        canvas.width = 6
        canvas.height = 6
        this.drawBulletProjectile(ctx, PALETTE.bulletPurple, '#FF88FF')
        break
      default:
        canvas.width = 6
        canvas.height = 6
        rect(ctx, 1, 1, 4, 4, '#FFFFFF')
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  private static drawWrenchProjectile(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'M': PALETTE.metal,
      'm': PALETTE.metalDark,
      'H': '#888888',
    }
    const pattern = [
      '                ',
      '     mmmm       ',
      '    mMMMMm      ',
      '    mMHHMm      ',
      '     mMMm       ',
      '      mm        ',
      '      MM        ',
      '      MM        ',
      '      MM        ',
      '      MM        ',
      '     mMMm       ',
      '    mMHHMm      ',
      '    mMMMMm      ',
      '     mmmm       ',
      '                ',
      '                ',
    ]
    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawBulletProjectile(ctx: CanvasRenderingContext2D, main: string, highlight: string): void {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    // Outer
    rect(ctx, 1, 1, w - 2, h - 2, main)
    // Highlight
    rect(ctx, 1, 1, Math.floor(w / 2) - 1, Math.floor(h / 2) - 1, highlight)
  }

  private static drawLaserProjectile(ctx: CanvasRenderingContext2D): void {
    rect(ctx, 0, 1, 24, 4, PALETTE.laserPink)
    rect(ctx, 0, 2, 24, 2, '#FFFFFF')
  }

  private static drawPaperProjectile(ctx: CanvasRenderingContext2D): void {
    rect(ctx, 1, 1, 10, 10, PALETTE.paper)
    rect(ctx, 2, 3, 6, 1, PALETTE.paperLines)
    rect(ctx, 2, 5, 5, 1, PALETTE.paperLines)
    rect(ctx, 2, 7, 7, 1, PALETTE.paperLines)
  }

  private static drawBeamProjectile(ctx: CanvasRenderingContext2D, edge: string, center: string): void {
    rect(ctx, 0, 0, 32, 8, edge)
    rect(ctx, 0, 2, 32, 4, center)
    rect(ctx, 0, 3, 32, 2, '#FFFFFF')
  }

  // ==========================================================================
  // PICKUP SPRITES (16x16)
  // ==========================================================================
  static generatePickupSprite(type: string): PIXI.Texture {
    const key = `pickup_${type}`
    if (this.cache.has(key)) return this.cache.get(key)!

    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    switch (type) {
      case 'tax_refund_small':
        this.drawMoneyPickup(ctx, false)
        break
      case 'tax_refund_large':
        this.drawMoneyPickup(ctx, true)
        break
      case 'health':
        this.drawHealthPickup(ctx)
        break
      case 'damage_boost':
        this.drawPowerPickup(ctx, PALETTE.powerOrange, PALETTE.powerYellow)
        break
      case 'spread_boost':
        this.drawPowerPickup(ctx, PALETTE.bulletCyan, '#88FFFF')
        break
      case 'shield':
        this.drawShieldPickup(ctx)
        break
      case 'extra_life':
        this.drawHeartPickup(ctx)
        break
      case 'weapon_pistol':
      case 'weapon_shotgun':
      case 'weapon_rapidfire':
      case 'weapon_laser':
      case 'weapon_spread':
        this.drawWeaponPickup(ctx)
        break
      default:
        rect(ctx, 2, 2, 12, 12, '#FFFFFF')
    }

    const texture = PIXI.Texture.from(canvas)
    this.cache.set(key, texture)
    return texture
  }

  private static drawMoneyPickup(ctx: CanvasRenderingContext2D, large: boolean): void {
    const colors: Record<string, string> = {
      'G': PALETTE.moneyGreen,
      'g': PALETTE.moneyLight,
      'W': '#FFFFFF',
    }
    const pattern = large ? [
      '                ',
      '   GGGGGGGG     ',
      '  GGggggggGG    ',
      '  GgGGGGGGgG    ',
      '  GgGWWWWGgG    ',
      '  GgGWWWWGgG    ',
      '  GgGWWWWGgG    ',
      '  GgGGGGGGgG    ',
      '  GGggggggGG    ',
      '   GGGGGGGGG    ',
      '    GGGGGGGG    ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
    ] : [
      '                ',
      '                ',
      '    GGGGGG      ',
      '   GGggggGG     ',
      '   GgGGGGgG     ',
      '   GgGWWGgG     ',
      '   GgGWWGgG     ',
      '   GgGGGGgG     ',
      '   GGggggGG     ',
      '    GGGGGG      ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
    ]
    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawHealthPickup(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'R': PALETTE.healthRed,
      'W': '#FFFFFF',
    }
    const pattern = [
      '                ',
      '                ',
      '      RR        ',
      '     RWWR       ',
      '     RWWR       ',
      '   RRWWWWRR     ',
      '  RWWWWWWWWR    ',
      '  RWWWWWWWWR    ',
      '   RRWWWWRR     ',
      '     RWWR       ',
      '     RWWR       ',
      '      RR        ',
      '                ',
      '                ',
      '                ',
      '                ',
    ]
    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawPowerPickup(ctx: CanvasRenderingContext2D, main: string, light: string): void {
    // Star shape
    rect(ctx, 7, 2, 2, 4, main)
    rect(ctx, 7, 10, 2, 4, main)
    rect(ctx, 2, 7, 4, 2, main)
    rect(ctx, 10, 7, 4, 2, main)
    rect(ctx, 5, 5, 6, 6, main)
    rect(ctx, 6, 6, 4, 4, light)
  }

  private static drawShieldPickup(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'B': PALETTE.shieldBlue,
      'b': PALETTE.shieldLight,
    }
    const pattern = [
      '                ',
      '                ',
      '    BBBBBB      ',
      '   BBbbbbBB     ',
      '   BbBBBBbB     ',
      '   BbBBBBbB     ',
      '   BbBBBBbB     ',
      '   BBbbbbBB     ',
      '    BBBBBB      ',
      '     BBBB       ',
      '      BB        ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
    ]
    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawHeartPickup(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'R': '#FF4488',
      'r': '#FF88AA',
    }
    const pattern = [
      '                ',
      '                ',
      '   RR    RR     ',
      '  RrrR  RrrR    ',
      '  RrrrRRrrrR    ',
      '  RrrrrrrrrR    ',
      '   RrrrrrrrR    ',
      '    RrrrrR      ',
      '     RrrR       ',
      '      RR        ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
    ]
    drawPattern(ctx, 0, 0, pattern, colors)
  }

  private static drawWeaponPickup(ctx: CanvasRenderingContext2D): void {
    const colors: Record<string, string> = {
      'W': PALETTE.wood,
      'w': PALETTE.woodDark,
      'Y': PALETTE.bulletYellow,
    }
    const pattern = [
      '                ',
      '                ',
      '   wwwwwwww     ',
      '  wWWWWWWWWw    ',
      '  wWYYYYYWWw    ',
      '  wWYYYYYWWw    ',
      '  wWWWWWWWWw    ',
      '   wwwwwwww     ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
      '                ',
    ]
    drawPattern(ctx, 0, 0, pattern, colors)
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================
  static clearCache(): void {
    this.cache.forEach((texture) => texture.destroy(true))
    this.cache.clear()
  }
}
