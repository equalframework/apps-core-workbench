/**
 * Focusable Field Directive
 *
 * Marks form field elements (input, select, textarea, button) that can be focused or clicked via URL query parameters.
 * Registers the element with the navigation service so it can receive focus when the corresponding query parameter is activated.
 * For buttons, triggers a click instead of focus.
 *
 * Supports hierarchical field naming for nested fields. Use hyphens to separate hierarchy levels:
 * 
 * Usage Examples:
 *   <input appFocusableField="customer-id" [(ngModel)]="customerValue">
 *   <input appFocusableField="item-1-value" [(ngModel)]="item.value">
 *   <input appFocusableField="item-1-details-name" [(ngModel)]="item.details.name">
 *   <mat-select appFocusableField="item-1-type-select" [(value)]="typeValue">
 *   <textarea appFocusableField="description-textarea" [(ngModel)]="description"></textarea>
 *   <button appFocusableField="submit-button" (click)="onSubmit()">Submit</button>
 *
 * URL Examples:
 *   ?field=customer-id  (focuses the field)
 *   ?field=item1-value  (clicks item1 to reveal it, focuses item-1-value)
 *   ?field=item1-details-name  (clicks item1, then item1-details, then focuses item1-details-name)
 *
 */

import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { QueryParamNavigatorService } from '../_services/query-param-navigator.service';

@Directive({
  selector: '[appFocusableField]'
})
export class FocusableFieldDirective implements OnInit, OnDestroy {
  /**
   * Unique ID for the focusable field or button, used in query parameters (e.g. ?field=item1-value)
   * Should be lowercase with dashes (kebab-case) and unique within the page
   * Can be hierarchical to support nested fields: parent-child-grandchild-field
   *
   * @example
   *   appFocusableField="customer-id-input"
   *   appFocusableField="item1-value"
   *   appFocusableField="item1-details-name"
   *   appFocusableField="description-textarea"
   *   appFocusableField="button-delete"
   */
  @Input('appFocusableField')
  fieldId: string;

  constructor(
    private elementRef: ElementRef,
    private queryParamNavigator: QueryParamNavigatorService
  ) {}

  ngOnInit(): void {
    if (!this.fieldId) {
      console.warn('appFocusableField: ID not provided', this.elementRef.nativeElement);
      return;
    }

    // Register the element with the navigation service
    this.queryParamNavigator.registerFocusableField(
      this.fieldId,
      this.elementRef.nativeElement
    );
  }

  ngOnDestroy(): void {
    this.queryParamNavigator.unregisterFocusableField(this.fieldId);
  }
}
