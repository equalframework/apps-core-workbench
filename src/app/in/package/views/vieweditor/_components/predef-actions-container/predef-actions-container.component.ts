import { Component, Input, OnInit, Output } from '@angular/core';
import { ViewAction, ViewPreDefAction } from '../../_objects/View';

@Component({
  selector: 'app-predef-actions-container',
  templateUrl: './predef-actions-container.component.html',
  styleUrls: ['./predef-actions-container.component.scss']
})
export class PreDefActionsContainerComponent implements OnInit {

  @Input() label:string
  @Input() acts:ViewPreDefAction[]
  @Input() ids:string[]
  @Input() controllers:string[]
  @Input() groups:string[]
  @Input() entity:string

  del(action:ViewPreDefAction) {
    let index = this.acts.indexOf(action)
    if(index >= 0) {
      this.acts.splice(index,1)
    }
  }

  create() {
    this.acts.push(new ViewPreDefAction({}))
  }


  constructor() { }

  ngOnInit(): void {
  }

}
