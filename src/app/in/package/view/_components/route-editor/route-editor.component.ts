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

  @Input() obj: ViewRoute[];
  @Input() entity: string;
  @Input() packageName: string;

  entityList: string[];

  constructor(
    private workbenchService: WorkbenchService
  ) { }

  async ngOnInit(): Promise<void> {
    this.entityList = await this.workbenchService.collectClasses(true).toPromise();
  }

  createRoute(): void {
    this.obj.push(new ViewRoute());
  }

  drop(event: CdkDragDrop<ViewRoute[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  onDeletionRequest(index: number): void {
    this.obj.splice(index, 1);
  }
}
