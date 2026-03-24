import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewRoute } from '../../../_objects/View';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Component({
  selector: 'app-route-edit',
  templateUrl: './route-edit.component.html',
  styleUrls: ['./route-edit.component.scss']
})
export class RouteEditComponent implements OnInit {

  @Input() route:ViewRoute
  @Input() entity: string
  @Input() model_list:string[]
  @Input() package_name:string

  @Output() deleteme =  new EventEmitter<void>()

  filtered_model_list:string[]

  ext_entity_view_list: string[] = []

  big_disp = false

  constructor(
    private equalComponentsProviderService: EqualComponentsProviderService
  ) { }

  ngOnInit(): void {
    console.log(this.route)
    this.filtered_model_list = this.model_list || []

    const defaultEntity = (this.package_name && this.entity) ? `${this.package_name}\\${this.entity}` : undefined

    if (!this.route.context) {
      (this.route as any).context = { entity: '', view: '' }
    }

    if (!this.route.context.entity && defaultEntity) {
      this.route.context.entity = defaultEntity
      if (!this.filtered_model_list.includes(defaultEntity)) {
        this.filtered_model_list = [defaultEntity, ...this.filtered_model_list]
      }
      this.refreshViewList(defaultEntity)
    } else {
      this.refreshViewList(this.route.context.entity)
    }
  }

  updateAutocomplete(value:string) {
    this.filtered_model_list = this.model_list.filter(item => item.includes(value))
  }

  async refreshViewList(class_name?: string) {
    this.equalComponentsProviderService.getComponents(class_name ? class_name.split('\\')[0] : this.package_name, 'view', class_name?.split('\\')[class_name?.split('\\').length - 1]).subscribe(views => {
      console.log('Views:', views)
      this.ext_entity_view_list = (views || []).map(v => `${v.package_name}:${v.name}`)
      console.log('Filtered Views:', this.ext_entity_view_list)
    });
  }

  onClickDelete() {
    this.deleteme.emit()
  }

}
