import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

@Injectable({ providedIn: 'root' })
export class TtsService {
  public isSpeaking = false;
  public currentRate = 1.0;

  constructor() {
    this.initializeTts();
  }

  private async initializeTts() {
    await this.loadPreferences();
  }

  async speak(text: string) {
    if (!text?.trim()) {
      console.error('TTS: Empty text after sanitization');
      return;
    }

    try {
      this.isSpeaking = true;

      // Split text into manageable chunks
      const chunks = this.chunkText(text);

      for (const chunk of chunks) {
        await TextToSpeech.speak({
          text: chunk,
          rate: this.currentRate,
          lang: 'en-US',
          volume: 1.0,
          pitch: 1.0,
        });

        // Add slight delay between chunks
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('TTS Error Details:', {
        error,
        textLength: text?.length,
        first50Chars: text?.substring(0, 50),
      });
    } finally {
      this.isSpeaking = false;
    }
  }

  private chunkText(text: string): string[] {
    const MAX_CHUNK_LENGTH = 300; // Android has lower limits
    const chunks = [];
    let index = 0;

    while (index < text.length) {
      let chunk = text.substring(index, index + MAX_CHUNK_LENGTH);

      // Find the last sentence boundary in the chunk
      const lastBoundary = Math.max(
        chunk.lastIndexOf('. '),
        chunk.lastIndexOf('! '),
        chunk.lastIndexOf('? '),
        chunk.lastIndexOf('\n')
      );

      if (lastBoundary > -1 && text.length - index > MAX_CHUNK_LENGTH) {
        chunk = chunk.substring(0, lastBoundary + 1);
        index += lastBoundary + 1;
      } else {
        index += MAX_CHUNK_LENGTH;
      }

      chunks.push(this.sanitizeText(chunk));
    }

    return chunks;
  }

  async stop() {
    await TextToSpeech.stop();
    this.isSpeaking = false;
  }

  setSpeed(rate: number) {
    this.currentRate = Math.min(Math.max(rate, 0.5), 2.0);
    this.savePreferences();
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/[“”‘’]/g, '"')
      .replace(/[—–]/g, '-')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async savePreferences() {
    await Preferences.set({
      key: 'tts-settings',
      value: JSON.stringify({ rate: this.currentRate }),
    });
  }

  private async loadPreferences() {
    const { value } = await Preferences.get({ key: 'tts-settings' });
    if (value) {
      const settings = JSON.parse(value);
      this.currentRate = settings.rate || 1.0;
    }
  }
}
