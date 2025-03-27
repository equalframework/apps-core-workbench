import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ExplorerDialogComponent } from 'src/app/_dialogs/explorer-dialog/explorer-dialog.component';
import { MixedCreatorDialogComponent } from 'src/app/_modules/workbench.module';
import { ListField } from './_models/listFields.model';

@Component({
  selector: 'app-info-generic',
  templateUrl: './info-generic.component.html',
  styleUrls: ['./info-generic.component.scss']
})
export class InfoGenericComponent<T extends Record<string, any>>  implements OnInit{
    constructor(private matDialog:MatDialog){

    }
    ngOnInit(): void {
        console.log(this.item);
    }
  @Input() title: string;
  @Input() item: T; // L'objet générique (Action, Policy, Role...)
  @Input() descriptionKey: string = 'description'; // Clé pour récupérer la description
  @Input() editableFields: {key:string, label:string, format?:(text:any)=>string}[] = []; // Champs éditables
  @Input() listFields: ListField[] = [];
  @Input() package_name: string;
  @Input() model_name:string;
  @Output() itemChange = new EventEmitter<T>();
  @Output() addToList = new EventEmitter<{ key: string; value: any }>();
  @Output() removeFromList = new EventEmitter<{ key: string; index: number }>();
  @Output() createItem = new EventEmitter<string>();
  selectedListValue: { [key: string]: any } = {};

  // Fonction pour mettre à jour la valeur dans item
  updateField(field: string, value: any): void {
    const keys = field.split('.');
    const lastKey = keys.pop(); // Récupérer la dernière clé
    const targetObject = keys.reduce((acc, key) => acc[key], this.item);

    if (lastKey && targetObject) {
      // Type assertion here to ensure it's safe to access
      (targetObject as Record<string, any>)[lastKey] = value;
    }
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

 // Fonction pour accéder aux valeurs imbriquées
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




}
