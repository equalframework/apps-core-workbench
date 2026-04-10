import { Component, Input } from '@angular/core';
import { FieldColumnConfig } from '../_object/translation.types';

export interface GridHeaderColumn {
  label: string;
  colspan: number;
}

/**
 * Affiche un bloc complet : en-tête de colonnes + N lignes de traduction.
 *
 * Utilisation :
 *   <app-translation-table
 *     [items]="data[lang].model"
 *     [fields]="FIELD_CONFIGS.model"
 *     [headers]="MODEL_HEADERS">
 *   </app-translation-table>
 *
 * Où MODEL_HEADERS = [
 *   { label: 'Translated', colspan: 1 },
 *   { label: 'Field',      colspan: 2 },
 *   { label: 'Label',      colspan: 3 },
 *   { label: 'Description',colspan: 5 },
 *   { label: 'Help',       colspan: 5 },
 * ]
 */
@Component({
  selector: 'app-translation-table',
  styleUrls: ['./translation-table.component.scss'],
  templateUrl: './translation-table.component.html',
})
export class TranslationTableComponent {
  @Input() items!: Record<string, any>;
  @Input() fields: FieldColumnConfig[] = [];
  @Input() selectedField?: string;
  @Input() headers?: GridHeaderColumn[];
  @Input() totalCols = 16;
  @Input() tabName = '';

  get computedHeaders(): GridHeaderColumn[] {
    if (this.headers) { return this.headers; }
    return [
      { label: 'Translated', colspan: 1 },
      { label: 'Field',      colspan: 2 },
      ...this.fields.map(f => ({ label: f.placeholder, colspan: f.colspan })),
    ];
  }

  changeActive(key: string): void {
    if (!this.items[key]) { return; }
    const item = this.items[key];
    if (item && typeof item === 'object') {
      item.is_active = item.is_active ? false : true;
      // this.selectedField = !item.is_active && key === this.selectedField ? undefined : this.selectedField;
    }
  }

  get itemKeys(): string[] {
    const keys = Object.keys(this.items ?? {});
    if (!this.items) { return keys; }
    for (const k of keys) {
      const item = this.items[k];
      if (item && typeof item === 'object' && k === this.selectedField) {
        item.is_active = true;
      }
    }
    return keys;
  }
}
