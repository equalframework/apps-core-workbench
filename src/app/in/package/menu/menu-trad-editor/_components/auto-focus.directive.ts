import { Directive, ElementRef, Input } from '@angular/core';

@Directive({ selector: '[focus]' })
export class AutoFocusDirective {
  constructor(private el: ElementRef) {}

  @Input()
  set focus(value: boolean) {
    if (value) {
      setTimeout(() => {
        const native = this.el.nativeElement as HTMLElement;
        // try to focus the element itself
        if (typeof (native as any).focus === 'function') {
          (native as any).focus();
          return;
        }
        // otherwise focus first focusable child
        const input = native.querySelector('input,textarea,select,button') as HTMLElement | null;
        if (input && typeof input.focus === 'function') {
          input.focus();
        }
      }, 0);
    }
  }
}
