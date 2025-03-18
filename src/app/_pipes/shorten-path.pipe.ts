// shorten-path.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenPath'
})
export class ShortenPathPipe implements PipeTransform {
  transform(value: string, segments: number = 2): string {
    if (!value) return '';
    const parts = value.split('/');
    if (parts.length > segments) {
      const shortPath = parts.slice(parts.length - segments).join('/');
      return '../' + shortPath;
    }
    return value;
  }
}
