import { Component, EventEmitter, Output } from '@angular/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { EpubParserService } from '../services/epub-parser.service';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { LibraryService } from '../services/library.service';

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
  @Output() filesProcessed = new EventEmitter<void>();
  errorMessage = '';

  constructor(
    private epubParser: EpubParserService,
    private libraryService: LibraryService // Add service injection
  ) {}

  async pickEpubFiles() {
    this.errorMessage = '';

    try {
      const result = await FilePicker.pickFiles({
        types: ['application/epub+zip'],
        readData: true,
      });

      for (const file of result.files) {
        try {
          let bookData;
          
          if (file.path) {
            // Handle native file path
            bookData = await this.epubParser.processEpub(file.path, file.name);
          } else if (file.blob) {
            // Handle web file blob
            const base64 = await this.blobToBase64(file.blob);
            bookData = await this.epubParser.processEpubFromData(base64, file.name);
          }

          if (bookData) {
            await this.libraryService.addToLibrary(bookData);
            console.log('Added book:', bookData.metadata.title);
          }
        } catch (e: any) {
          console.error(`Failed to process ${file.name}:`, e);
        }
      }

      this.filesProcessed.emit(); // Notify parent to refresh
    } catch (error) {
      console.log('File selection canceled or failed');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read blob as base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}