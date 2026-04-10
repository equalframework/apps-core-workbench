import { Component, OnInit, ChangeDetectorRef, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { QueryParamActivatorRegistry, QueryParamTabActivator } from 'src/app/_services/query-param-activator.registry';

import { Translator } from '../../model/model-trad-editor/_object/Translation';
import { Menu } from '../_models/Menu';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';

import { MenuTranslationValue, MenuTranslationField, MenuFieldColumnConfig, MENU_FIELD_CONFIGS } from './_object/menu-translation.types';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { ca } from 'date-fns/locale';
import { Location } from '@angular/common';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';

@Component({
  selector: 'app-menu-trad-editor',
  templateUrl: './menu-trad-editor.component.html',
  styleUrls: ['./menu-trad-editor.component.scss']
})
export class MenuTradEditorComponent implements OnInit {
    packageName = '';
    menuName = '';
    lang = '';

    error = false;
    loading = true;
    addingLanguage = false;
    activeTab = 'menu';
    activeField = '';
    public isSaving = false;

    langName = new FormControl('', { validators: [ MenuTradEditorComponent.langCaseValidator ] });
    localSchema: { [id: string]: Translator } = {};
    checkedItems: { [lang: string]: Set<string> } = {}; // Tracks which items are checked (editable) per language
    allLanguages = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl'];
    availableLanguages: string[] = [];
    public readonly FIELD_CONFIGS = MENU_FIELD_CONFIGS;
    public readonly TAB_NAMES = ['menu'];

    private _menuScheme: Menu | null = null;
    private _menuMetadata: Map<string, any> = new Map(); // Maps menu item IDs to their metadata (type, icon, etc.)
    private _hierarchyMap: Map<string, string | null> = new Map(); // Maps item ID to parent ID (null for root items)
    private _childrenMap: Map<string, string[]> = new Map(); // Maps parent ID to array of children IDs
    private backgroundTranslationsLoadStarted = false;
    private backgroundPreloadStarted = false;
    private provider: EqualComponentsProviderService | null = null;
    private activatorRegistry: QueryParamActivatorRegistry;

    static langCaseValidator(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value;
        const lower = 'abcdefghijkmlnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        switch (value.length) {
            case 5:
                if (value[2] !== '_') { return { case: true }; }
                if (!upper.includes(value[3])) { return { case: true }; }
                if (!upper.includes(value[4])) { return { case: true }; }
                break;
            case 2:
                if (!lower.includes(value[0])) { return { case: true }; }
                if (!lower.includes(value[1])) { return { case: true }; }
                break;
            default:
                return { case: true };
        }
        return null;
    }

    constructor(
        private route: ActivatedRoute,
        private workbenchService: WorkbenchService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private location: Location,
        private queryParamNavigator: QueryParamNavigatorService,
        private injector: Injector,
        private jsonValidationService: JsonValidationService
    ) {
        this.activatorRegistry = new QueryParamActivatorRegistry();
    }


    private initializeNavigation(): void {
        const allTabs = this.TAB_NAMES;
        const tabActivator = {
            type: 'tab',
            queryParamKeys: ['tab'],
            canHandle: (key: string, value: any) => {
                return key === 'tab' && allTabs.includes(value);
            },
            activate: async (key: string, value: any, context: any) => {
                if (allTabs.includes(value)) {
                    context.activeTab = value;
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        };
        this.activatorRegistry.register(tabActivator);

        const fieldActivator = {
            type: 'field',
            queryParamKeys: ['element', 'field'],
            canHandle: (key: string, value: any) => {
                if (!['element', 'field'].includes(key)) { return false; }
                // Don't check fieldExists here - we'll validate in activate phase if needed
                return true;
            },
            activate: async (key: string, value: any, context: any) => {
                context.activeField = value;

                // Wait longer for template to render the table rows with appScrollTarget
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        };
        this.activatorRegistry.register(fieldActivator);
    }

    get selectedTabIndex(): number {
        return Math.max(0, this.TAB_NAMES.indexOf(this.activeTab));
    }

    async ngOnInit(): Promise<void> {
        this.loading = true;
        this.allLanguages = await this.workbenchService.collectAllLanguagesCode().toPromise() || [];
        const selectedPackage = this.route.parent?.snapshot.paramMap.get('package_name');
        const selectedMenu = this.route.snapshot.paramMap.get('menu_name');
        if (!selectedPackage || !selectedMenu) {
            this.error = true;
            return;
        }

        this.packageName = selectedPackage;
        this.menuName = selectedMenu;

        // Load menu schema and build metadata early
        await this.loadMenuSchemaAndMetadata();

        await this.initTranslations();

        // Initialize navigation activators
        this.initializeNavigation();

        // Subscribe to queryParams changes
        this.route.queryParams.subscribe(async params => {
            if (Object.keys(params).length === 0) {
                return;
            }

            // Handle tab parameter (set default to 'menu' if not present)
            if (params['tab']) {
                this.activeTab = params['tab'];
            } else if (params['element'] || params['field']) {
                // If element/field params are present, auto-activate the menu tab
                this.activeTab = 'menu';
            }

            // Handle element/field parameters - set activeField directly before calling navigator
            if (params['field']) {
                this.activeField = params['field'].split('-')[1];
            } else if (params['element']) {
                this.activeField = params['element'];
            }

            // Now use the navigator service to handle scroll and focus
            // This will respect the activeTab and activeField we just set
            await this.queryParamNavigator.handleQueryParams(params, {
                activators: this.activatorRegistry,
                context: this,
                elementKeys: ['element', 'field'],
                scrollDelay: 100,
                scrollOptions: { behavior: 'smooth', block: 'center' }
            });
        });

        this.loading = false;
        void this.fetchBackgroundData();
    }

    private async fetchBackgroundData(): Promise<void> {
        if (this.backgroundPreloadStarted) {
            return;
        }

        this.backgroundPreloadStarted = true;

        try {
            // Lazy-resolve provider so constructor-triggered preload starts only after critical editor data is ready.
            if (!this.provider) {
                this.provider = this.injector.get(EqualComponentsProviderService);
            }
        } catch (err) {
            console.error('Error during background data fetching', err);
        }
    }

    private fieldExists(lang: string | null | undefined, field: string): boolean {
        if (!lang) { return false; }
        const translator = this.localSchema[lang];
        if (!translator) { return false; }

        try {
            if (translator.view && translator.view['menu']) {
                const menuView = translator.view['menu'];
                if (menuView.layout && typeof menuView.layout === 'object') {
                    return this.obk(menuView.layout).includes(field);
                }
            }
        } catch (e) {}
        return false;
    }

    /**
     * Loads the menu schema and builds a metadata map for enriching translations
     */
    private async loadMenuSchemaAndMetadata(): Promise<void> {

        try {
            if (!this._menuScheme) {
                const raw = await this.workbenchService.readMenu(this.packageName, this.menuName).toPromise();
                this._menuScheme = new Menu(raw || {});
            }
            if (this._menuScheme && this._menuScheme.layout && this._menuScheme.layout.items) {
                // Clear hierarchy maps before rebuilding
                this._hierarchyMap.clear();
                this._childrenMap.clear();
                this._buildMenuMetadata(this._menuScheme.layout.items as any[]);
            }
        } catch (e) {
            console.warn('Error loading menu schema:', e);
        }
    }

    /**
     * Recursively builds metadata for all menu items from the menu schema
     * Maps item IDs to their properties (type, icon, label, etc.)
     * Also builds hierarchy maps that track parent-child relationships based on the children property
     */
    private _buildMenuMetadata(items: any[], parentId: string | null = null): void {
        if (!Array.isArray(items)) { return; }

        items.forEach(item => {
            if (item.id) {
                const itemId = item.id;
                this._menuMetadata.set(itemId, {
                    id: itemId,
                    shortId: item.id,
                    type: item.type, // 'parent' or 'entry'
                    icon: item.icon || null,
                    label: item.label || itemId,
                    context: item.context || null,
                    route: item.route || null
                });

                // Build hierarchy map: track parent and children relationships
                this._hierarchyMap.set(itemId, parentId);

                if (parentId) {
                    // Add to parent's children list
                    const children = this._childrenMap.get(parentId) || [];
                    if (!children.includes(itemId)) {
                        children.push(itemId);
                        this._childrenMap.set(parentId, children);
                    }
                }

                // Recursively process children (if any)
                if (item.children && Array.isArray(item.children)) {
                    this._buildMenuMetadata(item.children, itemId);
                }
            }
        });
    }

    /**
     * Get menu item metadata by ID
     */
    getMenuItemMetadata(itemId: string): any {
        return this._menuMetadata.get(itemId) || null;
    }

    /**
     * Get the parent ID of an item (based on children property, not dot notation)
     */
    getItemParentId(itemId: string): string | null {
        return this._hierarchyMap.get(itemId) || null;
    }

    /**
     * Get all children IDs for a parent item
     */
    getItemChildren(parentId: string): string[] {
        return this._childrenMap.get(parentId) || [];
    }

    /**
     * Calculate hierarchy depth based on actual parent-child relationships
     */
    getItemDepth(itemId: string): number {
        let depth = 0;
        let currentId: string | null = itemId;

        while (currentId) {
            currentId = this._hierarchyMap.get(currentId) || null;
            if (currentId) {
                depth++;
            }
        }

        return depth;
    }

    /**
     * Check if an item has children based on actual children relationships
     */
    itemHasChildren(itemId: string): boolean {
        return (this._childrenMap.get(itemId)?.length || 0) > 0;
    }

    /**
     * Build table items from the menu schema and match with current language translations.
     * This ensures all schema items are displayed, whether or not they have translations.
     * For each schema item, retrieves its translation value from local_schema[lang].view['menu'].layout[itemId]
     */
    getTableItems(): Record<string, any> {
        const items: Record<string, any> = {};

        if (!this._menuScheme || !this._menuScheme.layout || !this._menuScheme.layout.items) {
            console.warn('Menu schema or layout items not found. Returning empty items for translation table.');
            return items;
        }

        // Build items from schema and populate with current language translations
        this._buildTableItemsFromSchema(
            this._menuScheme.layout.items,
            items,
            null
        );


        return items;
    }

    /**
     * Recursively builds table items from schema items.
     * For each schema item, creates an entry in the items record with translation data from current language.
     * Hierarchy is preserved via the _hierarchyMap and _childrenMap built during metadata construction.
     */
    private _buildTableItemsFromSchema(
        schemaItems: any[],
        items: Record<string, any>,
        parentId: string | null = null
    ): void {
        if (!Array.isArray(schemaItems)) { return; }

        schemaItems.forEach(schemaItem => {
            if (schemaItem.id) {
                const itemId = schemaItem.id;

                // Get translation for this item from current language
                const translationData = this.getTranslationForItem(itemId);

                // Create item object combining schema info with translation
                items[itemId] = {
                    ...schemaItem,
                    ...translationData,
                    _parentId: parentId // Store parent reference for hierarchy navigation
                };

                // Recursively process children
                if (schemaItem.children && Array.isArray(schemaItem.children)) {
                    this._buildTableItemsFromSchema(schemaItem.children, items, itemId);
                }
            }
        });
    }

    /**
     * Get translation data for a specific menu item ID from the current language.
     * Returns translation field values from local_schema[lang].view['menu'].layout[itemId]
     * Also includes is_active flag based on checkedItems.
     */
    private getTranslationForItem(itemId: string): any {
        const translation: Record<string, any> = {};

        if (!this.lang || !this.localSchema[this.lang]) {
            return translation;
        }

        try {
            const languageData = this.localSchema[this.lang];
            const menuLayout = languageData?.view.menu.layout;
            if (menuLayout && menuLayout[itemId]) {
                const itemTranslation = menuLayout[itemId] as any;

                // Extract label translation if it exists
                if (itemTranslation.label) {
                    translation['label'] = itemTranslation.label;
                }
            }
        } catch (e) {
            console.warn(`Failed to get translation for item ${itemId}:`, e);
        }

        // Set is_active based on checkedItems (used by child component to show/hide editable fields)
        translation['is_active'] = this.isItemChecked(itemId);

        return translation;
    }

    async initTranslations(): Promise<void> {
        this.loading = true;
        this.backgroundTranslationsLoadStarted = false;
        this.localSchema = {};
        this.checkedItems = {};
        const existingTranslationLanguages: string[] = [];

        // Fetch existing languages
        try {
            const translationsByPackage = await this.workbenchService.getTranslationLanguagesByPackage(this.packageName).toPromise();
            for (const lang in translationsByPackage) {
                if (translationsByPackage[lang].includes(`${this.packageName}_menu.${this.menuName}`)) {
                    existingTranslationLanguages.push(lang);
                }
            }
        } catch (e) {
            console.warn('Failed to fetch available translation languages for package:', e);
            this.loading = false;
            this.updateAvailableLanguages();
            return;
        }

        if (existingTranslationLanguages.length === 0) {
            this.loading = false;
            this.updateAvailableLanguages();
            return;
        }

        const firstLang = existingTranslationLanguages[0] || null;
        if (firstLang) {
            await this.loadSingleLanguageTranslation(firstLang);
            this.lang = firstLang;
            this.loading = false; // Reveal UI as soon as first language is ready
            this.updateAvailableLanguages();
            void this.fetchRemainingTranslationsInBackground(existingTranslationLanguages, firstLang);
        } else {
            this.loading = false;
            this.updateAvailableLanguages();
        }
    }

    private async loadSingleLanguageTranslation(lang: string): Promise<void> {
        try {
            const partialData: any =
            await this.workbenchService.getMenuTranslationsList(this.packageName, this.menuName, lang).toPromise();

            // Create a fresh Translator with all schema items
            const translator = await this.createNewMenuLang();
            if (!translator.ok) {
                console.warn(`Translator not OK for language ${lang}`);
                return;
            }

            // Merge partial translations into the fresh translator (making a local schema)
            if (partialData) {
                try {
                    // Fill name and description from partial data
                    if (partialData.name) {
                        translator.name.value = partialData.name;
                    }
                    if (partialData.description) {
                        translator.description.value = partialData.description;
                    }

                    // Manually merge view labels from partial data into translator's view.menu.layout
                    if (partialData.view && translator.view && translator.view['menu'] && translator.view['menu'].layout) {
                        const partialView = partialData.view;
                        const translatorLayout = translator.view['menu'].layout;

                        const skippedItems: string[] = [];

                        // For each item in the partial data, merge its label into the translator
                        for (const itemId in partialView) {
                            if (partialView[itemId]?.label) {
                                // Update the label value if the item exists in translator layout
                                if (translatorLayout[itemId] && translatorLayout[itemId].label) {
                                    translatorLayout[itemId].label.value = partialView[itemId].label;
                                } else {
                                    skippedItems.push(itemId);
                                }
                            }
                        }

                        if (skippedItems.length > 0) {
                            console.warn(`For language ${lang}, skipped merging ${skippedItems.length} items not found in translator layout:`, skippedItems);
                            console.warn('Available items in translator layout:', Object.keys(translatorLayout));
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to merge partial translation for ${lang}:`, e);
                }
            }

            // Initialize checked items set for this language
            this.checkedItems[lang] = new Set<string>();

            // Mark items as checked if they have a translation value
            this._markCheckedItemsForLanguage(lang, translator);

            this.localSchema[lang] = translator;
        } catch (e) {
            console.warn(`Failed to load translations for language ${lang}:`, e);
        }
    }

    private async fetchRemainingTranslationsInBackground(langs: string[], firstLang: string | null): Promise<void> {
        if (this.backgroundTranslationsLoadStarted) {
            return;
        }

        this.backgroundTranslationsLoadStarted = true;

        for (const lang of langs) {
            if (lang === firstLang) { continue; }
            await this.loadSingleLanguageTranslation(lang);
            this.updateAvailableLanguages();
        }

        this.cdr.detectChanges();
    }

    reload(): void {
        this._menuScheme = null;
        this._menuMetadata.clear();
        this._hierarchyMap.clear();
        this._childrenMap.clear();
        this.loading = true;
        this.initTranslations();
        this.loadMenuSchemaAndMetadata();
    }

    onLangChange(lang: string): void {
        this.lang = lang;
        this.activeField = '';
        this.cdr.detectChanges();
    }

    onTabChange(index: number): void {
        this.activeTab = this.TAB_NAMES[index] || 'menu';
        this.activeField = '';
    }

    async createNewMenuLang(): Promise<Translator> {
        if (!this._menuScheme) {
            const raw = await this.workbenchService.readMenu(this.packageName, this.menuName).toPromise();
            this._menuScheme = new Menu(raw || {});
        }
        const translator = Translator.MenuConstructor(new Menu(this._menuScheme.export()));
        return translator;
    }

    /**
     * Marks items as "checked" (editable) for a language if they have translation values.
     * Items with translations are those that have a non-empty label value.
     */
    private _markCheckedItemsForLanguage(lang: string, translator: Translator): void {
        if (!this.checkedItems[lang]) {
            this.checkedItems[lang] = new Set<string>();
        }

        if (translator.view && translator.view['menu'] && translator.view['menu'].layout) {
            const layout = translator.view['menu'].layout;
            let checkedCount = 0;
            const itemsWithLabels: { [key: string]: string } = {};
            const itemsWithoutLabels: string[] = [];

            for (const itemId in layout) {
                const item = layout[itemId];
                // Mark item as checked if it has a translation value (non-empty label)
                const labelValue = item?.label?.value;
                if (labelValue && typeof labelValue === 'string' && labelValue.trim() !== '') {
                    this.checkedItems[lang].add(itemId);
                    itemsWithLabels[itemId] = labelValue;
                    checkedCount++;
                } else {
                    itemsWithoutLabels.push(itemId);
                }
            }

        }
    }

    /**
     * Marks an item as checked for a language (making it editable).
     * Called when user starts editing an item or when navigation activates an item.
     */
    private setItemChecked(lang: string, itemId: string, checked: boolean): void {
        if (!this.checkedItems[lang]) {
            this.checkedItems[lang] = new Set<string>();
        }
        if (checked) {
            this.checkedItems[lang].add(itemId);
        } else {
            this.checkedItems[lang].delete(itemId);
        }
    }

    /**
     * Gets whether an item is checked (editable) for the current language.
     */
    isItemChecked(itemId: string): boolean {
        if (!this.lang || !this.checkedItems[this.lang]) {
            return false;
        }
        return this.checkedItems[this.lang].has(itemId);
    }

    obk(object: { [id: string]: any }): string[] {
        return Object.keys(object).sort((a, b) => a.localeCompare(b));
    }

    startAddingLanguage(): void {
        this.addingLanguage = true;
    }

    stopAddingLanguage(): void {
        this.addingLanguage = false;
    }

    async createLanguage(): Promise<void> {
        const selectedLang = this.langName.value;

        if (!selectedLang) { return; }

        if (this.localSchema[selectedLang]) {
            this.notificationService.showError('This menu already has a translation for this language.', 'ERROR');
            return;
        }

        const newTranslation = await this.createNewMenuLang();
        this.localSchema[selectedLang] = newTranslation;
        this.checkedItems[selectedLang] = new Set<string>();
        this.addingLanguage = false;
        this.onLangChange(selectedLang);
        this.langName.setValue('');
        this.updateAvailableLanguages();
    }

    updateAvailableLanguages(): void {
        const existingLangs = Object.keys(this.localSchema || {});
        this.availableLanguages = this.allLanguages.filter(lang => !existingLangs.includes(lang));
    }

    /**
     * Navigates back to the parent route (menu list) when user clicks "Back" button.
     */
    goBack(): void {
        this.location.back();
    }

    debugExport(): void {
        const sanitizedData = this.sanitizeTranslationData(this.localSchema);

        this.dialog.open(JsonViewerComponent, {
            data: sanitizedData,
            height: '80%',
            width: '80%'
        });
    }

    saveAll(): void {
        // Sanitize data to ensure it matches the expected structure
        // All fields are included (even unedited ones) to prevent data loss on overwrite
        const sanitizedData = this.sanitizeTranslationData(this.localSchema);
        this.jsonValidationService.validateAndSave(
            this.jsonValidationService.validateBySchemaType(sanitizedData, 'menu-translations', this.packageName),
            () => this.workbenchService.overwriteMenuTranslations(this.packageName, this.menuName, sanitizedData),
            (saving) => this.isSaving = saving
        );
    }

    /**
     * Sanitizes translation data to match the expected backend structure.
     * Transforms nested view.menu.layout to flat view structure.
     * Ensures all items have label, description, help, and layout fields.
     *
     * All items from local_schema are included (even unedited ones) to preserve data.
     *
     * Input format:
     * {
     *   name: "", description: "", plural: "",
     *   view: { menu: { layout: { item_id: { label: Translation } } } }
     * }
     *
     * Output format:
     * {
     *   name: "", description: "",
     *   view: { item_id: { label: "", description: "", help: "", layout: "" } }
     * }
     */
    private sanitizeTranslationData(data: { [lang: string]: Translator }): { [lang: string]: any } {
        const sanitized: { [lang: string]: any } = {};

        for (const lang in data) {
            const translator = data[lang];
            if (!translator) { continue; }

            // Start with root-level fields
            const sanitizedLang: any = {
                name: translator.name?.value || '',
                description: translator.description?.value || ''
            };

            // Transform view structure - include all items from local_schema
            const viewLayout = translator?.view?.['menu']?.layout || {};
            const viewObj: any = {};

            for (const itemId in viewLayout) {
                const item = viewLayout[itemId];
                
                // Include all items, even if not checked (unedited)
                // Empty translations are stored as empty strings
                if (item
                    && item.label
                    && typeof item.label.value === 'string'
                    && item.label.value.trim() !== ''
                    && this.checkedItems[lang]?.has(itemId)) {
                    viewObj[itemId] = {
                        label: item?.label?.value || '',
                        description: '',
                        help: '',
                        layout: ''
                    };
                }
            }

            // Only add view if it has items
            if (Object.keys(viewObj).length > 0) {
                sanitizedLang.view = viewObj;
            }

            sanitized[lang] = sanitizedLang;
        }

        return sanitized;
    }

    /**
     * Persist a single item change coming from the translation table.
     * The translation table emits normalized pieces (e.g. { label: { value: '...' } }).
     * Also marks the item as checked (editable) when changes are made.
     */
    /**
     * Persist a single item change coming from the translation table.
     * The translation table emits normalized pieces (e.g. { label: { value: '...' } }).
     * Also marks the item as checked (editable) when changes are made.
     */
    onTranslationItemChange(event: { key: string; changes: Record<string, any> }): void {
        if (!this.lang) { return; }
        const translator = this.localSchema[this.lang];
        if (!translator || !translator.view || !translator.view['menu'] || !translator.view['menu'].layout) { return; }

        const layout = translator.view['menu'].layout as Record<string, any>;
        const item = layout[event.key] = layout[event.key] || {};

        // Apply changes
        for (const k of Object.keys(event.changes)) {
            const v = event.changes[k];
            if (k === 'is_active') {
                // Track checked state when user toggles the checkbox
                this.setItemChecked(this.lang, event.key, !!v);
            } else {
                // Assign field value/object directly (e.g., label, description)
                item[k] = v;
                // When user edits a field, automatically mark the item as checked
                this.setItemChecked(this.lang, event.key, true);
            }
        }

        // Mark for check so UI reflects persisted changes
        try { this.cdr.markForCheck(); } catch (e) { /* noop */ }
    }
}
