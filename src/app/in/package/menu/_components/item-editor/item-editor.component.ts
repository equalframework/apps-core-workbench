import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'src/app/in/package/menu/_models/Menu';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-item-editor',
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ItemEditorComponent implements OnInit {

    @Input() item: MenuItem = new MenuItem();
    @Input() selectedItem: MenuItem | undefined = undefined;

    @Output() select = new EventEmitter<MenuItem>();
    @Output() CRUD = new EventEmitter<void>();
    @Output() deleteMe = new EventEmitter<void>();

    constructor() { }

    public ngOnInit(): void {
    }

    public ngOnChanges(): void {
        // console.log(this.selectedItem);
    }

    public addChild(): void {
        this.item.children.push(new MenuItem());
        this.CRUD.emit();
    }

    public onDelete(): void {
        this.deleteMe.emit();
    }

    public deleteChild(index: number): void {
        this.item.children.splice(index, 1);
    }


    public drop(event: CdkDragDrop<MenuItem[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }

}
