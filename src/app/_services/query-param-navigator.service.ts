/**
 * Query Parameter Navigator Service
 * 
 * Service for navigating to nested components via URL queryParams.
 * 
 * 
 * Usage:
 *   - URL: ?tab=actions&element=field-customer
 *   - URL: ?view=default.form&element=section-1
 *   - URL: ?view=Post:default.form&actions=action-1&element=item-5
 * 
 * Strategy for redundant keys:
 *   - 'element' or 'field': final element to scroll to (accepts multiple aliases)
 *   - 'tab': tab/pane to activate
 *   - 'view': view to activate (in multi-view templates)
 *   - Other keys depending on registered activators
 */

import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { QueryParamActivatorRegistry, IQueryParamActivator } from './query-param-activator.registry';

export interface QueryParamNavigationConfig {
  /**
   * Registry of activators for this component
   */
  activators: QueryParamActivatorRegistry;

  /**
   * Component context (object containing selectedTabIndex, menuItems, etc.)
   * Will be passed to the activators
   */
  context: any;

  /**
   * Callback called when scroll is to be performed
   */
  onScroll?: (elementId: string) => void;

  /**
   * Scroll options (behavior, alignment, etc.)
   */
  scrollOptions?: ScrollIntoViewOptions;

  /**
   * Additional delay before scrolling (useful if rendering takes time)
   */
  scrollDelay?: number;

  /**
   * List of keys to consider as the final element to scroll to
   * (e.g. ['element', 'field'] to accept ?element=... or ?field=...)
   */
  elementKeys?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class QueryParamNavigatorService {
  // Mapping global of elementId -> elements with appScrollTarget
  private scrollTargets: Map<string, HTMLElement> = new Map();

  // Mapping of fieldId -> input/select/button elements that can receive focus or be clicked
  private focusableFields: Map<string, HTMLElement> = new Map();

  private focusableFieldTags = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'MAT-CHECKBOX', 'TYPE-INPUT', 'MAT-SELECT']; // Allow custom components like app-item-editor as focusable fields

  // Default scroll options if not provided in config
  private defaultScrollOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'start',
  };

  // Keys to identify the final element to scroll to (can be overridden in config)
  private defaultElementKeys = ['element'];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Listen for queryParams changes
    this.route.queryParams.subscribe((params) => {
      // The processing of queryParams will be done by handleQueryParams()
      // called in the components that use this service
    });
  }

  /**
   * Registers a scroll target element by its ID, called by the appScrollTarget directive
   */
  registerScrollTarget(id: string, element: HTMLElement): void {
    if (!this.scrollTargets.get(id)) {
      this.scrollTargets.set(id, element);
    } else {
      console.warn(`${id} already has an entry in scroll with ${this.scrollTargets.get(id)} and not ${element}`)
    }
  }

  /**
   * Unregisters a scroll target element (e.g. when destroyed), called by the appScrollTarget directive
   */
  unregisterScrollTarget(id: string): void {
    this.scrollTargets.delete(id);
  }

  /**
   * Registers a focusable field element by its ID, called by the appFocusableField directive
   * @param fieldId Unique identifier for the field (e.g. 'item-1-value', 'customer-id-input', 'submit-button')
   * @param element The input/select/button element that can receive focus or be clicked
   */
  registerFocusableField(fieldId: string, element: HTMLElement): void {
    if (this.focusableFieldTags.includes((element as any).tagName)) {
      this.focusableFields.set(fieldId, element);
    } else {
      console.warn(`Element with appFocusableField="${fieldId}" is not a focusable input/select/textarea/button`, element);
    }
  }

  /**
   * Unregisters a focusable field (e.g. when destroyed), called by the appFocusableField directive
   */
  unregisterFocusableField(fieldId: string): void {
    this.focusableFields.delete(fieldId);
  }

  /**
   * Navigates to the element specified in the queryParams, activating intermediate components as needed based on the provided activators.
   * 
   * Handles both 'element' and 'field' query parameters:
   * - 'element': Scrolls to an element
   * - 'field': Scrolls to the element containing the field AND focuses the field
   * 
   * @param queryParams Object of queryParams (e.g. {tab: 'actions', element: 'field-customer'})
   * @param config Specific configuration for this component
   * 
   * @example
   * this.route.queryParams.subscribe(params => {
   *   if (Object.keys(params).length > 0) {
   *     this.queryParamNavigator.handleQueryParams(params, {
   *       activators: this.activatorRegistry,
   *       context: this,
   *       elementKeys: ['element'],
   *       scrollDelay: 100
   *     });
   *   }
   * });
   */
  async handleQueryParams(
    queryParams: { [key: string]: any },
    config: QueryParamNavigationConfig
  ): Promise<void> {
    const elementKeys = config.elementKeys || this.defaultElementKeys;
    const fieldKey = 'field';
    
    // Check if we have a field parameter
    const hasFieldParam = fieldKey in queryParams;
    const fieldId = hasFieldParam ? queryParams[fieldKey] : undefined;
    
    // Iterate over queryParams and activate intermediate components (tabs, views, etc.) using the activators
    for (const [key, value] of Object.entries(queryParams)) {
      // Ignore the keys that are meant to identify the final element or field to focus
      if (elementKeys.includes(key) || key === fieldKey) {
        //console.log(`Skipping key "${key}" for intermediate activation, reserved for final element/field targeting`);
        continue;
      }

      //console.log(`Handling query param "${key}=${value}"`);
      
      const activator = config.activators.findActivatorByKey(key);
      
      if (activator) {
        try {
          await activator.activate(key, value, config.context);
          //console.log(`Activated "${key}=${value}" successfully`);
        } catch (error) {
          console.error(`Error activating "${key}=${value}":`, error);
        }
      }
    }

    // After activating all intermediate components, handle element and field parameters
    const elementId = this.findElementInParams(queryParams, elementKeys);
    
    // If we have both element and field, scroll to element first then focus field
    if (elementId && hasFieldParam) {
      await this.scrollToElement(elementId, config);
      await this.focusField(fieldId, config);
    }
    // If we have only element, just scroll
    else if (elementId) {
      await this.scrollToElement(elementId, config);
    }
    // If we have only field, scroll to the field's element (the parent containing the focusable field)
    else if (hasFieldParam) {
      // Try to find the element containing this field
      const fieldElement = this.focusableFields.get(fieldId);
      if (fieldElement) {
        // Find the closest scroll target parent
        let parent = fieldElement.closest('[appScrollTarget]');
        if (parent) {
          const parentId = parent.getAttribute('appScrollTarget');
          if (parentId) {
            await this.scrollToElement(parentId, config);
          }
        }
      }
      await this.focusField(fieldId, config);
    }
  }

  /**
   * Finds the ID of the element in the queryParams using multiple alias keys
   * @param queryParams Object of queryParams
   * @param elementKeys Keys to check
   * @returns The ID of the element or undefined
   */
  private findElementInParams(
    queryParams: { [key: string]: any },
    elementKeys: string[]
  ): string | undefined {
    for (const key of elementKeys) {
      if (queryParams[key]) {
        return queryParams[key];
      }
    }
    return undefined;
  }

  /**
   * Scrolls to a specific element
   * 
   * @param elementId ID of the element (must have appScrollTarget)
   * @param config Configuration for the scroll
   */
  async scrollToElement(
    elementId: string,
    config: Omit<QueryParamNavigationConfig, 'context'>
  ): Promise<void> {

    const delay = config.scrollDelay || 0;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    const element = this.scrollTargets.get(elementId);
    
    if (element) {
      const scrollOptions = config.scrollOptions || this.defaultScrollOptions;
      element.scrollIntoView(scrollOptions);
      //console.log(`Scrolled to element with appScrollTarget="${elementId}"`, element);

      if (element.classList.contains('mat-list-item') || element.className.match('item-pretty')) {
        // If it's a mat-list-item/item-pretty (exclusive to menus), select it to enable selection of sub-menu items
        element.focus(); // Focus to trigger :focus styles
        element.click(); // Trigger click to activate any hover effects
      }

      // Optional callback after scrolling (e.g. to update URL, log analytics, etc.)
      if (config.onScroll) {
        config.onScroll(elementId);
      }
    } else {
      console.warn(
        `Element with appScrollTarget="${elementId}" not found. ` +
        `Available targets: ${Array.from(this.scrollTargets.keys()).join(', ')}`
      );
    }
  }

  /**
   * Focuses a specific field element or clicks a button
   * 
   * @param fieldId ID of the field or button (must have appFocusableField)
   * @param config Configuration for the operation
   */
  async focusField(
    fieldId: string,
    config: Omit<QueryParamNavigationConfig, 'context'>
  ): Promise<void> {
    const delay = config.scrollDelay || 0;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const fieldElement = this.focusableFields.get(fieldId);
    
    if (fieldElement) {
      const tagName = (fieldElement as any).tagName;
      // For button elements, click them
      if (tagName === 'BUTTON' || tagName === 'MAT-SELECT') {
        (fieldElement as any).click();
      }
      else if (tagName === 'MAT-CHECKBOX') {
        const innerInput = fieldElement.querySelector('input[type="checkbox"]') as HTMLElement;
        if (innerInput) {
          innerInput.focus();
          innerInput.click();
        }
      }
      // For native HTML form elements (input, select, textarea), focus them
      else if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
        (fieldElement as any).focus();
      } else {
        // For other elements, try to find an input/select/textarea/button inside
        const focusableChild = fieldElement.querySelector('input, select, textarea, button') as HTMLElement;
        if (focusableChild) {
          if ((focusableChild as any).tagName === 'BUTTON') {
            (focusableChild as any).click();
          } else {
            focusableChild.focus();
          }
        } else {
          console.warn(`Field with appFocusableField="${fieldId}" has no focusable child element`);
        }
      }
    } else {
      console.warn(
        `Field with appFocusableField="${fieldId}" not found. ` +
        `Available fields: ${Array.from(this.focusableFields.keys()).join(', ')}`
      );
    }
  }

  /**
   * Creates a shareable URL with queryParams
   * 
   * @example
   * const url = this.queryParamNavigator.createLink({tab: 'actions', element: 'field-customer'});
   * // Result: '?tab=actions&element=field-customer'
   */
  createLink(params: { [key: string]: any }): string {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return `?${queryString}`;
  }

  /**
   * Navigates to the specified queryParams
   * 
   * @example
   * this.queryParamNavigator.navigateWithParams({
   *   tab: 'actions',
   *   element: 'field-customer'
   * });
   */
  navigateWithParams(params: { [key: string]: any }, queryParamsHandling: 'merge' | 'preserve' = 'merge'): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: queryParamsHandling
    });
  }

  /**
   * Combine the existing queryParams with the new ones
   * Useful for adding a scroll target without losing other params
   * 
   * @example
   * this.queryParamNavigator.updateParams({element: 'field-customer'});
   * // If ?tab=actions already exists, the result will be ?tab=actions&element=field-customer
   */
  updateParams(paramsToAdd: { [key: string]: any }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: paramsToAdd,
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Clears a specific queryParam
   */
  clearParam(key: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: null },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Gets all registered targets (useful for debugging)
   */
  getRegisteredTargets(): string[] {
    return Array.from(this.scrollTargets.keys());
  }

  /**
   * Clears all registered scroll targets
   */
  clearScrollTargets(): void {
    this.scrollTargets.clear();
  }
}
