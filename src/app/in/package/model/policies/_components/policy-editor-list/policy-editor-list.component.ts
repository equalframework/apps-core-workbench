import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Policy } from 'src/app/in/_models/policy.model';


interface PolicyItem {
  key: string;
  value: Policy;
}

@Component({
  selector: 'app-policy-editor-list',
  templateUrl: './policy-editor-list.component.html',
  styleUrls: ['./policy-editor-list.component.scss']
})
export class PolicyEditorListComponent {
  @Input() listPolicy: PolicyItem[] = [];
  @Input() selectedIndex: number = 0;
  @Output() select = new EventEmitter<number>();
  filterControl = new FormControl('');

  onClickItem(index: number): void {
    this.select.emit(index);
  }

  get filteredList(): PolicyItem[] {
    const filterValue = (this.filterControl.value || '').toLowerCase();
    return this.listPolicy.filter(item =>
      item.key.toLowerCase().includes(filterValue)
    );
  }

}
