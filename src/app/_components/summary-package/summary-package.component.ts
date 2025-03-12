import { Component, Input } from '@angular/core';
import { PackageSummary } from '../../in/_models/package-info.model';

@Component({
  selector: 'summary-package',
  templateUrl: './summary-package.component.html',
  styleUrls: ['./summary-package.component.scss']
})
export class SummaryPackageComponent {
  @Input() packageInfo!: PackageSummary | null;
  @Input() message!: string;
}
