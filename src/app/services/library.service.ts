// services/library.service.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Book } from '../models/book';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private storage: Storage | null = null;
  private readonly STORAGE_KEY = 'EPUB_LIBRARY';

  constructor(private ionicStorage: Storage) {
    this.initialize();
  }

  private async initialize() {
    this.storage = await this.ionicStorage.create();
  }

  async getLibrary(): Promise<Book[]> {
    return (await this.storage?.get(this.STORAGE_KEY)) || [];
  }

  async addToLibrary(book: Book) {
    const library = await this.getLibrary();
    library.push(book);
    await this.storage?.set(this.STORAGE_KEY, library);
  }

  async removeBook(path: string) {
    const library = await this.getLibrary();
    const filtered = library.filter(book => book.path !== path);
    await this.storage?.set(this.STORAGE_KEY, filtered);
  }
}