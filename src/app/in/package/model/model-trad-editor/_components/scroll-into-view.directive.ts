import { Directive, ElementRef, Input } from '@angular/core';

@Directive({ selector: '[scrollIntoView]' })
export class ScrollIntoViewDirective {
  constructor(private el: ElementRef) {}

  @Input()
  set scrollIntoView(value: boolean) {
    if (value) {
      // schedule to ensure DOM rendered
      setTimeout(() => {
        try {
          (this.el.nativeElement as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {
          // ignore
        }
      }, 0);
    }
  }
}
