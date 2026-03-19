import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { View, ViewGroupByItem, ViewOperation } from '../../_objects/View';
import { Usage } from 'src/app/in/_models/Params';

@Component({
  selector: 'app-advanced-tab',
  templateUrl: './advanced-tab.component.html',
  styleUrls: ['./advanced-tab.component.scss']
})
export class AdvancedTabComponent implements OnInit {
  @Input() viewObj: View;
  @Input() entity: string;
  @Input() collect_controller: string[] = [];
  @Input() class_scheme: any = { fields: {} };
  @Input() groups: string[] = [];
  
  @Output() viewObjChange = new EventEmitter<View>();

  @ViewChild('advancedTabContainer', { read: ElementRef }) advancedTabContainer: ElementRef;

  obk = Object.keys;
  private tabComponentId = 'advanced';

  constructor() {}

  ngOnInit(): void {
    // Initialization
  }

  addNewGroupBy() {
    this.viewObj.groupBy.items.push(new ViewGroupByItem());
    this.viewObjChange.emit(this.viewObj);
  }

  deleteGroupBy(index: number) {
    this.viewObj.groupBy.items.splice(index, 1);
    this.viewObjChange.emit(this.viewObj);
  }

  addOperation() {
    this.viewObj.operations.push(new ViewOperation({}, ''));
    this.viewObjChange.emit(this.viewObj);
  }

  addOp(index: number) {
    this.viewObj.operations[index].ops.push({
      name: '',
      usage: new Usage(''),
      operation: 'COUNT',
      prefix: '',
      suffix: '',
      leftover: {}
    });
    this.viewObjChange.emit(this.viewObj);
  }

  delOperation(index: number) {
    this.viewObj.operations.splice(index, 1);
    this.viewObjChange.emit(this.viewObj);
  }

  delOp(index: number, jndex: number) {
    this.viewObj.operations[index].ops.splice(jndex, 1);
    this.viewObjChange.emit(this.viewObj);
  }

  fieldList(operation: ViewOperation, field: string): string[] {
    let b: string[] = [field];
    b.push(
      ...Object.keys(this.class_scheme.fields).filter(
        (item: string) => !operation.fieldTaken.includes(item)
      )
    );
    return b;
  }

  onViewObjChange() {
    this.viewObjChange.emit(this.viewObj);
  }
}
