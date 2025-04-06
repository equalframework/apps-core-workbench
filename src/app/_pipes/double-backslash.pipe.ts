import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'doubleBackslash'
})
export class DoubleBackslashPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.replace(/\//g, '\\\\').replace(/\\/g, '\\\\');  }
}
