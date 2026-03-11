import { Component, Input, Output, EventEmitter, AfterContentInit, ContentChild, ElementRef } from '@angular/core';

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

  @Input() extraInfo: { label: string, value: string }[] = [];

  @Input() statusInfo: { icon?: string, tooltip?: string, label: string, value: string }[] = [];
  @Input() showEditTranslationButtons: boolean = true;
  @Output() editClick = new EventEmitter<void>();
  @Output() translationClick = new EventEmitter<void>();
  @Output() extraClick = new EventEmitter<any>();

  @ContentChild('[description]', { read: ElementRef }) projectedDescription: ElementRef | undefined;

  public hasProjectedDescription: boolean = false;

  get hasExtraInfo(): boolean {
    return Array.isArray(this.extraInfo) && this.extraInfo.length > 0;
  }

  ngAfterContentInit(): void {
    this.hasProjectedDescription = !!this.projectedDescription;
  }
}
