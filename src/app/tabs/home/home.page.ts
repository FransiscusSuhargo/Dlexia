import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { BrowserModule } from '@angular/platform-browser';
import { CapacitorPluginMlKitTextRecognition, DetectImageOptions, TextDetectionResult } from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { DocumentScanner } from 'capacitor-document-scanner';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonicModule,
    BrowserModule,
  ],
})
export class HomePage {
  detectedText = ""; 
  test(){
    console.log('test');
  }
  async recognizeText(base64Image: string) {
    try {
      const options: DetectImageOptions = {
        base64Image: base64Image,
        rotation: 0,
      };

      const result: TextDetectionResult =
        await CapacitorPluginMlKitTextRecognition.detectText(options);
        this.detectedText = result.blocks.map((block) => block.text).join("\n\n");
    } catch (error) {
      console.error('Error recognizing text:', error);
    }
  }

  async scanDocument() {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument();

      if (scannedImages && scannedImages.length > 0) {
        const scannedImagePath = scannedImages[0];
        const scannedImageElement = document.getElementById(
          'scannedImage'
        ) as HTMLImageElement;

        if (scannedImageElement) {
          // Display scanned image
          scannedImageElement.src = Capacitor.convertFileSrc(scannedImagePath);

          // Fetch the image and convert it to a Blob
          const response = await fetch(scannedImageElement.src);
          const blob = await response.blob();


          const dataUrl = await this.blobToBase64(blob);
          // dataUrl = "data:image/jpeg;base64,/9j/4AAQ..."

          if (dataUrl.startsWith('data:image')) {
            const rawBase64 = dataUrl.split(',')[1]; // => "/9j/4AAQ..."
            await this.recognizeText(rawBase64);
          } else {
            console.error('Data URL not recognized:', dataUrl);
          }
        } else {
          console.error('Element with ID "scannedImage" not found.');
        }
      } else {
        console.warn('No images were scanned.');
      }
    } catch (error) {
      console.error('Error scanning document:', error);
    }
  }

  // Helper function to convert Blob to Base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reject(new Error('Failed to convert blob to base64.'));
      };
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob); // This returns a data URL that includes the base64 data
    });
  }
  constructor() {}
}
