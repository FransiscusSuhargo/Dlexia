// models/book.ts
export interface Book {
    path: string;         // Filesystem path like "epubs/12345_book.epub"
    metadata: {
      title: string;
      author: string;
      coverImage?: string;
    };
    addedDate: string;    // Store as ISO string for JSON serialization
  }