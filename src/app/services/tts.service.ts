import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

@Injectable({ providedIn: 'root' })
export class TtsService {
  public isSpeaking = false;
  public currentRate = 1.0;
  private currentChunkIndex = 0;
  private textChunks: string[] = [];
  private startTime = 0;
  private pauseTimeout: any;

  constructor() {
    this.initializeTts();
  }

  private async initializeTts() {
    await this.loadPreferences();
  }

  async speak(fullText: string) {
    await this.stop();
    this.textChunks = this.chunkText(fullText);
    this.currentChunkIndex = 0;
    this.startTime = Date.now();
    this.isSpeaking = true;
    this.speakNextChunk();
  }

  private async speakNextChunk() {
    if (!this.isSpeaking || this.currentChunkIndex >= this.textChunks.length) {
      this.stop();
      return;
    }

    const chunk = this.textChunks[this.currentChunkIndex];
    try {
      await TextToSpeech.speak({
        text: chunk,
        rate: this.currentRate,
      });
      this.currentChunkIndex++;
      this.speakNextChunk();
    } catch (e) {
      console.error('Speech error:', e);
      this.stop();
    }
  }

  async pause() {
    if (this.isSpeaking) {
      this.isSpeaking = false;
      clearTimeout(this.pauseTimeout);
      await TextToSpeech.stop();
    }
  }

  async resume() {
    if (!this.isSpeaking && this.currentChunkIndex < this.textChunks.length) {
      this.isSpeaking = true;
      this.startTime = Date.now() - this.getElapsedPausedTime();
      this.speakNextChunk();
    }
  }

  async stop() {
    this.isSpeaking = false;
    clearTimeout(this.pauseTimeout);
    this.textChunks = [];
    this.currentChunkIndex = 0;
    await TextToSpeech.stop();
  }

  private getElapsedPausedTime(): number {
    return Date.now() - this.startTime;
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
