import { Component, Input } from '@angular/core';
import { FieldColumnConfig } from '../_object/translation.types';

export interface GridHeaderColumn {
  label: string;
  colspan: number;
}

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
  @Input() tab = '';
  @Input() view? = '';
  @Input() viewTab? = '';

  get computedHeaders(): GridHeaderColumn[] {
    if (this.headers) { return this.headers; }
    return [
      { label: 'Translated', colspan: 1 },
      { label: 'Field',      colspan: 2 },
      ...this.fields.map(f => ({ label: f.placeholder, colspan: f.colspan })),
    ];
  }

  isItemActive(item: any): boolean {
    if (!item || typeof item !== 'object') { return false; }
    if (typeof item.is_active === 'boolean') { return item.is_active; }
    if (typeof item.isActive === 'boolean') { return item.isActive; }
    return false;
  }

  setItemActive(item: any, active: boolean): void {
    if (!item || typeof item !== 'object') { return; }
    if (Object.prototype.hasOwnProperty.call(item, 'is_active')) {
      item.is_active = active;
      return;
    }
    if (Object.prototype.hasOwnProperty.call(item, 'isActive')) {
      item.isActive = active;
      return;
    }
    item.is_active = active;
    item.isActive = active;
  }

  changeActive(key: string): void {
    if (!this.items[key]) { return; }
    const item = this.items[key];
    if (item && typeof item === 'object') {
      this.setItemActive(item, !this.isItemActive(item));
    }
  }

  get itemKeys(): string[] {
    const keys = Object.keys(this.items ?? {});
    if (!this.items) { return keys; }
    for (const k of keys) {
      const item = this.items[k];
      if (item && typeof item === 'object' && k === this.selectedField) {
        this.setItemActive(item, true);
      }
    }
    return keys;
  }
}
