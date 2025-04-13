import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonTextarea,
  IonRange,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { TtsService } from '../../services/tts.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonTextarea,
    IonRange,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>TTS Test</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-textarea
          [(ngModel)]="text"
          placeholder="Enter text to speak"
          autoGrow
        ></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-range
          [ngModel]="tts.settings.rate"
          (ionChange)="handleSpeedChange($event)"
          min="0.5"
          max="2"
          step="0.1"
        >
          <ion-label slot="start">Speed: {{ tts.settings.rate }}</ion-label>
        </ion-range>
      </ion-item>

      <ion-item>
        <ion-select
          [ngModel]="tts.settings.voiceIndex"
          (ionChange)="tts.setVoice($event.detail.value)"
        >
          <ion-select-option
            *ngFor="let voice of tts.voices; let i = index"
            [value]="i"
          >
            {{ voice.name }} ({{ voice.lang }})
          </ion-select-option>
        </ion-select>
      </ion-item>

      <ion-button
        expand="block"
        (click)="tts.isSpeaking ? tts.stop() : tts.speak(text)"
      >
        {{ tts.isSpeaking ? 'Stop' : 'Speak' }}
      </ion-button>
    </ion-content>
  `,
})
export class TestPagePage {
  text = 'Hello, this is a test of text-to-speech functionality.';

  constructor(public tts: TtsService) {}

  handleSpeedChange(event: Event) {
    const customEvent = event as CustomEvent<{ value: number }>;
    this.tts.setSpeed(customEvent.detail.value);
  }
}
