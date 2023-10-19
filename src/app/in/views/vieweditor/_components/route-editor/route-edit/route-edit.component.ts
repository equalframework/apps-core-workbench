import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewRoute } from '../../../_objects/View';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

@Component({
  selector: 'app-route-edit',
  templateUrl: './route-edit.component.html',
  styleUrls: ['./route-edit.component.scss']
})
export class RouteEditComponent implements OnInit {

  @Input() route:ViewRoute
  @Input() entity: string
  @Input() model_list:string[]

  @Output() deleteme =  new EventEmitter<void>()

  filtered_model_list:string[]

  ext_entity_view_list:string[]

  big_disp = false

  constructor(
    private api:EmbbedApiService
  ) { }

  ngOnInit(): void {
    console.log(this.route)
    this.filtered_model_list = this.model_list
    this.refreshViewList()
  }

  updateAutocomplete(value:string) {
    this.filtered_model_list = this.model_list.filter(item => item.includes(value))
  }

  async refreshViewList() {
    let x = await this.api.listViewFrom(this.route.context.entity.split("\\")[0],this.route.context.entity.split('\\').slice(1).join('\\'))
    this.ext_entity_view_list = x ? x : []
    console.log(this.ext_entity_view_list)
  }

  onClickDelete() {
    this.deleteme.emit()
  }

}
