import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { ViewService } from '../../_services/view.service';
import { View } from '../../vieweditor/_objects/View';

@Component({
  selector: 'app-views-info',
  templateUrl: './views-info.component.html',
  styleUrls: ['./views-info.component.scss']
})
export class ViewsInfoComponent implements OnChanges {
  @Input() view_ref:string
  @Output() goto = new EventEmitter<void>()

  view_id:string;
  entity:string;
  view_scheme:any;
  obk = Object.keys

  constructor(
    private api:ViewService
  ) { }

  async ngOnChanges(){
    let temp = this.view_ref.split(":")
    this.entity = temp[0]
    this.view_id = temp[1]
    this.view_scheme = await this.api.getView(this.entity,this.view_id)
    console.log(this.view_scheme['layout'])
  }

  onEditClick() {
    this.goto.emit()
  }

}
