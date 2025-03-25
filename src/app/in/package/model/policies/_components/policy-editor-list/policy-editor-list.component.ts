import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PolicyItem } from 'src/app/in/_models/policy.model';




@Component({
  selector: 'app-policy-editor-list',
  templateUrl: './policy-editor-list.component.html',
  styleUrls: ['./policy-editor-list.component.scss']
})
export class PolicyEditorListComponent {
  @Input() listPolicy: PolicyItem[] = [];
  @Input() selectPolicy: PolicyItem |undefined;
  @Output() select = new EventEmitter<PolicyItem>();
  filterControl = new FormControl('');

  onClickItem(policy: PolicyItem): void {
    this.select.emit(policy);
  }

  get filteredList(): PolicyItem[] {
    const filterValue = (this.filterControl.value || '').toLowerCase();
    return this.listPolicy.filter(item =>
      item.key.toLowerCase().includes(filterValue)
    );
  }



}
