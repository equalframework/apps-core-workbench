import { Component, Input, OnInit } from '@angular/core';
import { ActionItem } from 'src/app/in/_models/actions.model';

@Component({
  selector: 'info-actions',
  templateUrl: './info-actions.component.html',
  styleUrls: ['./info-actions.component.scss']
})
export class InfoActionsComponent implements OnInit {

  availablePolicies = ['Policy 1', 'Policy 2', 'Policy 3', 'Policy 4'];
  filteredPolicies = [...this.availablePolicies];
  newPolicy: string = '';
  showCreatePolicyInput = false;
  selectedPolicy: string | null = null;

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

  toggleCreatePolicyInput(): void {
    this.showCreatePolicyInput = !this.showCreatePolicyInput;
  }

  createPolicy(): void {
    if (this.newPolicy && !this.availablePolicies.includes(this.newPolicy)) {
      this.availablePolicies.push(this.newPolicy);
      this.filteredPolicies.push(this.newPolicy);
      this.selectedPolicy = this.newPolicy;
      this.newPolicy = '';
      this.showCreatePolicyInput = false;
    }
  }
  filterPolicies(search: string): void {
    this.filteredPolicies = this.availablePolicies.filter(policy =>
      policy.toLowerCase().includes(search.toLowerCase())
    );
  }
}
