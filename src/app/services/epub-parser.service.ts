// Simplified EPUB parser service
import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import JSZip from 'jszip';

@Injectable({ providedIn: 'root' })
export class EpubParserService {
  
  async processEpub(fileUri: string) {
    // 1. Read as base64 string
    const file = await Filesystem.readFile({ path: fileUri });
    const base64Data = file.data as string;  // Explicit type

    // 2. Load with error handling
    try {
      const zip = await this.safeLoadZip(base64Data);
      const metadata = await this.extractMetadata(zip);
      const path = await this.saveEpub(fileUri, base64Data);
      return { metadata, path };
      console.log('EPUB processing successful'); 
    } catch (error) {
      console.error('EPUB processing failed:', error);
      throw new Error('Invalid EPUB file');
    }
  }

  private async safeLoadZip(data: string): Promise<JSZip> {
    return JSZip.loadAsync(data, {
      base64: true,
      checkCRC32: true
    });
  }

  private async extractMetadata(zip: JSZip) {
    try {
      // Get container.xml
      const containerFile = zip.file('META-INF/container.xml');
      if (!containerFile) throw new Error('Invalid EPUB: Missing container.xml');
      
      const containerText = await containerFile.async('text');
      const opfPath = this.parseContainerXml(containerText);

      // Get OPF content
      const opfFile = zip.file(opfPath);
      if (!opfFile) throw new Error('Invalid EPUB: Missing OPF file');
      
      const opfText = await opfFile.async('text');
      return this.parseOpfMetadata(opfText);
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return { title: 'Unknown', author: 'Unknown' };
    }
  }

  private parseContainerXml(xml: string): string {
    // Simple regex parse instead of XML parser
    const match = xml.match(/<rootfile.*?full-path="(.*?)"/is);
    return match ? match[1] : 'content.opf';
  }

  private parseOpfMetadata(opfText: string) {
    // Simple regex-based metadata extraction
    return {
      title: this.extractTag(opfText, 'dc:title') || 'Unknown Title',
      author: this.extractTag(opfText, 'dc:creator') || 'Unknown Author',
      language: this.extractTag(opfText, 'dc:language') || 'en'
    };
  }

  private extractTag(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>(.*?)<\/${tagName}>`, 'is');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  private async saveEpub(fileName: string, base64Data: string) {
    const path = `epubs/${Date.now()}_${fileName}`;
    
    await Filesystem.writeFile({
      path: path,
      data: base64Data,
      directory: Directory.Data,
      recursive: true
    });

    return path;
  }
}