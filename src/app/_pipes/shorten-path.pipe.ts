import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenPath'
})
export class ShortenPathPipe implements PipeTransform {
  transform(value: string, segments: number = 2): string {
    if (!value) return '';

    const normalizedValue = value.replace(/\\/g, '/');

    const parts = normalizedValue.split('/');

    if (parts.length > segments) {
      const shortPath = parts.slice(parts.length - segments).join('/');
      return '../' + shortPath;
    }

    return value;
  }
}
