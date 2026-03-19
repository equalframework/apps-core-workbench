/**
 * Scroll Target Directive
 * 
 * Marks elements that can be targeted by the FragmentNavigator.
 * Registers the element with the navigation service so it can scroll to it when the corresponding query parameter is activated.
 * 
 * Usage:
 *   <div appScrollTarget="field-customer">...</div>
 *   <div appScrollTarget="section-1">...</div>
 *   <div appScrollTarget="tab:actions:item-2">...</div> (optional, allows for namespacing)
 */

import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { QueryParamNavigatorService } from '../_services/query-param-navigator.service';

@Directive({
  selector: '[appScrollTarget]'
})
export class ScrollTargetDirective implements OnInit, OnDestroy {
  /**
   * Unique ID for the scroll target element, used in query parameters (e.g. ?element=field-customer)
   * Should be lowercase with dashes (kebab-case) and unique within the page
   * 
   * @example
   *   appScrollTarget="field-customer"
   *   appScrollTarget="item-5"
   *   appScrollTarget="section-1:subsection-2"
   */
  @Input('appScrollTarget')
  targetId: string;

  constructor(
    private elementRef: ElementRef,
    private queryParamNavigator: QueryParamNavigatorService
  ) {}

  ngOnInit(): void {
    console.log('Registering scroll target:', this.targetId, this.elementRef.nativeElement);
    if (!this.targetId) {
      console.warn('appScrollTarget: ID not provided', this.elementRef.nativeElement);
      return;
    }

    // Register the element with the navigation service
    this.queryParamNavigator.registerScrollTarget(
      this.targetId,
      this.elementRef.nativeElement
     );
  }

  ngOnDestroy(): void {
    // Unregister the element when the directive is destroyed to prevent memory leaks
    if (this.targetId) {
      this.queryParamNavigator.unregisterScrollTarget(this.targetId);
    }
  }
}
