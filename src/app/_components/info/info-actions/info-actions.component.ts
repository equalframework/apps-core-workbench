import { Component, Input, OnInit } from '@angular/core';
import { ActionItem } from 'src/app/in/_models/actions.model';

@Component({
  selector: 'info-actions',
  templateUrl: './info-actions.component.html',
  styleUrls: ['./info-actions.component.scss']
})
export class InfoActionsComponent implements OnInit {

    @Input() action : ActionItem
  constructor() { }

  ngOnInit(): void {
  }

}
