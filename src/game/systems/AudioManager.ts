/**
 * Audio Manager with procedural retro sound generation
 * Uses Web Audio API to create 8-bit style sound effects
 */

type SoundType =
  | 'shoot'
  | 'shoot_laser'
  | 'shoot_shotgun'
  | 'enemy_hit'
  | 'enemy_death'
  | 'player_hurt'
  | 'player_death'
  | 'pickup'
  | 'pickup_weapon'
  | 'pickup_health'
  | 'pickup_powerup'
  | 'explosion'
  | 'boss_hit'
  | 'boss_death'
  | 'boss_attack'
  | 'shield_hit'
  | 'room_clear'
  | 'level_complete'
  | 'menu_select'

interface SoundConfig {
  type: OscillatorType
  frequency: number
  frequencyEnd?: number
  duration: number
  volume: number
  attack?: number
  decay?: number
  vibrato?: number
  vibratoSpeed?: number
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  // Player weapons
  shoot: {
    type: 'square',
    frequency: 600,
    frequencyEnd: 200,
    duration: 0.1,
    volume: 0.3,
  },
  shoot_laser: {
    type: 'sawtooth',
    frequency: 800,
    frequencyEnd: 400,
    duration: 0.15,
    volume: 0.25,
    vibrato: 20,
    vibratoSpeed: 30,
  },
  shoot_shotgun: {
    type: 'sawtooth',
    frequency: 200,
    frequencyEnd: 50,
    duration: 0.2,
    volume: 0.4,
  },

  // Enemy sounds
  enemy_hit: {
    type: 'square',
    frequency: 400,
    frequencyEnd: 200,
    duration: 0.05,
    volume: 0.2,
  },
  enemy_death: {
    type: 'sawtooth',
    frequency: 300,
    frequencyEnd: 50,
    duration: 0.25,
    volume: 0.3,
  },

  // Player sounds
  player_hurt: {
    type: 'square',
    frequency: 200,
    frequencyEnd: 100,
    duration: 0.2,
    volume: 0.4,
  },
  player_death: {
    type: 'sawtooth',
    frequency: 400,
    frequencyEnd: 50,
    duration: 0.5,
    volume: 0.5,
  },

  // Pickups
  pickup: {
    type: 'sine',
    frequency: 500,
    frequencyEnd: 800,
    duration: 0.15,
    volume: 0.3,
  },
  pickup_weapon: {
    type: 'square',
    frequency: 400,
    frequencyEnd: 800,
    duration: 0.2,
    volume: 0.3,
  },
  pickup_health: {
    type: 'sine',
    frequency: 600,
    frequencyEnd: 900,
    duration: 0.2,
    volume: 0.3,
  },
  pickup_powerup: {
    type: 'square',
    frequency: 300,
    frequencyEnd: 600,
    duration: 0.3,
    volume: 0.35,
    vibrato: 10,
    vibratoSpeed: 15,
  },

  // Effects
  explosion: {
    type: 'sawtooth',
    frequency: 150,
    frequencyEnd: 30,
    duration: 0.4,
    volume: 0.5,
  },

  // Boss sounds
  boss_hit: {
    type: 'square',
    frequency: 300,
    frequencyEnd: 150,
    duration: 0.1,
    volume: 0.35,
  },
  boss_death: {
    type: 'sawtooth',
    frequency: 500,
    frequencyEnd: 20,
    duration: 1.0,
    volume: 0.6,
    vibrato: 30,
    vibratoSpeed: 10,
  },
  boss_attack: {
    type: 'square',
    frequency: 150,
    frequencyEnd: 300,
    duration: 0.3,
    volume: 0.35,
  },

  // Shield
  shield_hit: {
    type: 'sine',
    frequency: 800,
    frequencyEnd: 400,
    duration: 0.15,
    volume: 0.3,
  },

  // Room/Level
  room_clear: {
    type: 'square',
    frequency: 400,
    frequencyEnd: 800,
    duration: 0.4,
    volume: 0.4,
  },
  level_complete: {
    type: 'square',
    frequency: 300,
    frequencyEnd: 900,
    duration: 0.6,
    volume: 0.5,
  },

  // Menu
  menu_select: {
    type: 'square',
    frequency: 500,
    frequencyEnd: 600,
    duration: 0.1,
    volume: 0.25,
  },
}

export class AudioManager {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private enabled: boolean = true
  private volume: number = 0.7

  constructor() {
    this.initContext()
  }

  private initContext(): void {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.context.createGain()
      this.masterGain.gain.value = this.volume
      this.masterGain.connect(this.context.destination)
    } catch (e) {
      console.warn('Web Audio API not supported:', e)
      this.enabled = false
    }
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      await this.context.resume()
    }
  }

  /**
   * Play a sound effect
   */
  play(sound: SoundType): void {
    if (!this.enabled || !this.context || !this.masterGain) return

    // Resume context if suspended
    if (this.context.state === 'suspended') {
      this.context.resume()
    }

    const config = SOUND_CONFIGS[sound]
    if (!config) return

    const now = this.context.currentTime

    // Create oscillator
    const oscillator = this.context.createOscillator()
    oscillator.type = config.type

    // Create gain for envelope
    const gainNode = this.context.createGain()

    // Connect: oscillator -> gain -> master
    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    // Set frequency sweep
    oscillator.frequency.setValueAtTime(config.frequency, now)
    if (config.frequencyEnd) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(config.frequencyEnd, 1),
        now + config.duration
      )
    }

    // Add vibrato if configured
    if (config.vibrato && config.vibratoSpeed) {
      const vibratoOsc = this.context.createOscillator()
      const vibratoGain = this.context.createGain()
      vibratoOsc.frequency.value = config.vibratoSpeed
      vibratoGain.gain.value = config.vibrato
      vibratoOsc.connect(vibratoGain)
      vibratoGain.connect(oscillator.frequency)
      vibratoOsc.start(now)
      vibratoOsc.stop(now + config.duration)
    }

    // Envelope
    const attack = config.attack || 0.01
    const decay = config.decay || config.duration - attack
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(config.volume, now + attack)
    gainNode.gain.linearRampToValueAtTime(0, now + attack + decay)

    // Start and stop
    oscillator.start(now)
    oscillator.stop(now + config.duration + 0.1)
  }

  /**
   * Play a noise burst (for explosions, hits)
   */
  playNoise(duration: number = 0.2, volume: number = 0.3): void {
    if (!this.enabled || !this.context || !this.masterGain) return

    if (this.context.state === 'suspended') {
      this.context.resume()
    }

    const now = this.context.currentTime
    const bufferSize = this.context.sampleRate * duration
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate)
    const data = buffer.getChannelData(0)

    // Fill with noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) // Decay
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer

    const gainNode = this.context.createGain()
    gainNode.gain.setValueAtTime(volume, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    // Low-pass filter for more "thump"
    const filter = this.context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1000

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.masterGain)

    source.start(now)
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume
    }
  }

  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if audio is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

// Singleton instance
let instance: AudioManager | null = null

export function getAudioManager(): AudioManager {
  if (!instance) {
    instance = new AudioManager()
  }
  return instance
}

// Convenience function
export function playSound(sound: SoundType): void {
  getAudioManager().play(sound)
}

export function playNoise(duration?: number, volume?: number): void {
  getAudioManager().playNoise(duration, volume)
}
