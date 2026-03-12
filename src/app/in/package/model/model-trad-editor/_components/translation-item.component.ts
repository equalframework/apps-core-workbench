import { Component, Input } from '@angular/core';
import { FieldColumnConfig } from '../_object/translation.types';

/**
 * Affiche une ligne de traduction :
 *   [checkbox] [fieldName] [input1] [input2?] [input3?]
 *
 * Utilisation :
 *   <app-translation-item
 *     [item]="data[lang].model[key]"
 *     [fieldName]="key"
 *     [fields]="FIELD_CONFIGS.model">
 *   </app-translation-item>
 */
@Component({
  selector: 'app-translation-item',
  templateUrl: './translation-item.component.html',
})
export class TranslationItemComponent {
  @Input() item!: Record<string, any>;
  @Input() fieldName!: string;
  @Input() fields: FieldColumnConfig[] = [];
  @Input() totalCols = 16;

  readonly FIXED_COLS = 3;

  get remainingCols(): number {
    return this.totalCols - this.FIXED_COLS;
  }
}