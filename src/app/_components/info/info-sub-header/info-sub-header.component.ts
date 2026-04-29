import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

export interface InfoSubHeaderButton {
  label: string;
  route?: string;
  href?: string;
  target?: string;
  icon?: string;
  disabled?: boolean;
  /** optional numeric count to display on the right of the first row */
  count?: number;
}

@Component({
  selector: 'app-info-sub-header',
  templateUrl: './info-sub-header.component.html',
  styleUrls: ['./info-sub-header.component.scss']
})
export class InfoSubHeaderComponent {
  @Input() navigationButtons: InfoSubHeaderButton[] = [];
  @Input() actionButtons: InfoSubHeaderButton[] = [];
  @Input() showManagement = false;
  @Input() managementDisabled = false;

  @Output() initPackage = new EventEmitter<void>();
  @Output() checkConsistency = new EventEmitter<void>();
  @Output() navigationClick = new EventEmitter<InfoSubHeaderButton>();

  constructor(private router: Router) {}

  onButtonClick(btn: InfoSubHeaderButton) {
    if (btn.disabled) { return; }
    this.navigationClick.emit(btn);
    if (btn.route) {
      this.router.navigate([btn.route]);
    } else if (btn.href) {
      window.open(btn.href, btn.target || '_self');
    }
  }

  onInit() {
    if (this.managementDisabled) { return; }
    this.initPackage.emit();
  }

  onCheck() {
    if (this.managementDisabled) { return; }
    this.checkConsistency.emit();
  }
}
