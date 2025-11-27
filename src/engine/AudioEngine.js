class AudioEngine {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)()
    this.masterGain = this.context.createGain()
    this.masterGain.gain.value = 0.3
    this.masterGain.connect(this.context.destination)
  }

  // 8-bit style jump sound
  playJump() {
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.frequency.setValueAtTime(400, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.1)

    gain.gain.setValueAtTime(0.3, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.context.currentTime + 0.1)
  }

  // 8-bit style land sound
  playLand() {
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.frequency.setValueAtTime(200, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.05)

    gain.gain.setValueAtTime(0.2, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.context.currentTime + 0.05)
  }

  // 8-bit style attack sound
  playAttack() {
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(800, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.08)

    gain.gain.setValueAtTime(0.25, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.context.currentTime + 0.08)
  }

  // 8-bit style hit sound
  playHit() {
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(150, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.15)

    gain.gain.setValueAtTime(0.35, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.context.currentTime + 0.15)
  }

  // 8-bit style powerup sound
  playPowerup() {
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(400, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.1)
    osc.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.2)

    gain.gain.setValueAtTime(0.3, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.context.currentTime + 0.3)
  }

  // 8-bit style death sound
  playDeath() {
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, this.context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.5)

    gain.gain.setValueAtTime(0.4, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.context.currentTime + 0.5)
  }

  // Background music loop (8-bit style melody)
  playBackgroundMusic() {
    const notes = [
      { freq: 261.63, time: 0 },    // C4
      { freq: 329.63, time: 0.25 },  // E4
      { freq: 392.00, time: 0.5 },   // G4
      { freq: 523.25, time: 0.75 },  // C5
      { freq: 392.00, time: 1.0 },   // G4
      { freq: 329.63, time: 1.25 },  // E4
    ]

    notes.forEach(note => {
      const osc = this.context.createOscillator()
      const gain = this.context.createGain()

      osc.type = 'square'
      osc.frequency.value = note.freq

      gain.gain.setValueAtTime(0, this.context.currentTime + note.time)
      gain.gain.linearRampToValueAtTime(0.05, this.context.currentTime + note.time + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + note.time + 0.2)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(this.context.currentTime + note.time)
      osc.stop(this.context.currentTime + note.time + 0.25)
    })
  }
}

export default AudioEngine
