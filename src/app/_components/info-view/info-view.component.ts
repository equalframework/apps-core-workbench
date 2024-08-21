import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


@Component({
  selector: 'info-view',
  templateUrl: './info-view.component.html',
  styleUrls: ['./info-view.component.scss']
})
export class InfoViewComponent implements OnChanges {
  @Input() view_ref:string
  @Output() goto = new EventEmitter<void>()
  @Output() translations = new EventEmitter<void>()

  view_id:string;
  entity:string;
  view_scheme:any;
  obk = Object.keys

  constructor(
    private api: WorkbenchService,
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

  onTranslationClick() {
    this.translations.emit()
  }

}
