import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  HostBinding,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Filesystem, Directory } from '@capacitor/filesystem';
import ePub, { Book, Rendition, Contents } from 'epubjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TtsService } from 'src/app/services/tts.service';

@Component({
  selector: 'app-standalone-epub-reader',
  templateUrl: './standalone-epub-reader.page.html',
  styleUrls: ['./standalone-epub-reader.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class StandaloneEpubReaderPage implements AfterViewInit, OnDestroy {
  @ViewChild('viewer', { static: true }) viewer!: ElementRef;
  @HostBinding('class.with-tts-padding') get ttsPadding() {
    return this.showTtsControls;
  }

  book!: Book;
  rendition!: Rendition;
  epubPath!: string;

  // TTS related properties
  currentText: string = '';
  showTtsControls = false;
  private currentRsvpIndex = 0; // Add this line
  private currentWordIndex = 0;
  private words: string[] = [];
  private wordElements: Element[] = [];
  private highlightInterval: any;
  private speechStartTime = 0;
  rsvpActive = false;
  rsvpPaused = true;
  currentRsvpWord = '';
  public rsvpWords: string[] = [];
  private rsvpTimeout: any;
  rsvpSpeed = 300; // Default speed in words per minute

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public tts: TtsService
  ) {}

  async checkTtsEngine() {
    const engines = await (window as any).tts.getEngines();
    if (!engines.some((e: any) => e.name.includes('Google'))) {
      console.log('NO TTS Engine');
    }
  }
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
    window.addEventListener('keyup', (event: KeyboardEvent) =>
      this.onKeyUp(event)
    );
  }

  ngOnDestroy() {
    window.removeEventListener('keyup', this.onKeyUp);
    this.tts.stop();
    this.book?.destroy();
  }

  private async loadEpub() {
    try {
      // Read EPUB file from Filesystem
      const file = await Filesystem.readFile({
        path: this.epubPath,
        directory: Directory.Data,
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
        allowScriptedContent: true,
      });

      // Replace the existing rendered handler in your component with this:
      // Update the rendered handler with correct types
      this.rendition.on('rendered', (section: Contents) => {
        this.extractText();
      });

      this.rendition.hooks.content.register((frame: any) => {
        const doc = frame.document as Document;
        const style = doc.createElement('style');
        style.textContent = `
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('assets/fonts/OpenDyslexic-Regular.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
          }
          body * {
            font-family: 'OpenDyslexic', sans-serif !important;
            line-height: 1.6 !important;
            letter-spacing: 0.1em !important;
          }
        `;
        doc.head.appendChild(style);
      });

      await this.rendition.display();
    } catch (error) {
      console.error('Error loading EPUB:', error);
      this.router.navigate(['/library']);
    }
  }

  extractText() {
    try {
      this.words = [];
      this.wordElements = [];
      this.currentText = '';

      // Get contents as an array of documents
      const contents = this.rendition.getContents() as unknown as Array<{
        document: Document;
      }>;

      if (contents?.length > 0) {
        let fullText = '';

        contents.forEach((content: { document: Document }) => {
          const doc = content.document;
          const textElements = doc.querySelectorAll(
            'p, h1, h2, h3, h4, h5, h6, span, div'
          );

          textElements.forEach((el: Element) => {
            // Create tree walker using the content document
            const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const textNodes: Node[] = [];

            while (walker.nextNode()) {
              textNodes.push(walker.currentNode);
            }

            textNodes.forEach((textNode) => {
              const text = textNode.textContent?.trim();
              if (text) {
                // Add to full text
                fullText += text + ' ';

                // Split words with whitespace preservation
                const words = text.split(/(\s+)/);
                words.forEach((word) => {
                  if (word.trim()) {
                    this.words.push(word);
                    this.wordElements.push(textNode.parentElement || el);
                  } else if (word) {
                    // Preserve whitespace-only words
                    this.words.push(word);
                    this.wordElements.push(textNode.parentElement || el);
                  }
                });
              }
            });
          });
        });

        this.currentText = fullText.trim();
        // console.log('Extracted text:', this.currentText);
        console.log('Word count:', this.words.length);
        console.log('Elements count:', this.wordElements.length);
      }
    } catch (error) {
      console.error('Text extraction failed:', error);
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

  // Add these properties to your component
  ttsState: 'stopped' | 'playing' | 'paused' = 'stopped';
  rsvpState: 'stopped' | 'playing' | 'paused' = 'stopped';

  // Modified TTS methods
  // In your component class
  async toggleTts() {
    try {
      if (this.ttsState === 'stopped') {
        this.ttsState = 'playing';
        await this.playTts();
      } else if (this.ttsState === 'playing') {
        this.ttsState = 'paused';
        await this.tts.pause();
      } else {
        this.ttsState = 'playing';
        await this.tts.resume();
      }
    } catch (e) {
      this.ttsState = 'stopped';
      console.error('TTS Error:', e);
    }
  }

  private async playTts() {
    if (!this.currentText) return;

    try {
      await this.tts.speak(this.currentText);
      // Automatically update state when finished
      if (this.ttsState === 'playing') {
        this.ttsState = 'stopped';
      }
    } catch (e) {
      this.ttsState = 'stopped';
      throw e;
    }
  }
  // Modified RSVP methods
  toggleRsvp() {
    console.log('Toggle RSVP');

    if (this.rsvpState === 'stopped') {
      this.startRsvp();
      this.rsvpState = 'playing';
    } else {
      this.rsvpState = 'stopped';
    }
  }

  // Add this method for RSVP playback control
  toggleRsvpPlayback() {
    if (this.rsvpState === 'playing') {
      this.pauseRsvp();
      this.rsvpState = 'paused';
    } else {
      this.resumeRsvp();
      this.rsvpState = 'playing';
    }
  }

  private resumeRsvp() {
    this.rsvpPaused = false;
    this.rsvpState = 'playing';
    this.showNextRsvpWord();
  }

  private pauseRsvp() {
    this.rsvpPaused = true;
    clearTimeout(this.rsvpTimeout);
  }

  private showNextRsvpWord() {
    if (this.rsvpPaused || this.currentRsvpIndex >= this.rsvpWords.length) {
      this.stopRsvp();
      return;
    }

    this.currentRsvpWord = this.rsvpWords[this.currentRsvpIndex];
    this.currentRsvpIndex++;

    this.rsvpTimeout = setTimeout(() => {
      this.showNextRsvpWord();
    }, 60000 / this.rsvpSpeed);
  }

  // private highlightCurrentWord() {
  //   this.clearHighlight();

  //   if (this.currentWordIndex >= this.wordElements.length) return;

  //   const element = this.wordElements[this.currentWordIndex];

  //   // Get all rendered contents sections
  //   const contents = this.rendition.getContents() as unknown as Contents[];

  //   // Find the content section that contains our element
  //   const containingContent = contents.find((content) => {
  //     try {
  //       return content.document.contains(element);
  //     } catch (e) {
  //       console.warn('Content document access error:', e);
  //       return false;
  //     }
  //   });

  //   if (!containingContent?.document) {
  //     console.warn('No containing content found for element:', element);
  //     return;
  //   }

  //   try {
  //     const range = containingContent.document.createRange();
  //     const textNode = element.childNodes[0];

  //     if (textNode?.nodeType === Node.TEXT_NODE) {
  //       const textContent = textNode.textContent || '';
  //       const word = this.words[this.currentWordIndex];
  //       const wordIndex = textContent.indexOf(word);

  //       if (wordIndex >= 0) {
  //         range.setStart(textNode, wordIndex);
  //         range.setEnd(textNode, wordIndex + word.length);

  //         // Get the base CFI for this section
  //         const sectionCfi = containingContent.cfiBase;

  //         // Generate CFI relative to the section
  //         const localCfi = containingContent.cfiFromRange(range);

  //         if (!localCfi) {
  //           console.warn('Failed to generate local CFI');
  //           return;
  //         }

  //         const fullCfi = `${sectionCfi}${localCfi}`;
  //         // console.log('Navigation CFI:', fullCfi);

  //         // Verify the CFI before displaying
  //         const section = this.book.spine.get(sectionCfi);
  //         if (!section) {
  //           console.warn('Invalid section CFI:', sectionCfi);
  //           return;
  //         }

  //         // Display the CFI location and wait for rendering
  //         this.rendition
  //           .display(fullCfi)
  //           .then(() => {
  //             console.log('section succcesful', fullCfi);
  //             // Add highlight after rendering completes
  //             this.rendition.annotations.highlight(
  //               fullCfi,
  //               {},
  //               () => console.log('Highlight clicked'),
  //               'current-word-highlight',
  //               {
  //                 fill: 'rgba(255,0,0,0.3)',
  //                 'fill-opacity': '0.3',
  //                 'mix-blend-mode': 'multiply',
  //               }
  //             );
  //           })
  //           .catch((e) => {
  //             console.error('CFI display failed:', e);
  //           });
  //       }
  //     }
  //   } catch (e) {
  //     console.error('Highlight error:', e);
  //   }
  // }

  private clearHighlight() {
    // Clear all current highlights
    this.rendition.annotations.remove('current-word-highlight', 'highlight');
  }

  // Update pauseTts method
  pauseTts() {
    clearInterval(this.highlightInterval);
    const elapsed = Date.now() - this.speechStartTime;
    const wordsPerMinute = this.tts.currentRate * 160;
    this.currentWordIndex = Math.floor((elapsed / 60000) * wordsPerMinute);
    this.tts.stop();
  }

  setTtsSpeed(event: any) {
    this.tts.setSpeed(parseFloat(event.detail.value));
  }

  private startRsvp() {
    this.rsvpWords = this.words.filter((word) => word.trim().length > 0);
    this.currentRsvpWord = '';
    this.rsvpPaused = false;
    this.showTtsControls = false; // Hide TTS controls if needed
    this.rsvpState = 'playing';
    this.currentRsvpIndex = 0; // Initialize index
    this.showNextRsvpWord();
  }

  stopRsvp() {
    this.rsvpPaused = true;
    clearTimeout(this.rsvpTimeout);
    this.currentRsvpWord = '';
    this.rsvpActive = false;
  }

  toggleRsvpPause() {
    this.rsvpPaused = !this.rsvpPaused;
    if (!this.rsvpPaused) {
      this.startRsvp();
    }
  }

  setRsvpSpeed(event: any) {
    this.rsvpSpeed = event.detail.value;
    if (this.rsvpActive) {
      this.stopRsvp();
      this.startRsvp();
    }
  }
}
