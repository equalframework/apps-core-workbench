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

  @Input() route: ViewRoute;
  @Input() entity: string;
  @Input() modelList: string[];
  @Input() packageName: string;

  @Output() deleteMe =  new EventEmitter<void>();

  filteredModelList: string[];

  extEntityViewList: string[] = [];

  bigDisp = false;

  constructor(
    private equalComponentsProviderService: EqualComponentsProviderService
  ) { }

  ngOnInit(): void {
    this.filteredModelList = this.modelList || [];

    const defaultEntity = (this.packageName && this.entity) ? `${this.packageName}\\${this.entity}` : undefined;

    if (!this.route.context) {
      (this.route as any).context = { entity: '', view: '' };
    }

    if (!this.route.context.entity && defaultEntity) {
      this.route.context.entity = defaultEntity;
      if (!this.filteredModelList.includes(defaultEntity)) {
        this.filteredModelList = [defaultEntity, ...this.filteredModelList];
      }
      this.refreshViewList(defaultEntity);
    } else {
      this.refreshViewList(this.route.context.entity);
    }
  }

  updateAutocomplete(value: string): void {
    this.filteredModelList = this.modelList.filter(item => item.includes(value));
  }

  async refreshViewList(className?: string): Promise<void> {
    this.equalComponentsProviderService.getComponents(className ? className.split('\\')[0] : this.packageName, 'view', className?.split('\\')[className?.split('\\').length - 1]).subscribe(views => {
      this.extEntityViewList = (views || []).map(v => `${v.package_name}:${v.name}`);
    });
  }

  onClickDelete(): void {
    this.deleteMe.emit();
  }

}
