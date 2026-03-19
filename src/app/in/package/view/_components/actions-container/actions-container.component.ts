import { Component, Input, OnInit, Output, OnDestroy, ViewContainerRef, ViewChild } from '@angular/core';
import { ViewAction } from '../../_objects/View';

@Component({
  selector: 'app-actions-container',
  templateUrl: './actions-container.component.html',
  styleUrls: ['./actions-container.component.scss']
})
export class ActionsContainerComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef }) containerRef!: ViewContainerRef;

  @Input() label:string
  @Input() acts:ViewAction[]
  @Input() controllers:string[]
  @Input() groups:string[]
  @Input() entity:string
  @Input() domainLabels:boolean = false


  constructor(
  ) {}



  ngOnInit() {
}

  del(action:ViewAction) {
    let index = this.acts.indexOf(action)
    if(index >= 0) {
      this.acts.splice(index,1)
    }
  }

  create() {
    this.acts.push(new ViewAction({},this.domainLabels))
  }

}
