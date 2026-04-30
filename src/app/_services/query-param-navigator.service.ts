/**
 * Query Parameter Navigator Service
 *
 * Service for navigating to nested components via URL queryParams.
 *
 * Usage:
 *   - URL: ?tab=actions&field=field-customer
 *   - URL: ?view=default.form&field=section-1
 *   - URL: ?view=Post:default.form&actions=action-1&field=item-5
 *
 * Strategy for keys:
 *   - 'field': Element ID or hierarchical field reference to focus
 *   - 'tab': tab/pane to activate
 *   - 'view': view to activate (in multi-view templates)
 *   - Other keys depending on registered activators
 */

import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { QueryParamActivatorRegistry, IQueryParamActivator, QueryParamNavigationPhase } from './query-param-activator.registry';

export interface QueryParamNavigationConfig {
  /**
   * Registry of activators for this component
   */
  activators: QueryParamActivatorRegistry;

  /**
   * Component context (object containing selectedTabIndex, menuItems, etc.)
   */
  context: any;

  /**
   * Additional delay before scrolling/focusing (useful if rendering takes time)
   */
  delay?: number;
}

interface QueryParamNavigationStep {
  key: string;
  value: any;
  activator: IQueryParamActivator;
  phase: QueryParamNavigationPhase;
  priority: number;
}

interface QueryParamNavigationPlan {
  steps: QueryParamNavigationStep[];
  fieldTarget: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class QueryParamNavigatorService {
  private scrollTargets: Map<string, HTMLElement> = new Map();
  private focusableFields: Map<string, HTMLElement> = new Map();
  private readyTargets: Set<string> = new Set();
  private readyWaiters: Map<string, Array<() => void>> = new Map();

  private readonly ELEMENT_WAIT_TIMEOUT = 10;
  private readonly VISIBILITY_CHECK_DELAY = 5;
  private readonly PHASE_ORDER: Record<QueryParamNavigationPhase, number> = {
    pre: 0,
    scope: 1,
    state: 2,
    target: 3
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Registers a scroll target element by its ID, called by the appScrollTarget directive
   */
  registerScrollTarget(id: string, element: HTMLElement): void {
    this.scrollTargets.set(id, element);
    this.signalReady(id);
  }

  /**
   * Unregisters a scroll target element (e.g. when destroyed)
   */
  unregisterScrollTarget(id: string): void {
    this.scrollTargets.delete(id);
    this.readyTargets.delete(id);
  }

  /**
   * Registers a focusable field element by its ID
   * @param fieldId Unique identifier for the field
   * @param element The input/select/button element that can receive focus or be clicked
   */
  registerFocusableField(fieldId: string, element: HTMLElement): void {
    this.focusableFields.set(fieldId, element);
    this.signalReady(fieldId);
    console.log(`Registered focusable field: ${fieldId}`, element);
  }

  /**
   * Unregisters a focusable field
   */
  unregisterFocusableField(fieldId: string): void {
    this.focusableFields.delete(fieldId);
    this.readyTargets.delete(fieldId);
  }

  private signalReady(id: string): void {
    this.readyTargets.add(id);

    const waiters = this.readyWaiters.get(id);
    if (!waiters || waiters.length === 0) {
      return;
    }

    for (const resolve of waiters) {
      resolve();
    }

    this.readyWaiters.delete(id);
  }

  private async waitForRegistration(id: string, timeoutMs: number = this.ELEMENT_WAIT_TIMEOUT): Promise<void> {
    if (this.readyTargets.has(id)) {
      return;
    }

    await new Promise<void>(resolve => {
      let settled = false;
      let timeoutRef: ReturnType<typeof setTimeout> | null = null;
      const waiters = this.readyWaiters.get(id) || [];
      const wrappedResolve = () => {
        if (settled) {
          return;
        }
        settled = true;
        if (timeoutRef) {
          clearTimeout(timeoutRef);
          timeoutRef = null;
        }
        resolve();
      };

      waiters.push(wrappedResolve);
      this.readyWaiters.set(id, waiters);

      timeoutRef = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        const currentWaiters = this.readyWaiters.get(id);
        if (currentWaiters) {
          const index = currentWaiters.indexOf(wrappedResolve);
          if (index > -1) {
            currentWaiters.splice(index, 1);
          }

          if (currentWaiters.length === 0) {
            this.readyWaiters.delete(id);
          }
        }

        timeoutRef = null;
        resolve();
      }, timeoutMs);
    });
  }

  private async waitForVisibility(element: HTMLElement, timeoutMs: number = this.ELEMENT_WAIT_TIMEOUT): Promise<void> {
    if (element.offsetParent !== null) {
      return;
    }

    const start = Date.now();
    while (element.offsetParent === null) {
      if (Date.now() - start >= timeoutMs) {
        throw new Error('Element is registered but not visible before timeout.');
      }

      await new Promise(resolve => setTimeout(resolve, this.VISIBILITY_CHECK_DELAY));
    }
  }

  /**
   * Parses a hierarchical field ID into parent and leaf levels
   * Format: "level1-level2-level3" creates hierarchy ["level1", "level1-level2", "level1-level2-level3"]
   * 
   * @param fieldId The hierarchical field ID (e.g., "customer-details-email")
   * @returns Array of progressively complete IDs representing the hierarchy path
   */
  private parseHierarchy(fieldId: string): string[] {
    if (!fieldId) return [];
    
    const parts = fieldId.split('-');
    if (parts.length === 1) {
      return [fieldId];
    }
    
    return parts.reduce((acc: string[], part, index) => {
      acc.push(index === 0 ? part : `${acc[index - 1]}-${part}`);
      return acc;
    }, []);
  }

  /**
   * Waits for an element to be registered and visible
   * 
   * @param elementId The element ID to wait for
   * @param timeoutMs Max wait time (ms)
   * @returns Promise resolving to the element once visible
   */
  private async waitForElement(
    elementId: string,
    timeoutMs: number = this.ELEMENT_WAIT_TIMEOUT
  ): Promise<HTMLElement> {
    let element = this.focusableFields.get(elementId) || this.scrollTargets.get(elementId);
    if (!element) {
      await this.waitForRegistration(elementId, timeoutMs);
      element = this.focusableFields.get(elementId) || this.scrollTargets.get(elementId);
    }

    if (!element) {
      throw new Error(`Element "${elementId}" not registered before timeout.`);
    }

    await this.waitForVisibility(element, timeoutMs);
    return element;
  }

  /**
   * Extracts the actual focusable input element from a wrapper (e.g., Material form field)
   * Searches for: input[matinput], input with type, or any input element
   * 
   * @param element The wrapper or input element
   * @returns The actual input element, or the original element if no input found
   */
  private extractFocusableInput(element: HTMLElement): HTMLElement {
    if (element.tagName === 'INPUT') {
      return element;
    }

    let input = element.querySelector('input[matinput]') as HTMLElement;
    if (input) {
      return input;
    }

    input = element.querySelector('mat-form-field input') as HTMLElement;
    if (input) {
      return input;
    }

    input = element.querySelector('input') as HTMLElement;
    if (input) {
      return input;
    }

    // Return original element if no input found
    return element;
  }

  /**
   * Activates a hierarchy of elements by scrolling, focusing, and clicking each level
   * 
   * @param hierarchy Array of hierarchical element IDs
   * @param config Navigation configuration
   */
  private async activateHierarchy(
    hierarchy: string[],
    config: QueryParamNavigationConfig
  ): Promise<void> {
    console.log('Activating hierarchy:', hierarchy);
    for (const levelId of hierarchy) {
      try {
        let element = await this.waitForElement(levelId);
        // Scroll to element
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const focusableElement = this.extractFocusableInput(element);
        focusableElement.focus();
        
        // If element is mat-checkbox, click its .mat-checkbox-layout child; otherwise click the element itself
        if (element.classList.contains('mat-checkbox')) {
          const checkboxInput = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
          if (!checkboxInput || !checkboxInput.checked) {
            const layoutChild = element.querySelector('.mat-checkbox-layout');
            if (layoutChild) {
              (layoutChild as HTMLElement).click();
            } else {
              element.click();
            }
          }
        } else {
          // For inputs, clicking may not be necessary - focus is usually enough
          // But we'll click checkboxes, buttons, and other interactive elements
          if (focusableElement.tagName !== 'INPUT' && focusableElement.tagName !== 'TEXTAREA' && focusableElement.tagName !== 'SELECT') {
            element.click();
          }
        }

        // console.log('Focused & clicked element:', levelId, { wrapper: element, focusable: focusableElement });
        
        await new Promise(resolve => setTimeout(resolve, config.delay));
      } catch (error) {
        console.warn(`Failed to activate "${levelId}":`, error);
      }
    }
  }

  /**
   * Public helper to focus a field by ID without running full query-param activation.
   */
  async focusField(fieldValue: string, delay: number = 0): Promise<void> {
    await this.navigateToField(fieldValue, {
      activators: new QueryParamActivatorRegistry(),
      context: null,
      delay
    });
  }

  /**
   * Handles all query parameters by activating components and navigating to target field
   * 
   * Process:
   * 1. Activate intermediate components using registered activators (tab, view, etc.)
   * 2. Navigate to the target field if present
   *
   * @param queryParams Object of queryParams (e.g. {tab: 'actions', field: 'field-customer'})
   * @param config Configuration for navigation
   */
  async handleQueryParams(
    queryParams: { [key: string]: any },
    config: QueryParamNavigationConfig
  ): Promise<void> {
    console.log('Handling queryParams:', queryParams);
    // console.log('Handling queryParams:', queryParams);
    const plan = this.buildNavigationPlan(queryParams, config);

    for (const step of plan.steps) {
      try {
        console.log(`Activating step: ${step.key}=${step.value} (phase: ${step.phase}, priority: ${step.priority})`);
        await step.activator.activate(step.key, step.value, config.context);
      } catch (error) {
        console.error(`Error activating "${step.key}=${step.value}":`, error);
      }
    }

    if (plan.fieldTarget) {
      await this.navigateToField(plan.fieldTarget, config);
    }
  }

  private buildNavigationPlan(
    queryParams: { [key: string]: any },
    config: QueryParamNavigationConfig
  ): QueryParamNavigationPlan {
    const steps: QueryParamNavigationStep[] = [];
    const hasFieldParam = Object.prototype.hasOwnProperty.call(queryParams, 'field');
    const fieldTarget = hasFieldParam ? this.populateFieldParam(queryParams) : null;
    let fieldConsumed = false;

    for (const [key, value] of Object.entries(queryParams)) {
      if (key === 'field') {
        const fieldActivator = config.activators.findActivator(key, value);
        if (fieldActivator) {
          steps.push(this.createNavigationStep(key, value, fieldActivator));
          fieldConsumed = fieldConsumed || fieldActivator.consumesFieldParam === true;
        }
        continue;
      }

      const activator = config.activators.findActivator(key, value);
      if (activator) {
        steps.push(this.createNavigationStep(key, value, activator));
      }
    }

    steps.sort((left, right) => {
      const phaseDifference = this.PHASE_ORDER[left.phase] - this.PHASE_ORDER[right.phase];
      if (phaseDifference !== 0) {
        return phaseDifference;
      }

      const priorityDifference = left.priority - right.priority;
      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return 0;
    });

    return {
      steps,
      fieldTarget: fieldTarget && !fieldConsumed ? fieldTarget : null
    };
  }

  private createNavigationStep(
    key: string,
    value: any,
    activator: IQueryParamActivator
  ): QueryParamNavigationStep {
    return {
      key,
      value,
      activator,
      phase: this.resolveStepPhase(key, activator),
      priority: activator.priority ?? 0
    };
  }

  private resolveStepPhase(key: string, activator: IQueryParamActivator): QueryParamNavigationPhase {
    if (activator.phase) {
      return activator.phase;
    }

    if (key === 'field') {
      return activator.consumesFieldParam ? 'pre' : 'state';
    }

    if (key === 'tab' || key === 'view' || key === 'view_tab') {
      return 'scope';
    }

    return 'scope';
  }

  private populateFieldParam(queryParams: { [key: string]: any }): string {
    let fullKey = queryParams['field'];
    if (queryParams['view_tab']) {
      fullKey = `${queryParams['view_tab']}-${fullKey}`;
    }
    if (queryParams['view']) {
      fullKey = `${queryParams['view']}-${fullKey}`;
    }
    if (queryParams['tab']) {
      fullKey = `${queryParams['tab']}-${fullKey}`;
    }

    return fullKey;
  }

  /**
   * Navigates to a field - handles both simple element IDs and hierarchical references
   * 
   * @param fieldValue The field value (element ID or hierarchical field reference)
   * @param config Navigation configuration
   */
  private async navigateToField(
    fieldValue: string,
    config: QueryParamNavigationConfig
  ): Promise<void> {
    try {
      // console.log('Navigating to field:', fieldValue);
      const hierarchy = this.parseHierarchy(fieldValue);
      
      if (hierarchy.length > 1) {
        await this.activateHierarchy(hierarchy, config);
      } else {
        try {
          let element = await this.waitForElement(fieldValue);
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          const focusableElement = this.extractFocusableInput(element);
          focusableElement.focus();
          
          if (focusableElement.tagName !== 'INPUT' && focusableElement.tagName !== 'TEXTAREA' && focusableElement.tagName !== 'SELECT') {
            element.click();
          }
        } catch (error) {
          console.warn(`Field "${fieldValue}" not found:`, error);
        }
      }
    } catch (error) {
      console.error(`Error navigating to field "${fieldValue}":`, error);
    }
  }

  /**
   * Creates a shareable URL with queryParams
   *
   * @example
   * const url = this.queryParamNavigator.createLink({tab: 'actions', field: 'field-customer'});
   * // Result: '?tab=actions&field=field-customer'
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
   *   field: 'field-customer'
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
   *
   * @example
   * this.queryParamNavigator.updateParams({field: 'field-customer'});
   * // If ?tab=actions already exists, the result will be ?tab=actions&field=field-customer
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
   * Gets all registered focusable fields (useful for debugging)
   */
  getRegisteredFields(): string[] {
    return Array.from(this.focusableFields.keys());
  }

  /**
   * Clears all registered scroll targets
   */
  clearScrollTargets(): void {
    this.scrollTargets.clear();
  }

  /**
   * Clears all registered focusable fields
   */
  clearFocusableFields(): void {
    this.focusableFields.clear();
  }
}
