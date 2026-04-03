class AudioSystem {
  private static context: AudioContext | null = null;

  static init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    this.init();
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  static playSuccess() {
    this.playTone(523.25, 0.1);
    setTimeout(() => this.playTone(659.25, 0.15), 100);
  }

  static playError() {
    this.playTone(200, 0.2, 'sawtooth');
  }

  static playClick() {
    this.playTone(800, 0.05, 'square');
  }

  static playVictory() {
    const notes = [523.25, 587.33, 659.25, 783.99];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2), i * 150);
    });
  }
}

export default AudioSystem;
