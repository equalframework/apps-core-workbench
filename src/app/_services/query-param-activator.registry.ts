/**
 * Query Parameter Activator Registry
 * 
 * Extensible system for activating nested components (tabs, menus, etc.) before scrolling to the final element, based on queryParams.
 * 
 */

/**
 * Activators are responsible for activating intermediate elements
 * (e.g. selecting a tab before scrolling to an element it contains)
 */
export interface IQueryParamActivator {
  /**
   * Activator's type (e.g. 'tab', 'menu', 'expandable')
    * Used for logging and debugging
   */
  type: string;

  /**
   * The queryParam keys that this activator can handle
   * (e.g. ['tab'] to handle ?tab=..., or ['layout', 'header'] to handle ?layout=... or ?header=...)
   */
  queryParamKeys: string[];

  /**
   * Checks if this activator can handle the specified key and value
   * @param key QueryParam key (e.g. 'tab', 'view', 'layout')
   * @param value QueryParam value (e.g. 'actions', 'default.form')
   */
  canHandle(key: string, value: any): boolean;

  /**
   * Activates the specified element
   * @param key QueryParam key
   * @param value QueryParam value
   * @param context Component context (may contain selectedTabIndex, viewObj, etc.)
   * @returns Promise that resolves when activation and rendering are complete
   */
  activate(key: string, value: any, context: any): Promise<void>;
}

/**
 * Central registry of activators for queryParams, allowing custom activators for each activation type
 */
export class QueryParamActivatorRegistry {
  private activators: Map<string, IQueryParamActivator> = new Map();

  /**
   * Registers a new activator
   */
  register(activator: IQueryParamActivator): void {
    activator.queryParamKeys.forEach(key => {
      this.activators.set(key, activator);
    });
  }

  /**
   * Find the appropriate activator for a queryParam key
   * @param key QueryParam key (e.g. 'tab', 'view', 'layout')
   */
  findActivatorByKey(key: string): IQueryParamActivator | undefined {
    return this.activators.get(key);
  }

  /**
   * Find an activator that can handle the specified key and value
   */
  findActivator(key: string, value: any): IQueryParamActivator | undefined {
    const activator = this.activators.get(key);
    if (activator && activator.canHandle(key, value)) {
      return activator;
    }
    return undefined;
  }

  /**
   * Returns all registered activators (unique by type)
   */
  getAll(): IQueryParamActivator[] {
    const uniqueActivators = new Map<string, IQueryParamActivator>();
    this.activators.forEach((activator) => {
      uniqueActivators.set(activator.type, activator);
    });
    return Array.from(uniqueActivators.values());
  }

  /**
   * Returns the number of registered activators (unique by type)
   */
  count(): number {
    const uniqueActivators = new Set<string>();
    this.activators.forEach((activator) => {
      uniqueActivators.add(activator.type);
    });
    return uniqueActivators.size;
  }
}

/**
 * Activator for tabs (Material TabGroup)
 * Selects a tab by its name based on the 'tab' queryParam
 */
export class QueryParamTabActivator implements IQueryParamActivator {
  type = 'tab';
  queryParamKeys = ['tab'];

  /**
   * @param tabNameToIndexMap Mapping of the tab name (e.g. 'actions') to its index (e.g. 2)
   * @param tabIndexProperty Name of the property in the context that contains the selected index (e.g. 'selectedTabIndex')
   */
  constructor(
    private tabNameToIndexMap: { [key: string]: number },
    private tabIndexProperty: string = 'selectedTabIndex'
  ) {}

  canHandle(key: string, value: any): boolean {
    return key === 'tab' && (value in this.tabNameToIndexMap);
  }

  async activate(key: string, value: any, context: any): Promise<void> {
    if (value in this.tabNameToIndexMap) {
      const tabIndex = this.tabNameToIndexMap[value];
      context[this.tabIndexProperty] = tabIndex;
      // Wait for the tab and its content to be rendered
      await this.waitForTabContent();
    }
  }

  /**
   * Wait for the tab content to be rendered (after changeDetection)
   */
  private async waitForTabContent(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 100);
    });
  }
}

/**
 * Activator for views (for components with multiple views)
 * Selects a view by its name based on 'view' queryParam
 */
export class QueryParamViewActivator implements IQueryParamActivator {
  type = 'view';
  queryParamKeys = ['view'];

  /**
   * @param viewOptions Function or list of available views
   * @param viewProperty Name of the property in the context that contains the active view
   */
  constructor(
    private viewOptions: string[] | ((context: any) => string[]),
    private viewProperty: string = 'activeView'
  ) {}

  canHandle(key: string, value: any): boolean {
    if (key !== 'view' || !value) return false;
    
    const availableViews = typeof this.viewOptions === 'function'
      ? this.viewOptions({})
      : this.viewOptions;
    
    return availableViews.includes(value);
  }

  async activate(key: string, value: any, context: any): Promise<void> {
    const availableViews = typeof this.viewOptions === 'function'
      ? this.viewOptions(context)
      : this.viewOptions;
    
    if (availableViews.includes(value)) {
      context[this.viewProperty] = value;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}

/**
 * Custom activator for multiple keys
 * Allows creating an activator that handles multiple queryParam keys
 * Useful for layouts, headers, actions, routes, etc.
 */
export class QueryParamCustomActivator implements IQueryParamActivator {
  type: string;
  queryParamKeys: string[];

  /**
   * @param type Type of activator (e.g. 'layout', 'action')
   * @param queryParamKeys Keys that this activator handles
   * @param activateCallback Custom activation function
   */
  constructor(
    type: string,
    queryParamKeys: string[],
    private activateCallback: (key: string, value: any, context: any) => Promise<void>
  ) {
    this.type = type;
    this.queryParamKeys = queryParamKeys;
  }

  canHandle(key: string, value: any): boolean {
    return this.queryParamKeys.includes(key) && value !== null && value !== undefined;
  }

  async activate(key: string, value: any, context: any): Promise<void> {
    await this.activateCallback(key, value, context);
  }
}

/**
 * Activator for expandable elements ( accordions, collapsible panels, etc.)
 * Expands/opens an element to show its content
 */
export class QueryParamExpandableActivator implements IQueryParamActivator {
  type = 'expandable';
  queryParamKeys: string[];

  /**
   * @param elementIdPrefixes Prefixes for identifying expandable elements (e.g. ['section-', 'panel-'])
   * @param expandCallback Function to expand an element by its ID
   */
  constructor(
    private elementIdPrefixes: string[],
    private expandCallback: (elementId: string) => Promise<void>
  ) {
    this.queryParamKeys = [];  // The prefixes will be checked in canHandle
  }

  canHandle(key: string, value: any): boolean {
    // This activator is generally not based on a specific queryParam key,
    // but rather on the value format (e.g. element IDs starting with 'section-' or 'panel-').
    return value && this.elementIdPrefixes.some(prefix => 
      String(value).startsWith(prefix)
    );
  }

  async activate(key: string, value: any, context: any): Promise<void> {
    await this.expandCallback(String(value));
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
