export interface Book {
    path: string;
    metadata: {
      title: string;
      author: string;
      coverImage?: string;
      language?: string;
    };
    addedDate: Date;
  }