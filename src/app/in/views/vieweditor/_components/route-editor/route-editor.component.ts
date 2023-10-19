import { Component, Input, OnInit } from '@angular/core';
import { ViewRoute } from '../../_objects/View';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-route-editor',
  templateUrl: './route-editor.component.html',
  styleUrls: ['./route-editor.component.scss']
})
export class RouteEditorComponent implements OnInit {

  @Input() obj: ViewRoute[]
  @Input() entity: string

  entity_list:string[]

  constructor(
    private api: EmbbedApiService
  ) { }

  async ngOnInit() {
    console.log(this.obj)
    this.entity_list = await this.api.listAllModels()
  }

  createRoute() {
    this.obj.push(new ViewRoute())
  }

  drop(event: CdkDragDrop<ViewRoute[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  onDeletionRequest(index:number) {
    this.obj.splice(index,1)
  }
}
