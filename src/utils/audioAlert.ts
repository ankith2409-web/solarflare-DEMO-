class AudioAlert {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChirp() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15); // E6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now); // A4
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.2); // E5

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn('Web Audio API is blocked or not supported by the browser:', e);
    }
  }

  playSiren() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Alternating high-low alarm sweep
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.25);
      osc.frequency.linearRampToValueAtTime(500, now + 0.5);
      osc.frequency.linearRampToValueAtTime(800, now + 0.75);
      osc.frequency.linearRampToValueAtTime(500, now + 1.0);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.8);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn('Web Audio API is blocked or not supported:', e);
    }
  }
}

export const audioAlert = new AudioAlert();
