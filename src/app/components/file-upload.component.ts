// components/file-upload/file-upload.component.ts
import { Component } from '@angular/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { EpubParserService } from '../services/epub-parser.service';

@Component({
  selector: 'app-file-upload',
  template: `
    <ion-button (click)="pickEpubFiles()">
      <ion-icon name="document-attach"></ion-icon>
      Add EPUB Files
    </ion-button>
    
    <!-- Error display -->
    <ion-text color="danger" *ngIf="errorMessage">
      {{ errorMessage }}
    </ion-text>
  `
})
export class FileUploadComponent {
  errorMessage = '';

  constructor(private epubParser: EpubParserService) {}

  async pickEpubFiles() {
    this.errorMessage = '';
    
    try {
      const result = await FilePicker.pickFiles({
        types: ['application/epub+zip'],
        readData: true,
      });

      for (const file of result.files) {
        const filePath = file.path;
        
        if (typeof filePath !== 'string') {
          this.errorMessage = `Invalid file path for ${file.name}`;
          continue;
        }

        try {
          await this.epubParser.processEpub(filePath);
        } catch (e) {
          this.errorMessage = `Failed to process ${file.name}: ${e instanceof Error ? e.message : 'Unknown error'}`;
        }
      }
    } catch (error) {
      this.errorMessage = 'File selection canceled or failed';
    }
  }
}