import { Component, Input, OnInit, Output } from '@angular/core';
import { ViewAction } from '../../_objects/View';

@Component({
  selector: 'app-actions-container',
  templateUrl: './actions-container.component.html',
  styleUrls: ['./actions-container.component.scss']
})
export class ActionsContainerComponent implements OnInit {

  @Input() label:string
  @Input() acts:ViewAction[]
  @Input() controllers:string[]
  @Input() groups:string[]

  del(action:ViewAction) {
    let index = this.acts.indexOf(action)
    if(index >= 0) {
      this.acts.splice(index,1)
    }
  }

  create() {
    this.acts.push(new ViewAction())
  }


  constructor() { }

  ngOnInit(): void {
  }

}
