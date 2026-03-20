/**
 * Focusable Field Directive
 * 
 * Marks form field elements (input, select, textarea, button) that can be focused or clicked via URL query parameters.
 * Registers the element with the navigation service so it can receive focus when the corresponding query parameter is activated.
 * For buttons, triggers a click instead of focus.
 * 
 * Usage:
 *   <input appFocusableField="item-1-value" [(ngModel)]="item.value">
 *   <mat-select appFocusableField="customer-id-select" [(value)]="customerValue">
 *   <textarea appFocusableField="description-textarea" [(ngModel)]="description"></textarea>
 *   <button appFocusableField="submit-button" (click)="onSubmit()">Submit</button>
 * 
 * URL Example:
 *   ?view=default&field=item-1-value  (focuses the field with ID 'item-1-value')
 *   ?element=section-1&field=customer-id-select  (scrolls to element and focuses the field)
 *   ?field=button-submit  (clicks the submit button)
 */

import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { QueryParamNavigatorService } from '../_services/query-param-navigator.service';

@Directive({
  selector: '[appFocusableField]'
})
export class FocusableFieldDirective implements OnInit, OnDestroy {
  /**
   * Unique ID for the focusable field or button, used in query parameters (e.g. ?field=item-1-value)
   * Should be lowercase with dashes (kebab-case) and unique within the page
   * 
   * @example
   *   appFocusableField="item-1-value"
   *   appFocusableField="customer-id-input"
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
    console.log('Registering focusable field:', this.fieldId, this.elementRef.nativeElement);
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
