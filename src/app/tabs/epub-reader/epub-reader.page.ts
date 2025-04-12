import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import ePub, { Book, Rendition } from 'epubjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-epub-reader',
  templateUrl: './epub-reader.page.html',
  styleUrls: ['./epub-reader.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class EpubReaderPage implements AfterViewInit {
  @ViewChild('viewer', { static: true }) viewer!: ElementRef;
  book!: Book;
  rendition!: Rendition;
  ngAfterViewInit() {
    window.addEventListener('keyup', (event: KeyboardEvent) => this.onKeyUp(event));
    this.book = ePub('assets/books/sample.epub'); // Make sure this file exists

    this.rendition = this.book.renderTo(this.viewer.nativeElement, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'scrolled-continuous',
      manager: 'continuous', 
      allowScriptedContent: true,
    });
    this.rendition.display();
    // Assuming `rendition` is an instance of the EPUB.js rendition object
  }

  scrollDown() {
    this.rendition.next();
    console.log('down');
  }
  scrollUp() {
    this.rendition.prev();
    console.log('up');
  }

  onKeyUp(event: KeyboardEvent) {
    const kc = event.keyCode || event.which;
    console.log('Key pressed:', kc);
    if (kc === 37) {
      this.scrollUp();
    } else if (kc === 39) {
      this.scrollDown();
    }
    // Add more conditions for other keys if needed
  }
}
