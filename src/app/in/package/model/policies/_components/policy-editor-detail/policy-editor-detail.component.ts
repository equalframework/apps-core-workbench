import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PolicyItem } from 'src/app/in/_models/policy.model';

@Component({
  selector: 'app-policy-editor-detail',
  templateUrl: './policy-editor-detail.component.html',
  styleUrls: ['./policy-editor-detail.component.scss'],
})
export class PolicyEditorDetailComponent {

    @Input() policy: PolicyItem;

}
