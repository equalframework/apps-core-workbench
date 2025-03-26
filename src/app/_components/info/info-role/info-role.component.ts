import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { allEnumKeys, convertRights, getRightName, Right, RoleItem } from 'src/app/in/_models/roles.model';

@Component({
  selector: 'info-role',
  templateUrl: './info-role.component.html',
  styleUrls: ['./info-role.component.scss']
})
export class InfoRoleComponent implements OnInit {

    @Input() role:RoleItem;
    @Input() roles:string[]=['owner','editor','test'];
    constructor() { }
    listFields = [
        {
          key: 'value.rights',
          label: 'Rights',
          format: this.getRightName,
          list:allEnumKeys
        },
        {
            key: 'value.implied_by',
            label: 'Implied_by',
            list:this.roles
          }
      ];

  ngOnInit(): void {
  }

  getRightName(right: Right): string {
    return getRightName(right);
}

  onActionChange(updatedRole: RoleItem) {
    this.role = updatedRole;
  }

  onAddPolicy(event:(any)) {
    console.log(event);
    if (event.key ==='value.rights' && !this.role.value.rights.includes(event.value)) {
      this.role.value.rights.push(event.value);
    }

    if (event.key ==='value.implied_by' && !this.role.value.implied_by?.includes(event.value)) {
        this.role.value.implied_by?.push(event.value);
      }


  }

  onRemovePolicy(event: { key: string; index: number }) {
    this.role.value.rights.splice(event.index, 1);
  }

}
