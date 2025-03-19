import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard'; // Import du service Clipboard
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'copy-button',
  templateUrl: './copy-button.component.html',
  styleUrls: ['./copy-button.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CopyButtonComponent {
  @Input() text_to_copy: string = '';
  @Input() tooltip_text:string ='Copy';
  icon: string = 'content_copy';
  constructor(private clipboard: Clipboard) {}

  handleCopy(): void {
    this.clipboard.copy(this.text_to_copy);

    this.icon = 'check';
    setTimeout(() => {
      this.icon = 'content_copy';
    }, 1000);
  }
}
