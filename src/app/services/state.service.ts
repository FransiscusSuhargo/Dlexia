// services/state.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly BOOK_KEY = 'current_epub_path';

  // In state.service.ts
  async getCurrentBook(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.BOOK_KEY });
      return value;
    } catch (error) {
      console.error('Error retrieving book path:', error);
      return null;
    }
  }

  async setCurrentBook(path: string): Promise<void> {
    try {
      if (!path) throw new Error('Invalid path');
      await Preferences.set({ key: this.BOOK_KEY, value: path });
    } catch (error) {
      console.error('Error saving book path:', error);
      throw error;
    }
  }

  async clearCurrentBook(): Promise<void> {
    await Preferences.remove({ key: this.BOOK_KEY });
  }
}
