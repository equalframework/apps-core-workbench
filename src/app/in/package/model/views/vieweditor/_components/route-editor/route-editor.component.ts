import { Component, Input, OnInit } from '@angular/core';
import { ViewRoute } from '../../_objects/View';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

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
    private workbenchService: WorkbenchService
  ) { }

  async ngOnInit() {
    console.log(this.obj)
    this.entity_list = await this.workbenchService.listAllModels().toPromise()
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
