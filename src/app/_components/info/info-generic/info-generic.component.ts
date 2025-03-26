import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-generic',
  templateUrl: './info-generic.component.html',
  styleUrls: ['./info-generic.component.scss']
})
export class InfoGenericComponent<T extends Record<string, any>>  implements OnInit{
    ngOnInit(): void {
        console.log(this.item);
    }
  @Input() title: string;
  @Input() item: T; // L'objet générique (Action, Policy, Role...)
  @Input() descriptionKey: string = 'description'; // Clé pour récupérer la description
  @Input() editableFields: {key:string, label:string, format?:(text:any)=>string}[] = []; // Champs éditables
  @Input() listFields: { key: string; label: string, format?:(text:any)=>string, list: any[] }[] = []; // Listes associées

  @Output() itemChange = new EventEmitter<T>();
  @Output() addToList = new EventEmitter<{ key: string; value: any }>();
  @Output() removeFromList = new EventEmitter<{ key: string; index: number }>();

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


}
