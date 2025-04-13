import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class TtsService {
  private synth = window.speechSynthesis;
  public isSpeaking = false;
  public voices: SpeechSynthesisVoice[] = [];

  // Public settings for direct template binding
  public settings = {
    rate: 1,
    pitch: 1,
    volume: 1,
    voiceIndex: 0,
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadVoices();
    await this.loadPreferences();

    // Refresh voices when changed
    this.synth.onvoiceschanged = () => this.loadVoices();
  }

  private async loadVoices() {
    this.voices = this.synth.getVoices();
    if (this.voices.length === 0) {
      await new Promise(
        (resolve) =>
          (this.synth.onvoiceschanged = () =>
            resolve((this.voices = this.synth.getVoices())))
      );
    }
  }

  async speak(text: string) {
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voices[this.settings.voiceIndex];
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    this.synth.speak(utterance);
    this.isSpeaking = true;

    utterance.onend = () => (this.isSpeaking = false);
  }

  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
  }

  setVoice(index: number) {
    if (index >= 0 && index < this.voices.length) {
      this.settings.voiceIndex = index;
      this.savePreferences();
    }
  }

  setSpeed(rate: number) {
    this.settings.rate = rate;
    this.savePreferences();
  }

  private async savePreferences() {
    await Preferences.set({
      key: 'tts-settings',
      value: JSON.stringify(this.settings),
    });
  }

  private async loadPreferences() {
    const { value } = await Preferences.get({ key: 'tts-settings' });
    if (value) {
      this.settings = JSON.parse(value);
    }
  }
}
