/**
 * Web Audio API ambient sound synthesizer.
 * Generates cozy ambient office sounds without external network requests.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isAmbiencePlaying = false;
  private typingInterval: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play a clean, soft notification chime (e.g. for task completion or timer finish)
   */
  public playChime(success = true) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      if (success) {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.22); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
      } else {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.2);
      }

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Ignore audio context auto-play restrictions before user gesture
    }
  }

  /**
   * Play a subtle mechanical keyboard key-click
   */
  public playKeyClick() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // safe fallback
    }
  }

  /**
   * Toggle cozy office ambience (filtered soft pink noise + gentle cafe hum)
   */
  public toggleAmbience(enable?: boolean): boolean {
    this.initContext();
    if (!this.ctx) return false;

    const shouldPlay = enable !== undefined ? enable : !this.isAmbiencePlaying;

    if (shouldPlay) {
      if (this.isAmbiencePlaying) return true;

      // Create pink/brown noise for cozy rain / soft office air
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter for warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start();
      this.noiseNode = noiseSource;
      this.gainNode = gain;
      this.isAmbiencePlaying = true;

      // Occasional random cozy typing bursts
      this.typingInterval = window.setInterval(() => {
        if (Math.random() > 0.4) {
          const clicks = 2 + Math.floor(Math.random() * 4);
          for (let i = 0; i < clicks; i++) {
            setTimeout(() => this.playKeyClick(), i * (90 + Math.random() * 80));
          }
        }
      }, 4000);

      return true;
    } else {
      if (this.noiseNode) {
        try {
          (this.noiseNode as AudioBufferSourceNode).stop();
        } catch {
          // ignore
        }
        this.noiseNode = null;
      }
      if (this.typingInterval) {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
      }
      this.isAmbiencePlaying = false;
      return false;
    }
  }

  public isPlaying(): boolean {
    return this.isAmbiencePlaying;
  }
}

export const soundFx = new SoundSynthesizer();
