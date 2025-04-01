import { ListField } from './../info-generic/_models/listFields.model';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorDialogComponent } from 'src/app/_modules/workbench.module';
import { allEnumKeys, allEnumValues, convertRights, getRightName, Right, RoleItem } from 'src/app/in/_models/roles.model';
import { NotificationService } from 'src/app/in/_services/notification.service';

@Component({
  selector: 'info-role',
  templateUrl: './info-role.component.html',
  styleUrls: ['./info-role.component.scss']
})
export class InfoRoleComponent implements OnInit {

    @Input() role:RoleItem;
    @Input() availableRoles:string[]=[];
    @Input() package_name: string = '';
    @Input() model_name: string = '';
    constructor(private matDialog: MatDialog, private notificationService:NotificationService) { }
    listFields:ListField[]

  ngOnInit(): void {
    console.log("Avaible : ", this.role)
    this.listFields = [
        {
          key: 'value.rights',
          label: 'Rights',
          list:allEnumValues,
          type_show: 'checkbox',
          format: (key: number) => Right[key],
          type_list:'right'
        },
        {
            key: 'value.implied_by',
            label: 'Implied_by',
            list:this.availableRoles,
            type_show:'chips',
            type_list:'implied_by'

          }
      ];
  }

  getRightName(right: Right): string {
    return getRightName(right);
}

  onRoleChange(updatedRole: RoleItem) {
    this.role = updatedRole;
  }

  onAddRight(event:(any)) {
    console.log(event);
    if (event.key ==='value.rights' && !this.role.value.rights.includes(event.value)) {
      this.role.value.rights.push(event.value);
    }

    if (event.key ==='value.implied_by' && !this.role.value.implied_by?.includes(event.value)) {
        this.role.value.implied_by?.push(event.value);
      }
  }

  onRemoveRight(event: { key: string; index: number }) {
    this.role.value.rights.splice(event.index, 1);
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

}
