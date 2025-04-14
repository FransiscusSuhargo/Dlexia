import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import {
  DetectImageOptions,
  TextDetectionResult,
  CapacitorPluginMlKitTextRecognition,
} from '@pantrist/capacitor-plugin-ml-kit-text-recognition';
import { DocumentScanner } from 'capacitor-document-scanner';
import { Capacitor } from '@capacitor/core';
import { IonicModule } from '@ionic/angular';

//untuk TTS
import { TtsService } from '../../services/tts.service';
import { ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
  standalone: true,
  imports: [IonContent, IonicModule, IonHeader, IonTitle, IonToolbar]
})
export class ScannerPage implements ViewWillLeave{
  detectedText = ""; 
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

  //untuk TTS
  async toggleTts() {
    if (this.tts.isSpeaking) {
      await this.tts.stop();
    } else {
      const cleanText = this.detectedText
        .replace(/\n+/g, '. ') // Convert newlines to pauses
        .replace(/\s+/g, ' '); // Remove extra spaces
      await this.tts.speak(cleanText);
    }
  }
  
  updateSpeed(event: CustomEvent) {
    this.tts.setSpeed(event.detail.value);
  }

  ionViewWillLeave() {
    // Stop TTS when leaving page
    if (this.tts.isSpeaking) {
      this.tts.stop();
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

  // async takePicture() {
  //   try {
  //     const image = await Camera.getPhoto({
  //       quality: 75,
  //       source: CameraSource.Camera,
  //       resultType: CameraResultType.Base64, // Use Base64 to get the image data
  //     });

  //     if (image.base64String) {
  //       await this.recognizeText(image.base64String); // Pass base64 string
  //     } else {
  //       console.error('Error: Image does not contain base64 data.');
  //     }
  //   } catch (error) {
  //     console.error('Error taking picture:', error);
  //   }
  // }
  constructor(public tts: TtsService) {}
}
