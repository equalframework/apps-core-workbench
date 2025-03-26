import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { getRightName, Right, RoleItem } from 'src/app/in/_models/roles.model';

@Component({
  selector: 'info-role',
  templateUrl: './info-role.component.html',
  styleUrls: ['./info-role.component.scss']
})
export class InfoRoleComponent implements OnInit {

    @Input() role:RoleItem
    constructor() { }


  ngOnInit(): void {
  }

  getRightName(right: Right): string {
    return getRightName(right);
}
}
