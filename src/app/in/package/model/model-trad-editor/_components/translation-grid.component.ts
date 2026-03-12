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
 *   <app-translation-grid
 *     [items]="data[lang].model"
 *     [fields]="FIELD_CONFIGS.model"
 *     [headers]="MODEL_HEADERS">
 *   </app-translation-grid>
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
  selector: 'app-translation-grid',
  templateUrl: './translation-grid.component.html',
})
export class TranslationGridComponent {
  @Input() items!: Record<string, any>;
  @Input() fields: FieldColumnConfig[] = [];
  @Input() headers?: GridHeaderColumn[];
  @Input() totalCols = 16;

  get computedHeaders(): GridHeaderColumn[] {
    if (this.headers) return this.headers;
    return [
      { label: 'Translated', colspan: 1 },
      { label: 'Field',      colspan: 2 },
      ...this.fields.map(f => ({ label: f.placeholder, colspan: f.colspan })),
    ];
  }

  get itemKeys(): string[] {
    return Object.keys(this.items ?? {});
  }
}