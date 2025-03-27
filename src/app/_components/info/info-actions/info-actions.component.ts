import { Component, Input, OnInit } from '@angular/core';
import { ActionItem } from 'src/app/in/_models/actions.model';
import { PolicyItem } from 'src/app/in/_models/policy.model';

@Component({
  selector: 'info-actions',
  templateUrl: './info-actions.component.html',
  styleUrls: ['./info-actions.component.scss']
})
export class InfoActionsComponent implements OnInit {

  @Input() availablePolicies:string[]=["Poilce 11", "Police 23", "Police 234"];
  filteredPolicies = [...this.availablePolicies];
  selectedPolicy: string | null = null;
    @Input() package_name: string = '';
    @Input() model_name: string = '';
  @Input() action: ActionItem;

  constructor() { }

  ngOnInit(): void {

  }

  addPolicy(): void {
    if (this.selectedPolicy && !this.action.value.policies.includes(this.selectedPolicy)) {
      this.action.value.policies.push(this.selectedPolicy);
      this.selectedPolicy = null;
    }
  }


  removePolicy(index: number): void {
    this.action.value.policies.splice(index, 1);
  }


  filterPolicies(search: string): void {
    this.filteredPolicies = this.availablePolicies.filter(policy =>
      policy.toLowerCase().includes(search.toLowerCase())
    );
  }

  onActionChange(updatedAction: ActionItem) {
    this.action = updatedAction;
  }

  onAddPolicy(event: { key: string; value: string }) {
    if (!this.action.value.policies.includes(event.value)) {
      this.action.value.policies.push(event.value);
    }
  }

  onRemovePolicy(event: { key: string; index: number }) {
    this.action.value.policies.splice(event.index, 1);
  }

}
