import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeExtension'
})
export class RemoveExtensionPipe implements PipeTransform {

  transform(value: string): string {
    if (typeof value === 'string' && value.includes('.')) {
      return value.split('.')[0];
    }
    return value;
  }

}
