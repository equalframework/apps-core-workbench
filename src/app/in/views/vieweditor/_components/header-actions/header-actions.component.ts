import { Component, Input, OnInit } from '@angular/core';
import { ViewAction, ViewHeader } from '../../_objects/View';

@Component({
  selector: 'app-header-actions',
  templateUrl: './header-actions.component.html',
  styleUrls: ['./header-actions.component.scss']
})
export class HeaderActionsComponent implements OnInit {

  @Input() h_scheme:ViewHeader
  @Input() controllers:string[]
  obk = Object.keys

  constructor() { }

  ngOnInit(): void {
  }

  del(key:string,action:ViewAction) {
    let index = this.h_scheme.actions[key].acts.indexOf(action)
    if(index >= 0) {
      this.h_scheme.actions[key].acts.splice(index,1)
    }
  }

  create(key:string) {
    this.h_scheme.actions[key].acts.push(new ViewAction())
  }

}
