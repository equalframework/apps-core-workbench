import { HostListener, Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, Directive } from '@angular/core';
import { View, ViewColumn, ViewGroup, ViewItem, ViewRow, ViewSection } from '../../_objects/View';
import { MatDialog } from '@angular/material/dialog';
import { EditSectionComponent } from './_components/edit-section/edit-section.component';
import { EditRowComponent } from './_components/edit-row/edit-row.component';
import { EditColComponent } from './_components/edit-col/edit-col.component';
import { EditItemFormComponent } from './_components/edit-item-form/edit-item-form.component';
import { CdkDragDrop, CdkDragRelease, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';



@Component({
  selector: 'app-group-editor',
  templateUrl: './group-editor.component.html',
  styleUrls: ['./group-editor.component.scss'],
})
class GroupEditorComponent implements OnInit,OnChanges {

  math = Math
  selected:ViewSection|undefined
  selected_index:number = -1
  @Input() group_obj:ViewSection[]
  @Input() entity:string
  @Input() fields:string[]
  @Output() onChange = new EventEmitter<ViewSection[]>()
  @Input() groups:string[]
  @Input() action_controllers:string[]
  dragged:ViewItem|undefined


  dragposition = {}

  constructor(
    private matDialog:MatDialog,
    private elementRef:ElementRef
  ) { }

  ngOnInit(): void {
    this.selected = this.group_obj[0]
    this.selected_index = 0
  }

  ngOnChanges(): void {
      this.selected_index = this.selected ? 
        this.group_obj.indexOf(this.selected) : -1
  }

  delSection() {
    if(this.selected)
      this.group_obj.splice(this.group_obj.indexOf(this.selected),1)
    this.selected = this.group_obj[0]
  }
  
  editSection(el:ViewSection) {
    this.matDialog.open(EditSectionComponent,{data:{section:el,entity:this.entity}})
  }

  addRow() {
    this.selected?.rows.push(new ViewRow({"label":"New Row"}))
  }

  delRow(row:ViewRow) {
    this.selected?.rows.splice(this.selected.rows.indexOf(row),1)
  }

  editRow(row:ViewRow) {
    this.matDialog.open(EditRowComponent,{data:{row:row,entity:this.entity}})

  }

  addCol(row:ViewRow) {
    row.columns.push(new ViewColumn({"label":"New Column"}))
  }

  delColumn(row:ViewRow,col:ViewColumn) {
    row.columns.splice(row.columns.indexOf(col),1)
  }

  editColumn(col:ViewColumn) {
    this.matDialog.open(EditColComponent,{data:{col:col,entity:this.entity}})
  }

  addItem(col:ViewColumn) {
    col.items.push(new ViewItem({"value":"New Item","type":"label"}))
  }
  
  editItem(item:ViewItem) {
    this.matDialog.open(EditItemFormComponent,{
      data:{item:item,entity:this.entity,fields:this.fields,groups:this.groups,action_controllers :this.action_controllers},
      height:"40em",
      width: "90em"
    })
  }

  delItem(col:ViewColumn,item:ViewItem) {
    col.items.splice(col.items.indexOf(item),1)
  }  

  drop_section(event: CdkDragDrop<ViewSection[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  drop_row(event: CdkDragDrop<ViewRow[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  drop_col(event: CdkDragDrop<ViewColumn[]>) {
    console.log(event)
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  drag_item(event:any) {
    console.log(event)
  }

  drop_item(event:any) {
    console.log(event)
  }

  allowDrop(event:any) {
    console.log(event)
  }

  updateDragged(item:ViewItem|undefined) {
    console.log(item ? "drag" : "drop")
    this.dragged = item
  }

}


export {GroupEditorComponent}