// book-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Book } from '../../models/book';
import { IonItem, IonThumbnail, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-card',
  template: `
    <ion-item (click)="openBook()">
      <ion-thumbnail slot="start">
        <img [src]="book.metadata.coverImage || 'assets/default-cover.png'" />
      </ion-thumbnail>
      <ion-label>
        <h2>{{ book.metadata.title }}</h2>
        <p>{{ book.metadata.author }}</p>
      </ion-label>
    </ion-item>
  `,
  standalone: true,
  imports: [IonItem, IonThumbnail, IonLabel, CommonModule],
})
// book-card.component.ts
export class BookCardComponent {
  @Input() book!: Book;
  @Output() selected = new EventEmitter<Book>();

  constructor(private router: Router) {} // Proper DI

  openBook() {
    this.selected.emit(this.book);
  }
}
