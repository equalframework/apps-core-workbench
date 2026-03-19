import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { View } from '../../_objects/View';

@Component({
  selector: 'app-actions-tab',
  templateUrl: './actions-tab.component.html',
  styleUrls: ['./actions-tab.component.scss']
})
export class ActionsTabComponent implements OnInit {
  @Input() viewObj: View;
  @Input() action_controllers: string[] = [];
  @Input() groups: string[] = [];
  @Input() entity: string;
  
  @Output() viewObjChange = new EventEmitter<View>();

  @ViewChild('actionsTabContainer', { read: ElementRef }) actionsTabContainer: ElementRef;

  private tabComponentId = 'actions';

  constructor(

  ) {}

  ngOnInit(): void {
    // Initialization
  }
}
