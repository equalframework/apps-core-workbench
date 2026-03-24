import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { View } from '../../_objects/View';

@Component({
  selector: 'app-routes-tab',
  templateUrl: './routes-tab.component.html',
  styleUrls: ['./routes-tab.component.scss']
})
export class RoutesTabComponent implements OnInit {
  @Input() viewObj: View;
  @Input() entity: string;
  @Input() package_name: string;
  
  @Output() viewObjChange = new EventEmitter<View>();

  @ViewChild('routesTabContainer', { read: ElementRef }) routesTabContainer: ElementRef;

  private tabComponentId = 'routes';

  constructor() {}

  ngOnInit(): void {
    // Initialization
  }
}
