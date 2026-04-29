/**
 * Scroll Target Directive
 *
 * Marks elements that can be targeted by the FragmentNavigator.
 * Registers the element with the navigation service so it can scroll to it when the corresponding query parameter is activated.
 *
 * Usage:
 *   <div appScrollTarget="field-customer">...</div>
 *   <div appScrollTarget="section-1">...</div>
 *   <div appScrollTarget="item1" [appScrollTargetRevealable]="true">...</div> (marks element as expandable/clickable)
 *
 * For hierarchical fields, use hyphenated IDs:
 *   <div appScrollTarget="item1">Parent item</div>
 *   <div appScrollTarget="item1-details">Details section (revealed when parent is clicked)</div>
 *   <input appFocusableField="item1-details-name">
 *
 * URL example: ?field=item1-details-name
 * - Clicks and activates: item1
 * - Waits for: item1-details to register
 * - Clicks and activates: item1-details
 * - Scrolls to: item1-details
 * - Focuses: item1-details-name
 */

import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { QueryParamNavigatorService } from '../_services/query-param-navigator.service';

@Directive({
  selector: '[appScrollTarget]'
})
export class ScrollTargetDirective implements OnInit, OnDestroy {
  /**
   * Unique ID for the scroll target element, used in query parameters (e.g. ?field=field-customer)
   * Should be lowercase with dashes (kebab-case) and unique within the page
   * Can be hierarchical: parent-child-grandchild
   *
   * @example
   *   appScrollTarget="field-customer"
   *   appScrollTarget="item1"
   *   appScrollTarget="item1-details"
   *   appScrollTarget="section1-subsection2"
   */
  @Input('appScrollTarget')
  targetId: string;

  /**
   * Optional: marks this element as "revealable" - meaning it should be clicked to reveal nested children
   * Defaults to true for elements with nested children via URL parameters
   * Set to false if the element should only be scrolled to, not clicked
   * 
   * @example
   *   appScrollTarget="item1" [appScrollTargetRevealable]="true"  (will be clicked to show children)
   *   appScrollTarget="section1" [appScrollTargetRevealable]="false"  (will only be scrolled to)
   */
  @Input('appScrollTargetRevealable')
  isRevealable: boolean = true;

  constructor(
    private elementRef: ElementRef,
    private queryParamNavigator: QueryParamNavigatorService
  ) {}

  ngOnInit(): void {
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
