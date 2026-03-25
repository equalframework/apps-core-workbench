import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { QueryParamActivatorRegistry, QueryParamTabActivator } from 'src/app/_services/query-param-activator.registry';

import { Translator } from '../../model/model-trad-editor/_object/Translation';
import { Menu } from '../_models/Menu';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';

import { MenuTranslationValue, MenuTranslationField, MenuFieldColumnConfig, MENU_FIELD_CONFIGS } from './_object/menu-translation.types';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Component({
  selector: 'app-menu-trad-editor',
  templateUrl: './menu-trad-editor.component.html',
  styleUrls: ['./menu-trad-editor.component.scss']
})
export class MenuTradEditorComponent implements OnInit {
    package_name: string = '';
    menu_name: string = '';
    lang: string = '';

    error = false;
    loading = true;
    addingLanguage = false;
    activeTab = 'menu';
    activeField = '';

    langName = new FormControl('', { validators: [ MenuTradEditorComponent.langCaseValidator ] });
    data: { [id: string]: Translator } = {};
    allLanguages = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl'];
    availableLanguages: string[] = [];
    public readonly FIELD_CONFIGS = MENU_FIELD_CONFIGS;
    public readonly TAB_NAMES = ['menu'];

    private _menuScheme: Menu | null = null;
    private _menuMetadata: Map<string, any> = new Map(); // Maps menu item IDs to their metadata (type, icon, etc.)
    private activatorRegistry: QueryParamActivatorRegistry;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private workbenchService: WorkbenchService,
        private notificationService: NotificationService,
        private provider: EqualComponentsProviderService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private routerMemory: RouterMemory,
        private queryParamNavigator: QueryParamNavigatorService
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
                if (!['element', 'field'].includes(key)) return false;
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

    async ngOnInit() {
        this.loading = true;
        this.allLanguages = await this.workbenchService.collectAllLanguagesCode().toPromise() || [];
        const selectedPackage = this.route.parent?.snapshot.paramMap.get('package_name');
        const selectedMenu = this.route.snapshot.paramMap.get('menu_name');
        
        if (!selectedPackage || !selectedMenu) {
            this.error = true;
            return;
        }

        this.package_name = selectedPackage;
        this.menu_name = selectedMenu;

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
    }

    private fieldExists(lang: string | null | undefined, field: string): boolean {
        if (!lang) { return false; }
        const translator = this.data[lang];
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
                const raw = await this.workbenchService.readMenu(this.package_name, this.menu_name).toPromise();
                this._menuScheme = new Menu(raw || {});
            }
            if (this._menuScheme && this._menuScheme.layout && this._menuScheme.layout.items) {
                this._buildMenuMetadata(this._menuScheme.layout.items as any[]);
            }
        } catch (e) {
            console.warn('Error loading menu schema:', e);
        }
    }

    /**
     * Recursively builds metadata for all menu items from the menu schema
     * Maps item IDs to their properties (type, icon, label, etc.)
     */
    private _buildMenuMetadata(items: any[], parentPath: string = ''): void {
        if (!Array.isArray(items)) return;

        items.forEach(item => {
            if (item.id) {
                    // If the schema `id` already contains a dot, treat it as an absolute id and use it as-is.
                    // Otherwise prefix with `parentPath` when present.
                    const itemId = (item.id && item.id.indexOf('.') !== -1) ? item.id : (parentPath ? `${parentPath}.${item.id}` : item.id);
                
                this._menuMetadata.set(itemId, {
                    id: itemId,
                    shortId: item.id,
                    type: item.type, // 'parent' or 'entry'
                    icon: item.icon || null,
                    label: item.label || itemId,
                    context: item.context || null,
                    route: item.route || null
                });

                // Recursively process children
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
     * Build table items from the menu schema and match with current language translations.
     * This ensures all schema items are displayed, whether or not they have translations.
     * For each schema item, retrieves its translation value from data[lang].view['menu'].layout[itemId]
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
            ''
        );

        return items;
    }

    /**
     * Recursively builds table items from schema items.
     * For each schema item, creates an entry in the items record with translation data from current language.
     */
    private _buildTableItemsFromSchema(
        schemaItems: any[],
        items: Record<string, any>,
        parentPath: string
    ): void {
        if (!Array.isArray(schemaItems)) return;

        schemaItems.forEach(schemaItem => {
            if (schemaItem.id) {
                // If the schema `id` already contains a dot, treat it as absolute and use it as-is.
                // Otherwise prefix with `parentPath` when present.
                const itemId = (schemaItem.id && schemaItem.id.indexOf('.') !== -1) ? schemaItem.id : (parentPath ? `${parentPath}.${schemaItem.id}` : schemaItem.id);
                
                // Get translation for this item from current language
                const translationData = this.getTranslationForItem(itemId);
                
                // Create item object combining schema info with translation
                items[itemId] = {
                    ...schemaItem,
                    ...translationData
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
     * Returns translation field values from data[lang].view['menu'].layout[itemId]
     */
    private getTranslationForItem(itemId: string): any {
        const translation: Record<string, any> = {};

        if (!this.lang || !this.data[this.lang]) {
            return translation;
        }

        try {
            const languageData = this.data[this.lang];
            const menuLayout = languageData?.view?.['menu']?.layout;

            if (menuLayout && menuLayout[itemId]) {
                const itemTranslation = menuLayout[itemId] as any;
                
                // Extract label translation if it exists
                if (itemTranslation.label) {
                    translation['label'] = itemTranslation.label;
                }
                
                // Include is_active flag
                if (itemTranslation.is_active !== undefined) {
                    translation['is_active'] = itemTranslation.is_active;
                }
            }
        } catch (e) {
            console.warn(`Failed to get translation for item ${itemId}:`, e);
        }

        return translation;
    }

    async initTranslations() {
        this.loading = true;
        this.data = {};

        // fetch existing partial translations for each available language
        for (const lang of this.allLanguages) {
            try {
                const partialData: any = await this.workbenchService.getMenuTranslationsList(this.package_name, this.menu_name, lang).toPromise();
                if (partialData) {
                    // Create a Translator instance and merge partial data into it so this.data[lang] always holds a Translator
                    const translator = await this.createNewMenuLang();
                    try {
                        Object.assign(translator, partialData);
                    } catch (e) {
                        console.warn(`Failed to merge partial translation for ${lang}:`, e);
                    }
                    this.data[lang] = translator;
                }
            } catch (e) {
                console.warn(`Failed to load translations for language ${lang}:`, e);
            }
        }

        if (!this.data || Object.keys(this.data).length === 0) {
            this.loading = false;
            this.updateAvailableLanguages();
            return;
        }

        const firstLang = this.allLanguages[0] || null;

        const fillLanguage = async (lang: string) => {
            const newTranslation = await this.createNewMenuLang();
            if (!newTranslation.ok) { return null; }
            this.data[lang] = newTranslation;

            return this.data[lang];
        };

        if (firstLang) {
            await fillLanguage(firstLang);
            this.lang = firstLang;
            this.loading = false; // reveal UI as soon as first language is ready
            this.updateAvailableLanguages();
        } else {
            this.loading = false;
            this.updateAvailableLanguages();
        }

        for (const lang of this.allLanguages) {
            if (lang === firstLang) continue;
            await fillLanguage(lang);
        }
    }

    reload(): void {
        this._menuScheme = null;
        this._menuMetadata.clear();
        this.loading = true;
        this.initTranslations();
        this.loadMenuSchemaAndMetadata();

    }

    onLangChange(lang: string): void {
        this.lang = lang;
        this.activeField = '';
        // La sélection de langue n'a pas besoin d'être dans l'URL puisqu'il n'y a
        // qu'une seule vue avec le dropdown de langue visible
    }

    onTabChange(index: number): void {
        this.activeTab = this.TAB_NAMES[index] || 'menu';
        this.activeField = '';
        // Fragment navigation est géré par la souscription dans ngOnInit
    }

    async createNewMenuLang(): Promise<Translator> {
        if (!this._menuScheme) {
            const raw = await this.workbenchService.readMenu(this.package_name, this.menu_name).toPromise();
            this._menuScheme = new Menu(raw || {});
        }
        return Translator.MenuConstructor(new Menu(this._menuScheme.export()));
    }

    obk(object: { [id: string]: any }): string[] {
        return Object.keys(object).sort((a, b) => a.localeCompare(b));
    }

    startAddingLanguage() {
        this.addingLanguage = true;
    }

    stopAddingLanguage() {
        this.addingLanguage = false;
    }

    async createLanguage() {
        const selectedLang = this.langName.value;

        if (!selectedLang) return;

        if (this.data[selectedLang]) {
            this.notificationService.showError('This menu already has a translation for this language.', 'ERROR');
            return;
        }

        const newTranslation = await this.createNewMenuLang();
        this.data[selectedLang] = newTranslation;
        this.addingLanguage = false;
        this.onLangChange(selectedLang);
        this.langName.setValue('');
        this.updateAvailableLanguages();
    }

    updateAvailableLanguages() {
        const existingLangs = Object.keys(this.data || {});
        this.availableLanguages = this.allLanguages.filter(lang => !existingLangs.includes(lang));
    }

    static langCaseValidator(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value;
        const lower = 'abcdefghijkmlnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        switch (value.length) {
            case 5:
                if (value[2] !== '_') return { case: true };
                if (!upper.includes(value[3])) return { case: true };
                if (!upper.includes(value[4])) return { case: true };
                break;
            case 2:
                if (!lower.includes(value[0])) return { case: true };
                if (!lower.includes(value[1])) return { case: true };
                break;
            default:
                return { case: true };
        }
        return null;
    }

    /**
     * Navigue vers le parent (package)
     */
    goBack(): void {
        // Naviguer vers le parent de la route actuelle
        this.router.navigate(['../..'], { relativeTo: this.route });
    }

    debugExport() {

        this.dialog.open(JsonViewerComponent, {
            data: this.data[this.lang] ? this.data[this.lang].export() : {},
            height: '80%',
            width: '80%'
        });
    }

    saveAll() {
        console.log('Saving menu translations:', this.data);
        /*
        this.workbenchService.saveTranslations(this.package_name, 'menu.' + this.menu_name, this.data).subscribe(()=> {

            this.notificationService.showSuccess("Translations updated")
        });
        */
        // TODO: Implement menu translation saving once the API endpoint is available
        this.notificationService.showInfo("Menu translations saving is not yet implemented.");
    }

    /**
     * Persist a single item change coming from the translation table.
     * The translation table emits normalized pieces (e.g. { label: { value: '...' } }).
     */
    onTranslationItemChange(event: { key: string; changes: Record<string, any> }): void {
        if (!this.lang) return;
        const translator = this.data[this.lang];
        if (!translator || !translator.view || !translator.view['menu'] || !translator.view['menu'].layout) return;

        const layout = translator.view['menu'].layout as Record<string, any>;
        const item = layout[event.key] = layout[event.key] || {};

        for (const k of Object.keys(event.changes)) {
            const v = event.changes[k];
            if (k === 'is_active') {
                item.is_active = !!v;
            } else {
                // Assign field value/object directly (child normalizes to object shape)
                item[k] = v;
            }
        }

        // Mark for check so UI reflects persisted changes
        try { this.cdr.markForCheck(); } catch (e) { /* noop */ }
    }
}
