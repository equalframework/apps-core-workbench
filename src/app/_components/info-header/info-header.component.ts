import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-header',
  templateUrl: './info-header.component.html',
  styleUrls: ['./info-header.component.scss']
})
export class InfoHeaderComponent {
  @Input() titleLabel!: string;
  @Input() title!: string;
  @Input() copyText?: string;
  @Input() description!: string;
  @Input() metaData: { icon: string, tooltip: string, value: string, copyable?: boolean, double_backslash?:boolean }[] = [];
}
