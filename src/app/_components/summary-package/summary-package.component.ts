import { Component, Input, OnInit } from '@angular/core';
import { PackageSummary } from '../../in/_models/package-info.model';

@Component({
  selector: 'summary-package',
  templateUrl: './summary-package.component.html',
  styleUrls: ['./summary-package.component.scss']
})
export class SummaryPackageComponent implements OnInit {
  @Input() packageInfo!: PackageSummary| null;
  @Input() message!: string;

  ngOnInit(): void {
    console.log('SummaryPackageComponent initialized with packageInfo:', this.packageInfo, 'and message:', this.message);
  }
}
