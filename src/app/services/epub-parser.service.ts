import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import JSZip from 'jszip';
import he from 'he'; // HTML entity decoder

@Injectable({ providedIn: 'root' })
export class EpubParserService {
  async processEpub(fileUri: string, originalFileName: string) {
    try {
      // 1. Read file directly without copying first
      const file = await Filesystem.readFile({ path: fileUri });
      const base64Data = file.data as string;

      // 2. Process content
      const zip = await this.safeLoadZip(base64Data);
      const metadata = await this.extractMetadata(zip);
      
      // 3. Save with original filename
      const path = await this.saveEpub(originalFileName, base64Data);
      
      console.log('Successfully processed:', {
        path,
        metadata,
        size: base64Data.length
      });
      
      return { metadata, path };
    } catch (error) {
      console.error('EPUB processing failed:', error);
      throw new Error('Invalid EPUB file');
    }
  }

async processEpubFromData(base64Data: string, fileName: string) {
  try {
    const rawBase64 = base64Data.startsWith('data:') 
      ? base64Data.split(',')[1] 
      : base64Data;

    const zip = await this.safeLoadZip(rawBase64);
    const metadata = await this.extractMetadata(zip);
    const path = await this.saveEpub(fileName, rawBase64);
    
    return { metadata, path };
  } catch (error) {
    console.error('EPUB from data processing failed:', error);
    throw new Error('Invalid EPUB data');
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
      const containerFile = zip.file('META-INF/container.xml');
      if (!containerFile) throw new Error('Missing container.xml');

      const containerText = await containerFile.async('text');
      const opfPath = this.parseContainerXml(containerText);

      const opfFile = zip.file(opfPath);
      if (!opfFile) throw new Error('Missing OPF file');

      const opfText = await opfFile.async('text');
      return this.parseOpfMetadata(opfText);
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return { 
        title: 'Unknown Title', 
        author: 'Unknown Author',
        language: 'en'
      };
    }
  }

  private parseContainerXml(xml: string): string {
    const match = xml.match(/<rootfile[^>]+full-path="([^"]+)"/is);
    return match?.[1] || 'content.opf';
  }

  private parseOpfMetadata(opfText: string) {
    return {
      title: this.extractTag(opfText, 'dc:title') || 'Unknown Title',
      author: this.extractTag(opfText, 'dc:creator') || 'Unknown Author',
      language: this.extractTag(opfText, 'dc:language') || 'en',
    };
  }

  private extractTag(xml: string, tagName: string): string | null {
    const regex = new RegExp(
      `<${tagName}(?:\\s+[^>]*)?>(.*?)</${tagName}>`,
      'is'
    );
    
    const match = xml.match(regex);
    return match ? he.decode(match[1].trim()) : null;
  }

  private sanitizeFileName(name: string): string {
    return name
      .replace(/[^a-z0-9\._-]/gi, '_')
      .replace(/_+/g, '_')
      .substring(0, 100);
  }

  private async saveEpub(originalName: string, base64Data: string) {
    const sanitized = this.sanitizeFileName(originalName);
    const path = `epubs/${Date.now()}_${sanitized}`;

    await Filesystem.writeFile({
      path,
      data: base64Data,
      directory: Directory.Data,
      recursive: true
    });

    return path;
  }

  async listUploadedFiles() {
    try {
      const { files } = await Filesystem.readdir({
        path: 'epubs',
        directory: Directory.Data
      });
      return files;
    } catch (error) {
      console.log('No EPUBs found');
      return [];
    }
  }
}