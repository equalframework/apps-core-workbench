import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-chips-autocomplete',
  templateUrl: './chips-auto-complete.component.html',
  styleUrls: ['./chips-auto-complete.component.scss']
})
export class ChipsAutocompleteComponent implements OnInit {

    @Input() label: string = '';
    @Input() list: any[] = []; // Liste complète des options possibles
    @Input() selectedValues: any[] = []; // Valeurs actuellement sélectionnées
    @Input() displayWith: (value: any) => string = (value) => value; // Fonction pour afficher correctement les valeurs
    @Input() allowCreate: boolean = false; // Permettre la création d'un nouvel élément
    @Input() type_list:string="None";
    @Output() selectionChange = new EventEmitter<any[]>();
    @Output() createItem = new EventEmitter<string>(); // Événement pour créer un nouvel élément

    chipCtrl = new FormControl('');
    filteredList: any[] = [];

    ngOnInit(): void {
      // Initialiser la liste filtrée
      this.filteredList = this.list;

      // Mettre à jour la liste filtrée à chaque changement dans le champ de saisie
      this.chipCtrl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        )
        .subscribe(filtered => {
          this.filteredList = filtered;
        });
    }

    private _filter(value: string): any[] {
      const filterValue = value ? value.toLowerCase() : '';
      return this.list.filter(option => {
        const optionValue = this.displayWith(option).toLowerCase();
        return optionValue.includes(filterValue);
      });
    }

    add(event: MatAutocompleteSelectedEvent): void {
      const value = event.option.value;
      if (value && !this.selectedValues.includes(value)) {
        this.selectedValues.push(value);
        this.selectionChange.emit(this.selectedValues);
      }
      this.chipCtrl.setValue('');
    }

    remove(value: any): void {
      this.selectedValues = this.selectedValues.filter(v => v !== value);
      this.selectionChange.emit(this.selectedValues);
    }

    onCreate(): void {
        this.createItem.emit(this.type_list);
        this.chipCtrl.setValue('');
    }
    onKeyDown(event: KeyboardEvent): void {
        if (this.chipCtrl.value === '' && event.key === 'Backspace') {
          event.preventDefault();
          event.stopPropagation();
        }
      }
}
