// Simple Web Audio API keyboard clack synthesizer
// Synthesizes realistic mechanical keyboard clacks on keystrokes and ambient hall noises
class KeyboardAudio {
  private ctx: AudioContext | null = null;
  private ambientEnabled: boolean = false;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private lastNoiseVal = 0;
  private typingTimeout: any = null;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch (e) {
        console.warn("AudioContext not supported browser.", e);
      }
    }
  }

  playClack(isSpaceOrEnter: boolean = false) {
    this.init();
    if (!this.ctx) return;
    
    // Resume context if suspended (browser security blocks audio until click)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Create oscillator and bandpass filter to shape the clack sound
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Use a triangle or sine wave mixed with noise for the click sound
    osc.type = isSpaceOrEnter ? 'triangle' : 'sine';
    
    // Space/Enter is deeper, normal keys are higher pitch clacks
    const baseFreq = isSpaceOrEnter ? 180 : 350 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, now);
    // Dynamic pitch bend downwards for clicks
    osc.frequency.exponentialRampToValueAtTime(baseFreq / 2, now + 0.05);

    // Apply high pass filter to remove low rumbling, boost punch
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isSpaceOrEnter ? 400 : 1200, now);
    filter.Q.setValueAtTime(4, now);

    // Exponential Decay envelope (shorter for normal keys, slightly longer for space)
    const decayDuration = isSpaceOrEnter ? 0.08 : 0.04;
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + decayDuration);

    // Connect nodes
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // Play and stop
    osc.start(now);
    osc.stop(now + decayDuration);
  }

  // Generate continuous exam hall ambience + distant typing noises
  toggleAmbient(enabled: boolean) {
    this.init();
    if (!this.ctx) return;

    this.ambientEnabled = enabled;

    if (enabled) {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      // Create continuous AC / room murmur with low-pass brown noise
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (this.lastNoiseVal + (0.02 * white)) / 1.02;
          this.lastNoiseVal = output[i];
          output[i] *= 3.5;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 350;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.35; // Gentle murmur

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      
      this.noiseNode.start();

      // Initiate random muffled typing sounds loop
      this.scheduleRandomTap();

    } else {
      // Disconnect and clean up
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
    }
  }

  private scheduleRandomTap() {
    if (!this.ambientEnabled || !this.ctx) return;

    // Play a single random muffled tap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200 + Math.random() * 300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.03);

    filter.type = 'lowpass';
    filter.frequency.value = 500 + Math.random() * 500; // very muffled high end

    gain.gain.setValueAtTime(0.01 + Math.random() * 0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.03);

    // Schedule next
    this.typingTimeout = setTimeout(() => {
      this.scheduleRandomTap();
    }, 40 + Math.random() * 350); // fast chaotic spacing reflecting a room of people
  }
}

export const keyboardSound = new KeyboardAudio();
