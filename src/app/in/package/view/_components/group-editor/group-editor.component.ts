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
class GroupEditorComponent implements OnInit, OnChanges {

  math = Math;
  selected: ViewSection|undefined;
  selectedIndex = -1;
  @Input() groupObj: ViewSection[];
  @Input() entity: string;
  @Input() package: string;
  @Input() fields: string[];
  @Output() change = new EventEmitter<ViewSection[]>();
  @Input() groups: string[];
  @Input() actionControllers: string[];
  dragged: ViewItem|undefined;


  dragPosition = {};

  constructor(
    private matDialog: MatDialog,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.selected = this.groupObj[0];
    this.selectedIndex = 0;
  }

  ngOnChanges(): void {
      this.selectedIndex = this.selected ?
        this.groupObj.indexOf(this.selected) : -1;
  }

  delSection(): void {
    if (this.selected) {
      this.groupObj.splice(this.groupObj.indexOf(this.selected), 1);
    }
    this.selected = this.groupObj[0];
  }

  editSection(el: ViewSection): void {
    this.matDialog.open(EditSectionComponent, {data: {section: el, entity: this.entity, package: this.package}})
    .afterClosed().subscribe((result) => {
      if (result) {
        // Find and update the section in groupObj
        const index = this.groupObj.indexOf(el);
        if (index >= 0) {
          this.groupObj[index] = result;
        }
      }
    });
  }

  addSection(): void {
    this.groupObj.push(new ViewSection({label: 'New Section'}));
  }

  addRow(): void {
    this.selected?.rows.push(new ViewRow({label: 'New Row'}));
  }

  delRow(row: ViewRow): void {
    this.selected?.rows.splice(this.selected.rows.indexOf(row), 1);
  }

  editRow(row: ViewRow): void {
    this.matDialog.open(EditRowComponent, {data: {row, entity: this.entity, package: this.package}}).afterClosed().subscribe((result) => {
      if (result) {
        // Find and update the row in selected?.rows
        const index = this.selected?.rows.indexOf(row);
        if (index !== undefined && index >= 0) {
          this.selected?.rows.splice(index, 1, result);
        }
      }
    });
  }

  addCol(row: ViewRow): void {
    row.columns.push(new ViewColumn({label: 'New Column'}));
  }

  delColumn(row: ViewRow, col: ViewColumn): void {
    row.columns.splice(row.columns.indexOf(col), 1);
  }

  editColumn(col: ViewColumn): void {
    this.matDialog.open(EditColComponent, {data: {col, entity: this.entity, package: this.package}}).afterClosed().subscribe((result) => {
      if (result) {
        // Find and update the column in selected?.rows
        const index = this.selected?.rows.findIndex(row => row.columns.includes(col));
        if (index !== undefined && index >= 0) {
          this.selected?.rows[index].columns.splice(this.selected?.rows[index].columns.indexOf(col), 1, result);
        }
      }
    });
  }

  addItem(col: ViewColumn): void {
    col.items.push(new ViewItem({value: 'New Item', type: 'label'}, 1));
  }

  editItem(item: ViewItem): void {
    this.matDialog.open(EditItemFormComponent, {
      data: {
        item,
        entity: this.entity,
        fields: this.fields,
        groups: this.groups,
        action_controllers : this.actionControllers,
        package: this.package
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        // Find and update the item in selected?.rows
        const index = this.selected?.rows.findIndex(row => row.columns.some(col => col.items.includes(item)));
        if (index !== undefined && index >= 0) {
          this.selected?.rows[index].columns.forEach(col => {
            if (col.items.includes(item)) {
              const itemIndex = col.items.indexOf(item);
              col.items.splice(itemIndex, 1, result);
            }
          });
        }
      }
    });
  }

  delItem(col: ViewColumn, item: ViewItem): void {
    col.items.splice(col.items.indexOf(item), 1);
  }

  drop_section(event: CdkDragDrop<ViewSection[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  drop_row(event: CdkDragDrop<ViewRow[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  drop_col(event: CdkDragDrop<ViewColumn[]>): void {
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

  drag_item(event: any): void {
  }

  drop_item(event: any): void {
  }

  allowDrop(event: any): void {
  }

  updateDragged(item: ViewItem|undefined): void {
    this.dragged = item;
  }

}


export {GroupEditorComponent};
