import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import JSZip from 'jszip';
import he from 'he';

@Injectable({ providedIn: 'root' })
export class EpubParserService {
  async processEpub(fileUri: string, originalFileName: string) {
    let savedPath = '';
    try {
      // 1. Read file using Capacitor Filesystem
      const file = await Filesystem.readFile({ path: fileUri });
      const base64Data = this.cleanBase64(file.data as string);

      // 2. Process content
      const zip = await this.safeLoadZip(base64Data);
      const metadata = await this.extractMetadata(zip);

      // 3. Save to persistent storage
      savedPath = await this.saveEpub(originalFileName, base64Data);

      console.log('EPUB processed successfully:', savedPath);
      return { metadata, path: savedPath };
    } catch (error) {
      console.error('EPUB processing failed:', error);

      // Clean up any partially saved files
      if (savedPath) {
        await Filesystem.deleteFile({
          path: savedPath,
          directory: Directory.Data,
        });
      }

      throw new Error('Failed to process EPUB file');
    }
  }

  async processEpubFromData(dataUrl: string, fileName: string) {
    let savedPath = '';
    try {
      console.log('Starting EPUB processing for:', fileName);
      const base64Data = this.cleanBase64(dataUrl);
      const zip = await this.safeLoadZip(base64Data);
      const metadata = await this.extractMetadata(zip);

      console.log('Metadata extracted:', metadata);

      savedPath = await this.saveEpub(fileName, base64Data);
      return { metadata, path: savedPath };
    } catch (error) {
      console.error('EPUB data processing failed:', error);

      if (savedPath) {
        await Filesystem.deleteFile({
          path: savedPath,
          directory: Directory.Data,
        });
      }

      throw new Error('Invalid EPUB data');
    }
  }

  private cleanBase64(data: string): string {
    return data.startsWith('data:') ? data.split(',')[1] : data;
  }

  private async safeLoadZip(data: string): Promise<JSZip> {
    try {
      return await JSZip.loadAsync(data, {
        base64: true,
        checkCRC32: true,
      });
    } catch (error) {
      console.error('Invalid ZIP file:', error);
      throw new Error('Corrupted or invalid EPUB file');
    }
  }

  // epub-parser.service.ts
  private async extractCoverImage(
    zip: JSZip,
    opfPath: string,
    coverPath: string
  ) {
    try {
      // Resolve relative paths
      const opfDir = opfPath.split('/').slice(0, -1).join('/');
      const fullPath = [opfDir, coverPath].filter(Boolean).join('/');

      const imageFile = zip.file(fullPath);
      if (!imageFile) return '';

      const arrayBuffer = await imageFile.async('arraybuffer');
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Cover extraction failed:', error);
      return '';
    }
  }

  private async parseOpfMetadata(zip: JSZip, opfText: string, opfPath: string) {
    const coverId = opfText.match(/<meta name="cover" content="([^"]+)"/i)?.[1];
    console.log('Found cover ID:', coverId);
    let coverImage = '';

    if (coverId) {
      // Improved regex to handle different attribute orders and quote types
      const itemRegex = new RegExp(
        `<item[^>]+id=["']${coverId}["'][^>]+href=["']([^"']+)["']`,
        'i'
      );

      const hrefMatch = opfText.match(itemRegex);
      console.log('Item regex matches:', hrefMatch);

      const coverPath = hrefMatch?.[1] || '';
      console.log('Raw cover path:', coverPath);

      if (coverPath) {
        // Improved path resolution
        const resolvePath = (base: string, relative: string) => {
          const baseParts = base.split('/').slice(0, -1);
          const relativeParts = relative.split('/');
          return [...baseParts, ...relativeParts]
            .join('/')
            .replace(/\/+/g, '/');
        };

        const fullPath = resolvePath(opfPath, coverPath);
        console.log('Resolved full path:', fullPath);

        coverImage = await this.extractCoverImage(zip, opfPath, coverPath);
      }
    }

    return {
      title: this.extractTag(opfText, 'dc:title') || 'Unknown Title',
      author: this.extractTag(opfText, 'dc:creator') || 'Unknown Author',
      language: this.extractTag(opfText, 'dc:language') || 'en',
      coverImage,
    };
  }
  // Update extractMetadata call
  private async extractMetadata(zip: JSZip) {
    try {
      const containerFile = zip.file('META-INF/container.xml');
      if (!containerFile) throw new Error('Missing container.xml');

      const containerText = await containerFile.async('text');
      const opfPath = this.parseContainerXml(containerText);

      const opfFile = zip.file(opfPath);
      if (!opfFile) throw new Error('Missing OPF file');

      const opfText = await opfFile.async('text');
      return this.parseOpfMetadata(zip, opfText, opfPath);
    } catch (error) {
      console.error('Metadata extraction failed:', error);
      return this.getFallbackMetadata();
    }
  }

  private parseContainerXml(xml: string): string {
    const match = xml.match(/<rootfile[^>]+full-path="([^"]+)"/is);
    return match?.[1]?.replace(/^\/?/, '') || 'content.opf'; // Normalize path
  }

  private extractTag(xml: string, tagName: string): string | null {
    const regex = new RegExp(
      `<${tagName}(?:\\s+[^>]*)?>(.*?)</${tagName}>`,
      'is'
    );

    const match = xml.match(regex);
    return match ? he.decode(match[1].trim()) : null;
  }

  private getFallbackMetadata() {
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
      language: 'en',
      coverImage: '',
    };
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

    try {
      await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.Data,
        recursive: true,
      });
      return path;
    } catch (error) {
      console.error('Failed to save EPUB file:', error);
      throw new Error('Could not save file to storage');
    }
  }
}
