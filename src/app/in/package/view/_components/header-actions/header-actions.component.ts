import { Component, Input, OnInit } from '@angular/core';
import { ViewAction, ViewHeader, ViewPreDefAction } from '../../_objects/View';

@Component({
  selector: 'app-header-actions',
  templateUrl: './header-actions.component.html',
  styleUrls: ['./header-actions.component.scss']
})
export class HeaderActionsComponent implements OnInit {

  @Input() hScheme: ViewHeader;
  @Input() groups: string[] = [];
  @Input() controllers: string[];
  @Input() entity: string;
  obk = Object.keys;

  constructor() { }

  ngOnInit(): void {
  }

  del(key: string, action: ViewPreDefAction): void {
    const index = this.hScheme.actions[key].acts.indexOf(action);
    if (index >= 0) {
      this.hScheme.actions[key].acts.splice(index, 1);
    }
  }

  create(key: string): void {
    this.hScheme.actions[key].acts.push(new ViewPreDefAction());
  }

}
