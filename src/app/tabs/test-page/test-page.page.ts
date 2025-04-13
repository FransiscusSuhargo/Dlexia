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
