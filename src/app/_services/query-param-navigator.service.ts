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

  // Default scroll options if not provided in config
  private defaultScrollOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'start',
  };

  // Keys to identify the final element to scroll to (can be overridden in config)
  private defaultElementKeys = ['element', 'field'];

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
    this.scrollTargets.set(id, element);
  }

  /**
   * Unregisters a scroll target element (e.g. when destroyed), called by the appScrollTarget directive
   */
  unregisterScrollTarget(id: string): void {
    this.scrollTargets.delete(id);
  }

  /**
   * Navigates to the element specified in the queryParams, activating intermediate components as needed based on the provided activators.
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
   *       elementKeys: ['element', 'field']
   *     });
   *   }
   * });
   */
  async handleQueryParams(
    queryParams: { [key: string]: any },
    config: QueryParamNavigationConfig
  ): Promise<void> {
    const elementKeys = config.elementKeys || this.defaultElementKeys;
    
    // Iterate over queryParams and activate intermediate components (tabs, views, etc.) using the activators
    for (const [key, value] of Object.entries(queryParams)) {
      // Ignore the keys that are meant to identify the final element to scroll to
      if (elementKeys.includes(key)) {
        continue;
      }

      console.log(`Handling query param "${key}=${value}"`);
      
      const activator = config.activators.findActivatorByKey(key);
      console.log(`Found activator for "${key}":`, activator);
      
      if (activator) {
        try {
          await activator.activate(key, value, config.context);
          console.log(`Activated "${key}=${value}" successfully`);
        } catch (error) {
          console.error(`Error activating "${key}=${value}":`, error);
        }
      }
    }

    // After activating all intermediate components, scroll to the final element if specified in queryParams
    const elementId = this.findElementInParams(queryParams, elementKeys);
    if (elementId) {
      await this.scrollToElement(elementId, config);
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
