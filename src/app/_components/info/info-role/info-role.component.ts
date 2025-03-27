import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { allEnumKeys, allEnumValues, convertRights, getRightName, Right, RoleItem } from 'src/app/in/_models/roles.model';

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
          list:allEnumValues,
          type_show: 'checkbox',
          format: (key: number) => Right[key],
          type_list:'right'
        },
        {
            key: 'value.implied_by',
            label: 'Implied_by',
            list:this.roles,
            type_show:'chips',
            type_list:'implied_by'

          }
      ];

  ngOnInit(): void {
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

}
