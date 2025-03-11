import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard'; // Import du service Clipboard
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'copy-button',
  templateUrl: './copy-button.component.html',
  styleUrls: ['./copy-button.component.scss'],
})
export class CopyButtonComponent {
  @Input() textToCopy: string = '';
  icon: string = 'content_copy';
  constructor(private clipboard: Clipboard) {}

  handleCopy(): void {
    this.clipboard.copy(this.textToCopy);

    this.icon = 'check';
    setTimeout(() => {
      this.icon = 'content_copy';
    }, 1000);
  }
}
