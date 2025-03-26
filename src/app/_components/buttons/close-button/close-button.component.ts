import { Component, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'close-button',
  templateUrl:`./close-button.component.html` ,
  styleUrls: [`./close-button.component.scss`],
  encapsulation: ViewEncapsulation.Emulated
})
export class CloseButtonComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
