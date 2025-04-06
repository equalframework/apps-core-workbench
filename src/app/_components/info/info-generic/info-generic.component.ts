import { Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { ListField } from './_models/listFields.model';

@Component({
  selector: 'app-info-generic',
  templateUrl: './info-generic.component.html',
  styleUrls: ['./info-generic.component.scss']
})
export class InfoGenericComponent<T extends Record<string, any>>  implements OnInit{
    constructor(){}

    ngOnInit(): void {}
    @Input() title: string;
    @Input() item: T;
    @Input() descriptionKey: string = 'description';
    @Input() editableFields: {key:string, label:string, format?:(text:any)=>string}[] = [];
    @Input() listFields: ListField[] = [];
    @Input() package_name: string;
    @Input() model_name:string;


    @Output() itemChange = new EventEmitter<T>();
    @Output() addToList = new EventEmitter<{ key: string; value: any }>();
    @Output() removeFromList = new EventEmitter<{ key: string; index: number }>();
    @Output() createItem = new EventEmitter<string>();
    @Output() onrefresh = new EventEmitter<void>();
    selectedListValue: { [key: string]: any } = {};

    updateField(field: string, value: any): void {
        const keys = field.split('.');
        const lastKey = keys.pop();
        const targetObject = keys.reduce((acc, key) => acc[key], this.item);

        if (lastKey && targetObject) {
        (targetObject as Record<string, any>)[lastKey] = value;
        }
    }


    handleInputChange(fieldKey: string, value: string) {
        this.updateField(fieldKey, value);
      }

    addItemToList(key: string) {
        if (this.selectedListValue[key]) {
        this.addToList.emit({ key, value: this.selectedListValue[key] });
        this.selectedListValue[key] = null;
        }
    }

    removeItemFromList(key: string, index: number) {
        this.removeFromList.emit({ key, index });
    }

    getNestedValue(item: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], item);
    }

    getDisplayFunction(list: { format?: (text: any) => string }): (text: any) => string {
        return list.format ? list.format : (v: any) => v;
    }

    onCreateNewItem(type_show:string) {
        this.createItem.emit(type_show)
    }

    getDisplayValues(listField: { key: string; format?: (value: any) => string }, values: any[]): any[] {
        return listField.format ? values.map(v => listField.format!(v)) : values;
    }

    refresh() {
        this.onrefresh.emit();
    }

    isLongText(value: string | null | undefined): boolean {
        return value ? value.length > 165 : false;
      }

}
