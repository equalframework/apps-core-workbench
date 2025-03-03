import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-viewer',
  templateUrl: './item-viewer.component.html',
  styleUrls: ['./item-viewer.component.scss']
})
export class ItemViewerComponent implements OnInit,OnChanges {
  @Input() item_scheme:any[];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
  }

}
