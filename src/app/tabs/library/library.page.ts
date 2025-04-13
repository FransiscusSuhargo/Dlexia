import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonThumbnail, 
  IonLabel, 
  IonButtons,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { FileUploadComponent } from 'src/app/components/file-upload.component';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { LibraryService } from 'src/app/services/library.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book'; // Ensure this interface exists
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-library',
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    CommonModule,
    IonicModule,
    IonButtons,
    IonSpinner,
    IonIcon,
    FileUploadComponent,
    BookCardComponent
  ]
})
export class LibraryPage implements OnInit {
  books: Book[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private libraryService: LibraryService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadLibrary();
  }

  async loadLibrary() {
    try {
      const rawBooks = await Preferences.get({ key: 'EPUB_LIBRARY' });
      console.log('Raw library data:', rawBooks.value);
      
      this.books = await this.libraryService.getLibrary();
      console.log('Parsed books:', this.books);
      
      this.books = await this.libraryService.getLibrary();
      this.books.sort((a, b) => 
        new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()

      );
    } catch (error) {
      console.log('Failed to load library');
      console.error('Library load error:', error);
    } finally {
      this.loading = false;
    }
  }

// Update openBook
async openBook(book: Book) {
  this.router.navigate(['/reader'], {
    state: {
      epubPath: book.path,
      metadata: book.metadata
    }
  });
}

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-cover.jpg';
  }
}