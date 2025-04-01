import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorDialogComponent } from 'src/app/_modules/workbench.module';
import { ActionItem } from 'src/app/in/_models/actions.model';
import { PolicyItem } from 'src/app/in/_models/policy.model';
import { NotificationService } from 'src/app/in/_services/notification.service';

@Component({
  selector: 'info-actions',
  templateUrl: './info-actions.component.html',
  styleUrls: ['./info-actions.component.scss']
})
export class InfoActionsComponent implements OnInit {

  @Input() availablePolicies:string[]=[];
  filteredPolicies = [...this.availablePolicies];
  selectedPolicy: string | null = null;
    @Input() package_name: string = '';
    @Input() model_name: string = '';
  @Input() action: ActionItem;

  @Output() onrefresh = new EventEmitter<void>();
  constructor(private matDialog:MatDialog, private notificationService:NotificationService) { }

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

  oncreate(type_show:string){
    console.log(type_show);
 this.matDialog.open(MixedCreatorDialogComponent, {
                data: {
                    node_type: type_show,
                    lock_type: true,
                    package:this.package_name,
                    lock_package:true,
                    model:this.model_name,
                    lock_model:true
                },
                width: "40em",
                height: "26em"
            }).afterClosed().subscribe((data) =>{
               this.notificationService.showInfo(data.message);
            })
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

  onrefreshPolicy(){
    this.onrefresh.emit();
  }
}
