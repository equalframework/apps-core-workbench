import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MenuFieldColumnConfig } from '../_object/menu-translation.types';

export interface GridHeaderColumn {
  label: string;
  colspan: number;
}

@Component({
  selector: 'app-translation-table',
  styleUrls: ['./translation-table.component.scss'],
  templateUrl: './translation-table.component.html',
})
export class TranslationTableComponent implements OnChanges {
  @Input() items!: Record<string, any>;
  @Input() fields: MenuFieldColumnConfig[] = [];
  @Input() selectedField?: string;
  @Input() headers?: GridHeaderColumn[];
  @Input() totalCols = 16;
  @Input() metadata?: (itemId: string) => any;
  @Input() getDepthCallback?: (itemId: string) => number;
  @Input() hasChildrenCallback?: (itemId: string) => boolean;
  @Input() getParentIdCallback?: (itemId: string) => string | null;
  @Output() itemChange = new EventEmitter<{ key: string; changes: Record<string, any> }>();

  private allItems: Record<string, any> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items) {
      // Items are expected to be already provided as a flat map by the caller.
      this.allItems = { ...(this.items || {}) };
      this.items = this.allItems;
    }

    if (changes.selectedField) {
      const sel = this.selectedField;
      if (this.allItems && sel) {
        for (const k of Object.keys(this.allItems)) {
          const it = this.allItems[k];
          if (it && typeof it === 'object') {
            it.is_active = (k === sel);
          }
        }
        this.items = this.allItems;
      }
    }
  }

  get computedHeaders(): GridHeaderColumn[] {
    if (this.headers) {
      return this.headers;
    }
    return [
      { label: 'Translated?', colspan: 1 },
      { label: 'Menu Item (schema)',  colspan: 2 },
      ...this.fields.map(f => ({ label: f.placeholder, colspan: f.colspan })),
    ];
  }

  /** Calculate hierarchy depth - uses callback if provided, otherwise falls back to dot notation */
  getDepth(key: string): number {
    if (this.getDepthCallback) {
      return this.getDepthCallback(key);
    }
    return (key.match(/\./g) || []).length;
  }

  /** Get the last segment of a hierarchical key */
  getDisplayName(key: string): string {
    const meta = this.getItemMetadata(key);
    if (meta && meta.label) {
      return meta.label;
    }

    if (this.getParentIdCallback) {
      const parentId = this.getParentIdCallback(key);
      if (parentId === null && meta && meta.label) {
        return meta.label;
      }
      if (meta && meta.label) {
        return meta.label;
      }
    }
    const parts = key.split('.');
    return parts[parts.length - 1];
  }

  /** Safely read a field value (handles primitive or { value } shapes) */
  getFieldValue(itemKey: string, fieldKey: string): string {
    const item = this.allItems?.[itemKey];
    if (!item) { return ''; }
    const v = item[fieldKey];
    if (v == null) { return ''; }
    if (typeof v === 'object' && 'value' in v) { return v.value || ''; }
    return String(v);
  }

  /** Safely set a field value, creating structure when needed */
  setFieldValue(itemKey: string, fieldKey: string, value: string): void {
    if (!this.allItems) { return; }
    const item = this.allItems[itemKey] = this.allItems[itemKey] || {};
    const existing = item[fieldKey];
    if (existing == null || typeof existing !== 'object') {
      item[fieldKey] = { value };
    } else {
      existing.value = value;
    }
    try { this.itemChange.emit({ key: itemKey, changes: { [fieldKey]: item[fieldKey] } }); } catch (e) { /* noop */ }
  }

  /** Get parent ID for navigation/visual purposes - uses callback if provided */
  getParentId(key: string): string | null {
    if (this.getParentIdCallback) {
      return this.getParentIdCallback(key);
    }
    const parts = key.split('.');
    if (parts.length <= 1) { return null; }
    return parts.slice(0, -1).join('.');
  }

  /** Check if this key has children - uses callback if provided */
  hasChildren(key: string): boolean {
    if (this.hasChildrenCallback) {
      return this.hasChildrenCallback(key);
    }
    return Object.keys(this.allItems || {}).some(k => k.startsWith(key + '.'));
  }

  /** Get metadata for an item (if metadata callback is provided) */
  getItemMetadata(key: string): any {
    return this.metadata ? this.metadata(key) : null;
  }

  /** Get the type of menu item (parent or entry) from metadata */
  getItemType(key: string): string {
    const meta = this.getItemMetadata(key);
    return meta?.type || (this.hasChildren(key) ? 'parent' : 'entry');
  }

  /** Get the icon for an item from metadata */
  getItemIcon(key: string): string | null {
    const meta = this.getItemMetadata(key);
    return meta?.icon || null;
  }

  changeActive(key: string): void {
    const item = this.allItems?.[key];
    if (!item) { return; }
    if (item && typeof item === 'object') {
      item.is_active = item.is_active ? false : true;
      this.selectedField = !item.is_active && key === this.selectedField ? undefined : this.selectedField;
      try { this.itemChange.emit({ key, changes: { is_active: item.is_active } }); } catch (e) { /* noop */ }
    }
  }

  get itemKeys(): string[] {
    const keys = Object.keys(this.allItems ?? {});
    if (!this.allItems) { return keys; }
    for (const k of keys) {
      const item = this.allItems[k];
      if (item && typeof item === 'object' && k === this.selectedField) {
        item.is_active = true;
      }
    }
    return keys;
  }

}
