import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Filesystem, Directory } from '@capacitor/filesystem';
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
export class EpubReaderPage implements AfterViewInit, OnDestroy {
  @ViewChild('viewer', { static: true }) viewer!: ElementRef;
  book!: Book;
  rendition!: Rendition;
  epubPath!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    // Get the epubPath from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { epubPath: string };
    
    if (!state?.epubPath) {
      this.router.navigate(['/tabs/library']);
      return;
    }

    this.epubPath = state.epubPath;
    await this.loadEpub();
    
    // Set up keyboard navigation
    window.addEventListener('keyup', (event: KeyboardEvent) => this.onKeyUp(event));
  }

  ngOnDestroy() {
    window.removeEventListener('keyup', this.onKeyUp);
    this.book?.destroy();
  }

  private async loadEpub() {
    try {
      // Read EPUB file from Filesystem
      const file = await Filesystem.readFile({
        path: this.epubPath,
        directory: Directory.Data
      });

      // Convert base64 to ArrayBuffer
      const binaryString = atob(file.data as string);
      const buffer = new ArrayBuffer(binaryString.length);
      const view = new Uint8Array(buffer);
      
      for (let i = 0; i < binaryString.length; i++) {
        view[i] = binaryString.charCodeAt(i);
      }

      // Initialize EPUB
      this.book = ePub(buffer);
      this.rendition = this.book.renderTo(this.viewer.nativeElement, {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: 'scrolled-continuous',
        manager: 'continuous',
        allowScriptedContent: true
      });

      await this.rendition.display();
    } catch (error) {
      console.error('Error loading EPUB:', error);
      this.router.navigate(['/library']);
    }
  }

  scrollDown() {
    this.rendition?.next();
  }

  scrollUp() {
    this.rendition?.prev();
  }

  private onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.scrollUp();
        break;
      case 'ArrowRight':
        this.scrollDown();
        break;
    }
  }
}