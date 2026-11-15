/**
 * Tiny procedural ambience engine.
 *
 * The archive intentionally ships without audio files — wind and the low titan
 * rumble are synthesised with WebAudio noise so the site stays lightweight and
 * licence-free. The rumble swells with the 3D stage progress.
 */
export class AmbienceEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private rumbleGain: GainNode | null = null
  private windGain: GainNode | null = null
  private started = false

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 3
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    }
    return buffer
  }

  async start() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      this.ctx = new Ctor()
      const ctx = this.ctx

      this.master = ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(ctx.destination)

      const buffer = this.createNoiseBuffer(ctx)

      // Wind: looping noise through a slowly swept lowpass.
      const wind = ctx.createBufferSource()
      wind.buffer = buffer
      wind.loop = true
      const windFilter = ctx.createBiquadFilter()
      windFilter.type = 'lowpass'
      windFilter.frequency.value = 620
      windFilter.Q.value = 0.6
      this.windGain = ctx.createGain()
      this.windGain.gain.value = 0.18
      wind.connect(windFilter).connect(this.windGain).connect(this.master)
      wind.start()

      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.07
      lfoGain.gain.value = 240
      lfo.connect(lfoGain).connect(windFilter.frequency)
      lfo.start()

      // Rumble: band-passed noise plus a sub oscillator.
      const rumble = ctx.createBufferSource()
      rumble.buffer = buffer
      rumble.loop = true
      const rumbleFilter = ctx.createBiquadFilter()
      rumbleFilter.type = 'lowpass'
      rumbleFilter.frequency.value = 95
      this.rumbleGain = ctx.createGain()
      this.rumbleGain.gain.value = 0.05
      rumble.connect(rumbleFilter).connect(this.rumbleGain).connect(this.master)
      rumble.start()

      const sub = ctx.createOscillator()
      sub.type = 'sine'
      sub.frequency.value = 38
      const subGain = ctx.createGain()
      subGain.gain.value = 0.06
      sub.connect(subGain).connect(this.master)
      sub.start()
    }

    if (this.ctx.state === 'suspended') await this.ctx.resume()
    this.master?.gain.cancelScheduledValues(this.ctx.currentTime)
    this.master?.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 1.2)
    this.started = true
  }

  stop() {
    if (!this.ctx || !this.master) return
    this.master.gain.cancelScheduledValues(this.ctx.currentTime)
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6)
    this.started = false
  }

  /** stage progress 0–1 → rumble weight */
  setIntensity(progress: number) {
    if (!this.ctx || !this.rumbleGain || !this.windGain) return
    const rumble = 0.03 + Math.pow(progress, 2.4) * 0.5
    const wind = 0.2 - progress * 0.1
    this.rumbleGain.gain.setTargetAtTime(rumble, this.ctx.currentTime, 0.4)
    this.windGain.gain.setTargetAtTime(wind, this.ctx.currentTime, 0.6)
  }

  get isStarted() {
    return this.started
  }
}

export const ambience = new AmbienceEngine()
