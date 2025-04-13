// components/file-upload/file-upload.component.ts
import { Component } from '@angular/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { EpubParserService } from '../services/epub-parser.service';
import { IonicModule } from '@ionic/angular';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-file-upload',
  template: `
    <ion-button (click)="pickEpubFiles()">
      <ion-icon name="document-attach"></ion-icon>
      Add EPUB Files
    </ion-button>
  `,
  standalone: true,
  imports: [IonButton, IonIcon],
})
export class FileUploadComponent {
  errorMessage = '';

  constructor(private epubParser: EpubParserService) {}
  // components/file-upload/file-upload.component.ts
  async pickEpubFiles() {
    this.errorMessage = '';

    try {
      const result = await FilePicker.pickFiles({
        types: ['application/epub+zip'],
        readData: true, // Ensure we get file data
      });

      for (const file of result.files) {
        try {
          if (file.path) {
            // Handle via file path
            await this.epubParser.processEpub(file.path, file.name);
          } else if (file.blob) {
            // Handle via blob data
            console.log('success');
            const base64 = await this.blobToBase64(file.blob);
            console.log('blob success');
            await this.epubParser.processEpubFromData(base64, file.name);
            console.log('parse success');
          } else {
            console.log('No valid file data found');
          }
        } catch (e: any) {
          console.log(`Failed to process ${file.name}: ${e.message}`);
        }
      }
    } catch (error) {
      console.log('File selection canceled or failed');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
