// services/library.service.ts
import { Injectable } from '@angular/core';
import { Book } from '../models/book';
import { Preferences } from '@capacitor/preferences';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly STORAGE_KEY = 'EPUB_LIBRARY';

  // services/library.service.ts
  async getLibrary(): Promise<Book[]> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Storage error:', error);
      return [];
    }
  }

  // Add initialization
  private storageReady = Promise.resolve();

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await Preferences.get({ key: this.STORAGE_KEY });
    } catch (error) {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify([]),
      });
    }
  }

  // In library.service.ts
  async listActualFiles() {
    try {
      const files = await Filesystem.readdir({
        path: 'epubs',
        directory: Directory.Data,
      });
      console.log('Actual stored files:', files);
    } catch (error) {
      console.log('No files found');
    }
  }

  async addToLibrary(book: Omit<Book, 'addedDate'>) {
    const library = await this.getLibrary();
    library.push({
      ...book,
      addedDate: new Date().toISOString(), // Store as ISO string
    });

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(library),
    });

    await this.listActualFiles();
  }

  async removeBook(path: string) {
    const library = await this.getLibrary();
    const filtered = library.filter((b) => b.path !== path);

    // Delete actual file
    await Filesystem.deleteFile({
      path,
      directory: Directory.Data,
    });

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(filtered),
    });
  }
}
