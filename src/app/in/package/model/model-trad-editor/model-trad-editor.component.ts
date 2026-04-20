import { Component, OnInit, ChangeDetectorRef, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { QueryParamActivatorRegistry } from 'src/app/_services/query-param-activator.registry';
import { cloneDeep } from 'lodash';
import { ErrorItemTranslator, Translator } from './_object/Translation';
import { View } from '../_object/View';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { Location } from '@angular/common';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { FIELD_CONFIGS } from './_object/translation.types';
import { text } from 'd3';

@Component({
  selector: 'app-model-trad-editor',
  templateUrl: './model-trad-editor.component.html',
  styleUrls: ['./model-trad-editor.component.scss']
})
export class ModelTradEditorComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private workbenchService: WorkbenchService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        private location: Location,
        private cdr: ChangeDetectorRef,
        private queryParamNavigator: QueryParamNavigatorService,
        private injector: Injector,
        private jsonValidationService: JsonValidationService,
        private provider: EqualComponentsProviderService
    ) {
        this.activatorRegistry = new QueryParamActivatorRegistry();
    }

    public readonly FIELD_CONFIGS = FIELD_CONFIGS;
    public readonly TAB_NAMES = ['model', 'view', 'error'];
    private readonly tabNameToIndexMap: { [key: string]: number } = {
        model: 0,
        view: 1,
        error: 2
    };
    private readonly viewTabNameToIndexMap: { [key: string]: number } = {
        layout: 0,
        actions: 1,
        routes: 2
    };
    private readonly viewInnerTabs = ['layout', 'actions', 'routes'];

    public readonly ERROR_TYPE_DESCRIPTIONS: { [key: string]: { description: string, severity: 'info' | 'warning' | 'error' } } = {
        missing_mandatory: { description: 'Field is null/empty and required', severity: 'error' },
        non_nullable: { description: 'Attempted to set to null when marked required', severity: 'error' },
        size_exceeded: { description: 'String/data length exceeds maximum limit', severity: 'error' },
        too_short: { description: 'Value is shorter than minimum length requirement', severity: 'error' },
        too_long: { description: 'Value is longer than maximum length requirement', severity: 'error' },
        pattern_mismatch: { description: 'Value does not match required pattern/format', severity: 'warning' },
        invalid_choice: { description: 'Value not in allowed selection list', severity: 'error' },
        invalid_type: { description: 'Value is not of the correct data type', severity: 'error' },
        invalid_date: { description: 'Value is not a valid date/time', severity: 'error' },
        broken_usage: { description: 'Invalid format for specialized field usage', severity: 'warning' },
        unique_constraint_failed: { description: 'Value must be unique but duplicate exists', severity: 'error' },
        invalid_email: { description: 'Email address format is invalid', severity: 'warning' },
        invalid_phone: { description: 'Phone number format is invalid', severity: 'warning' },
        invalid_url: { description: 'URL format is invalid', severity: 'warning' }
    };

    public readonly FIELD_TYPE_ERRORS: { [type: string]: string[] } = {
        amount: ['invalid_amount'],
        binary: ['size_exceeded'], image: ['size_exceeded'],
        country: ['invalid_country'],
        currency: ['invalid_currency'],
        date: ['invalid_type', 'invalid_date'],
        email: ['invalid_email'],
        language: ['invalid_language'],
        locale: ['invalid_language', 'invalid_country'],
        number: ['not_boolean', 'not_integer', 'size_exceeded', 'too_low', 'too_high', 'not_natural', 'not_real'],
        password: ['invalid_password'],
        phone: ['invalid_phone'],
        text: ['size_exceeded', 'broken_usage'], icon: ['size_exceeded', 'broken_usage'],
        uri: ['invalid_url', 'invalid_iban', 'invalid_ean']
    };

    packageName: string;
    modelName: string;
    lang: string;
    entityType = 'model';
    error = false;

    loading = true;
    isSaving = false;
    addingLanguage = false;

    activeTab = 'model';
    selectedTabIndex = 0;
    activeView = '';
    viewActiveTab: { [view: string]: string } = {};
    selectedViewTabIndex: { [view: string]: number } = {};

    activeField = '';
    errorActiveField = '';
    expandedErrorFields: { [key: string]: boolean } = {};

    data: { [id: string]: Translator } = {};
    allLanguages = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl'];
    availableLanguages: string[] = [];

    addError = new FormControl('', { validators: [ ModelTradEditorComponent.snakeCaseValidator ] });
    langName = new FormControl('', { validators: [ ModelTradEditorComponent.langCaseValidator ] });

    private backgroundTranslationsLoadStarted = false;
    private backgroundPreloadStarted = false;
    private _modelTemplate: {
        modelFields: string[],
        views: { name: string, view: View }[],
        errors: { [field: string]: { fieldUsage: string, errorTypes: string[] } } } | null = null;
    private activatorRegistry: QueryParamActivatorRegistry;

    static snakeCaseValidator(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value;
        const validChars = 'abcdefghijkmlnopqrstuvwxyz-_';
        for (const char of value) {
            if (!validChars.includes(char)) { return { case: true }; }
        }
        return null;
    }

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

    async ngOnInit(): Promise<void> {
        console.log('Collecting all languages codes...');
        this.allLanguages = await this.workbenchService.collectAllLanguagesCode().toPromise();
        const selectedPackage = this.route.parent?.snapshot.paramMap.get('package_name');
        const selectedModel = this.route.snapshot.paramMap.get('class_name');
        const type = this.route.snapshot.paramMap.get('type');

        if (type) { this.entityType = type; }
        if (!selectedPackage || !selectedModel) {
            this.error = true;
            return;
        }

        this.packageName = selectedPackage;
        this.modelName = selectedModel || '';

        await this.initTranslations();

        this.initializeNavigation();

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.queryParamNavigator.handleQueryParams(params, {
                    activators: this.activatorRegistry,
                    context: this,
                    elementKeys: ['element'],
                    scrollDelay: 100,
                    scrollOptions: { behavior: 'smooth', block: 'start' }
                });
            }
        });
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.queryParamNavigator.handleQueryParams(params, {
                    activators: this.activatorRegistry,
                    context: this,
                    elementKeys: ['field'],
                    scrollDelay: 100,
                    scrollOptions: { behavior: 'smooth', block: 'start' }
                });
            }
        });

        this.loading = false;
        console.log('Data after initialization:', this.data);
        void this.fetchBackgroundData();

    }

    private initializeNavigation(): void {
        const tabActivator = {
            type: 'tab',
            queryParamKeys: ['tab'],
            canHandle: (key: string, value: any) => {
                return key === 'tab' && this.TAB_NAMES.includes(value);
            },
            activate: async (key: string, value: any, context: any) => {
                if (this.TAB_NAMES.includes(value)) {
                    context.activeTab = value;
                    context.selectedTabIndex = context.tabNameToIndexMap[value] || 0;
                    if (value === 'view' && this.getViewNames().length > 0) {
                        context.activeView = context.activeView || this.getViewNames()[0];
                    } else if (value !== 'view') {
                        context.activeView = '';
                    }
                    context.activeField = '';
                    context.errorActiveField = '';
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        };
        this.activatorRegistry.register(tabActivator);

        const viewActivator = {
            type: 'view',
            queryParamKeys: ['view'],
            canHandle: (key: string, value: any) => {
                if (key !== 'view' || !this.lang || !this.data[this.lang]) { return false; }
                return this.getViewNames().includes(value);
            },
            activate: async (key: string, value: any, context: any) => {
                if (this.getViewNames().includes(value)) {
                    context.activeView = value;
                    context.viewActiveTab[value] = context.viewActiveTab[value] || '';
                    context.activeField = '';
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        };
        this.activatorRegistry.register(viewActivator);

        const viewTabActivator = {
            type: 'viewTab',
            queryParamKeys: ['viewTab'],
            canHandle: (key: string, value: any) => {
                return this.viewInnerTabs.includes(value) && value !== null && value !== undefined;
            },
            activate: async (key: string, value: any, context: any) => {

                if (this.viewInnerTabs.includes(value)) {
                    if (!context.activeView && context.activeTab === 'view' && this.getViewNames().length > 0) {
                        context.activeView = this.getViewNames()[0];
                    }
                    if (context.activeView) {
                        context.viewActiveTab[context.activeView] = value;
                        context.selectedViewTabIndex[context.activeView] = context.viewTabNameToIndexMap[value] || 0;
                    }
                    context.activeField = '';
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        };
        this.activatorRegistry.register(viewTabActivator);

        const fieldActivator = {
            type: 'field',
            queryParamKeys: ['element', 'field'],
            canHandle: (key: string, value: any) => {
                if (!this.lang || !this.data[this.lang] || !['element', 'field'].includes(key)) { return false; }
                return this.fieldExists(this.lang, value);
            },
            activate: async (key: string, value: any, context: any) => {
                if (this.fieldExists(this.lang, value)) {
                    if (context.activeTab === 'error') {
                        context.errorActiveField = value;
                        if (context.data[context.lang]
                            && context.data[context.lang].error
                            && context.data[context.lang].error._base[value]) {
                            context.data[context.lang].error._base[value].active = true;

                            context.expandedErrorFields[value] = true;
                        }
                    } else {
                        context.activeField = value;
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        };
        this.activatorRegistry.register(fieldActivator);
    }

    /**
     * Initialize all translations for the model. Loads the first language synchronously,
     * then loads remaining languages in background to avoid blocking the UI.
     */
    async initTranslations(): Promise<void> {
        this.backgroundTranslationsLoadStarted = false;
        this.data = {};
        console.log('Collecting all translations for model...');
        const allData = await this.workbenchService.getTranslations(this.packageName, this.modelName).toPromise();

        if (!allData) {
            this.loading = false;
            this.updateAvailableLanguages();
            return;
        }
        const langs = Object.keys(allData).filter((lang) => (allData[lang]?.length ?? 0) > 0);
        const firstLang = langs[0] || null;

        if (firstLang) {
            const perLangDataMap = await this.fetchAllTranslationLanguages(langs);
            console.log('Per-language data map:', perLangDataMap);
            await this.fillLanguage(firstLang, allData, perLangDataMap);
            console.log('Filled first language:', firstLang, this.data[firstLang]);
            this.lang = firstLang;
            this.loading = false; // reveal UI as soon as first language is ready
            console.log('Updating available languages after loading first language...');
            this.updateAvailableLanguages();

            await this.fetchRemainingTranslationsInBackground(langs, firstLang, allData, perLangDataMap);
            
        } else {
            this.loading = false;
            this.updateAvailableLanguages();
        }
    }

    private async fetchAllTranslationLanguages(langs: string[]): Promise<{ [lang: string]: any }> {
        const perLangDataMap: { [lang: string]: any } = {};
        
        const fetchPromises = langs.map(lang =>
            this.workbenchService.getTranslationLanguages(this.packageName, this.modelName, lang)
                .toPromise()
                .then(perLang => {
                    if (perLang && Object.keys(perLang).length > 0) {
                        perLangDataMap[lang] = perLang;
                    }
                })
                .catch(() => {
                })
        );
        
        await Promise.all(fetchPromises);
        return perLangDataMap;
    }

    private async fillLanguage(lang: string, allData: { [key: string]: any } | null | undefined, perLangDataMap?: { [lang: string]: any }): Promise<Translator | null> {
        const newTranslation = await this.createNewLang();
        console.log('Created new translator for language', lang, newTranslation);
        if (!newTranslation.ok) { return null; }
        this.data[lang] = cloneDeep(newTranslation);
        this.ensureErrorBase(lang);

        const perLang = perLangDataMap ? perLangDataMap[lang] : null;
        
        if (perLang && Object.keys(perLang).length > 0) {
            this.data[lang].fill(perLang);
            this.ensureErrorBase(lang);
            return this.data[lang];
        }

        if (allData && allData[lang]) {
            this.data[lang].fill(allData[lang]);
        }

        return this.data[lang];
    }

    private async fetchRemainingTranslationsInBackground(
        langs: string[], firstLang: string | null, allData: { [key: string]: any } | null | undefined, perLangDataMap: { [lang: string]: any })
        : Promise<void> {
        console.log('Attempting to load remaining translations in background...');
        if (this.backgroundTranslationsLoadStarted) {
            return;
        }
        
        this.backgroundTranslationsLoadStarted = true;
        console.log('Background loading for remaining languages started.');
        
        const remainingLangs = langs.filter(lang => lang !== firstLang);
        const fillPromises = remainingLangs.map(lang =>
            this.fillLanguage(lang, allData, perLangDataMap)
                .then(() => {
                    this.updateAvailableLanguages();
                    console.log(`Background loaded language: ${lang}`, this.data[lang]);
                })
        );
        
        await Promise.all(fillPromises);
        this.cdr.detectChanges();
    }

    /**
     * Ensure that `data[lang].error._base` contains an entry for every model field
     * defined by the built `_modelTemplate`. If an entry is missing we create a
     * minimal one so the template can safely bind to it.
     */
    private ensureErrorBase(lang: string | null | undefined): void {
        if (!lang) { return; }
        const translator = this.data[lang];
        if (!translator) { return; }
        if (!translator.error) { translator.error = { _base: {} } as any; }
        if (!translator.error._base) { translator.error._base = {}; }
        if (!this._modelTemplate) { return; }

        for (const field of this._modelTemplate.modelFields) {
            if (!translator.error._base[field]) {
                translator.error._base[field] = { active: false, val: {} };
            }
        }
    }

    // ============================================================================
    // MODEL TEMPLATE BUILDING
    // ============================================================================

    /**
     * Build the model template by fetching the schema and available views.
     * This is done once and cached. The template provides field information
     * and view structure for the editor.
     */
    private async _buildModelTemplate(): Promise<void> {
        const [scheme, viewsList] = await Promise.all([
            this.workbenchService.getSchema(`${this.packageName}\\${this.modelName}`).toPromise(),
            this.provider.getComponents(this.packageName, 'view', this.modelName).toPromise()
        ]);
        
        const modelFields = Object.keys(scheme.fields);
        
        const viewSchemaPromises = viewsList
            .map(descriptor => {
                const fullName = descriptor?.name || '';
                const separatorIdx = fullName.indexOf(':');
                const sourceModelName = separatorIdx !== -1 ? fullName.substring(0, separatorIdx) : this.modelName;
                const viewName = separatorIdx !== -1 ? fullName.substring(separatorIdx + 1) : fullName;

                if (!viewName || (!viewName.includes('list.') && !viewName.includes('form.') && !viewName.includes('search.'))) {
                    return null;
                }

                return this.workbenchService.readView(
                    descriptor?.package_name || this.packageName,
                    viewName,
                    sourceModelName
                ).toPromise()
                    .then(viewSchema => ({
                        fullName,
                        viewName,
                        sourceModelName,
                        viewSchema
                    }))
                    .catch(e => {
                        console.warn(`Unable to load view schema for ${fullName}`, e);
                        return null;
                    });
            })
            .filter(p => p !== null);

        const viewResults = await Promise.all(viewSchemaPromises);
        const views: { name: string, view: View }[] = viewResults
            .filter(result => result !== null)
            .map(result => {
                console.log(`Loaded view schema for ${result!.fullName}:`, result!.viewSchema);
                return { name: result!.viewName, view: new View(result!.viewSchema || {}, result!.viewName.split('.')[0]) };
            });
        const errors: { [field: string]: { fieldUsage: string; errorTypes: string[] } } = {};
        for (const field of modelFields) {
            const fieldUsage = scheme.fields[field].usage || '';
            errors[field] = {
                fieldUsage,
                errorTypes: this.FIELD_TYPE_ERRORS[fieldUsage] || []
            };
        }

        this._modelTemplate = { modelFields, views, errors };
    }

    async createNewLang(): Promise<Translator> {
        if (!this._modelTemplate) {
            await this._buildModelTemplate();
        }
        console.log('Model template built:', this._modelTemplate);
        return new Translator(this._modelTemplate!.modelFields, this._modelTemplate!.views);
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

        if (this.data[selectedLang]) {
            this.notificationService.showError('This model already has a translation for this language.', 'ERROR');
            return;
        }

        const newTranslation = await this.createNewLang();

        this.data[selectedLang] = newTranslation;
        this.addingLanguage = false;
        this.onLangChange(selectedLang);
        this.langName.setValue('');
        this.updateAvailableLanguages();
    }

    updateAvailableLanguages(): void {
        const existingLangs = Object.keys(this.data || {});
        this.availableLanguages = this.allLanguages.filter(lang => !existingLangs.includes(lang));
    }

    onLangChange(lang: string): void {
        this.lang = lang;
        this.activeField = '';
        this.errorActiveField = '';
        this.cdr.detectChanges();
    }

    onTabChange(index: number): void {
        this.activeTab = this.TAB_NAMES[index] || 'model';
        this.selectedTabIndex = index;
        this.activeView = this.activeTab === 'view' ? this.getViewNames()[0] || '' : '';
        this.activeField = '';
        this.errorActiveField = '';
    }

    getViewNames(): string[] {
        return (this.lang && this.data[this.lang]) ? this.obk(this.data[this.lang].view) : [];
    }

    getSelectedViewIndex(): number {
        const names = this.getViewNames();
        const idx = names.indexOf(this.activeView);
        return Math.max(0, idx);
    }

    onViewSelected(index: number): void {
        const names = this.getViewNames();
        this.activeView = names[index] || names[0] || '';
        this.viewActiveTab[this.activeView] = this.viewActiveTab[this.activeView] || '';
        this.selectedViewTabIndex[this.activeView] = this.selectedViewTabIndex[this.activeView] || 0;
        this.activeField = '';
    }

    private getVisibleInnerTabs(view: string): string[] {
        const tabs: string[] = [];
        const viewObj = (this.lang && this.data[this.lang]) ? this.data[this.lang].view[view] : null;
        if (!viewObj) { return tabs; }
        if (viewObj.layout && Object.keys(viewObj.layout).length > 0) { tabs.push('layout'); }
        if (viewObj.actions && Object.keys(viewObj.actions).length > 0) { tabs.push('actions'); }
        if (viewObj.routes && Object.keys(viewObj.routes).length > 0) { tabs.push('routes'); }
        return tabs;
    }

    getViewInnerIndex(view: string): number {
        const visible = this.getVisibleInnerTabs(view);
        const sel = this.viewActiveTab[view] || (visible[0] || 'layout');
        const idx = visible.indexOf(sel);
        this.viewActiveTab[view] = sel;
        this.selectedViewTabIndex[view] = idx === -1 ? 0 : idx;
        return Math.max(0, idx === -1 ? 0 : idx);
    }

    onViewInnerChange(view: string, index: number): void {
        const visible = this.getVisibleInnerTabs(view);
        this.viewActiveTab[view] = visible[index] || visible[0] || 'layout';
        this.selectedViewTabIndex[view] = index;
        this.activeField = '';
    }

    private fieldExists(lang: string | null | undefined, field: string): boolean {
        if (!lang) { return false; }
        const translator = this.data[lang];
        if (!translator) { return false; }

        if (this.activeTab === 'model') {
            if (translator.model && typeof translator.model === 'object') {
                try { return this.obk(translator.model).includes(field); } catch (e) { return false; }
            }
            return false;
        } else if (this.activeTab === 'view') {
            try {
                for (const viewName of this.obk(translator.view || {})) {
                    const viewObj = translator.view[viewName];
                    const viewTab = this.viewActiveTab[this.activeView];

                    if (viewObj) {
                        if (viewTab === 'layout'
                            && viewObj.layout
                            && typeof viewObj.layout === 'object'
                            && this.obk(viewObj.layout).includes(field)) { return true; }
                        if (viewTab === 'actions'
                            && viewObj.actions
                            && typeof viewObj.actions === 'object'
                            && this.obk(viewObj.actions).includes(field)) { return true; }
                        if (viewTab === 'routes'
                            && viewObj.routes
                            && typeof viewObj.routes === 'object'
                            && this.obk(viewObj.routes).includes(field)) { return true; }
                    }
                }
            } catch (e) {}
            return false;
        } else if (this.activeTab === 'error') {
            try {
                if (translator.error && translator.error._base && typeof translator.error._base === 'object') {
                    const types = this.obk(translator.error._base);
                    for (const t of types) {
                        const valObj = translator.error._base[t] && translator.error._base[t].val;
                        if (valObj && t === field) { return true; }
                    }
                }
            } catch (e) {}
            return false;
        }
        return false;
    }

    toggleErrorFieldExpansion(fieldName: string): void {
        this.expandedErrorFields[fieldName] = !this.expandedErrorFields[fieldName];
    }

    isErrorFieldExpanded(fieldName: string): boolean {
        if (this.expandedErrorFields[fieldName] === undefined) {
            this.expandedErrorFields[fieldName] = true;
        }
        return this.expandedErrorFields[fieldName] !== false;
    }

    getErrorFieldNames(lang: string | null | undefined): string[] {
        if (this._modelTemplate && Array.isArray(this._modelTemplate.modelFields) && this._modelTemplate.modelFields.length > 0) {
            return this._modelTemplate.modelFields.slice().sort((a, b) => a.localeCompare(b));
        }
        if (lang && this.data[lang] && this.data[lang].error && this.data[lang].error._base) {
            return this.obk(this.data[lang].error._base);
        }
        return [];
    }

    getFieldUsage(fieldName: string): string {
        if (this._modelTemplate && this._modelTemplate.errors && this._modelTemplate.errors[fieldName]) {
            console.log(`Field usage for ${fieldName}:`, this._modelTemplate.errors[fieldName].fieldUsage.split('/')[0]);
            return this._modelTemplate.errors[fieldName].fieldUsage.split('/')[0];
        }
        return '';
    }

    getSuggestedErrorsForField(fieldName: string): string[] {
        const fieldUsage = this.getFieldUsage(fieldName);
        // #memo: enhancement - we could assume certain error types based on field type even
        // if usage is not explicitly defined
        return this.FIELD_TYPE_ERRORS[fieldUsage] || [];
    }

    getSuggestedErrorsNotAdded(fieldName: string, lang: string): string[] {
        const suggested = this.getSuggestedErrorsForField(fieldName);
        const added = (this.data[lang] && this.data[lang].error && this.data[lang].error._base && this.data[lang].error._base[fieldName])
            ? Object.keys(this.data[lang].error._base[fieldName].val || {})
            : [];
        return suggested.filter(err => !added.includes(err));
    }

    addPresetError(fieldName: string, errorType: string, lang: string): void {
        if (!this.data[lang]?.error._base[fieldName]) { return; }
        if (this.data[lang].error._base[fieldName].val[errorType]) { return; }
        this.data[lang].error._base[fieldName].val[errorType] = new ErrorItemTranslator();
        this.data[lang].error._base[fieldName].val[errorType].isActive = true;
        this.data[lang].error._base[fieldName].active = true;
    }

    createError(lang: string, type: string): void {
        const val = this.addError.value;
        if (this.data[lang].error._base[type].val[val]) { return; }
        this.data[lang].error._base[type].val[val] = new ErrorItemTranslator();
        this.data[lang].error._base[type].val[val].isActive = true;
        this.addError.setValue('');
    }

    changeActive(key: string): void {
        if (!this.data[this.lang].error._base[key]) { return; }
        const item = this.data[this.lang].error._base[key];
        if (item && typeof item === 'object') {
            item.active = item.active ? false : true;
        }
    }

    getErrorDescription(errorType: string): string {
        return this.ERROR_TYPE_DESCRIPTIONS[errorType]?.description || '';
    }

    getErrorSeverity(errorType: string): 'info' | 'warning' | 'error' {
        return this.ERROR_TYPE_DESCRIPTIONS[errorType]?.severity || 'info';
    }

    saveAll(): void {
        const exportedData: { [lang: string]: any } = {};
        for (const lang in this.data) {
            exportedData[lang] = this.data[lang].export();
        }
        console.log('Exported data for saving:', exportedData);
        this.jsonValidationService.validateAndSave(
            this.jsonValidationService.validateBySchemaType(exportedData, 'model-translations', this.packageName),
            () => this.workbenchService.saveTranslations(this.packageName, this.modelName, this.data),
            (saving) => this.isSaving = saving
        );
        console.log('Validation passed, save initiated.');
    }

    debugExport(): void {
        this.dialog.open(JsonViewerComponent, {
            data: this.data[this.lang] ? this.data[this.lang].export() : {},
            height: '80%',
            width: '80%'
        });
    }

    reload(): void {
        this._modelTemplate = null;
        this.loading = true;
        this.initTranslations();
    }

    goBack(): void {
        this.location.back();
    }

    private async fetchBackgroundData(): Promise<void> {
        console.log('Attempting to load background data (component provider)...');
        if (this.backgroundPreloadStarted) {
            return;
        }

        this.backgroundPreloadStarted = true;
        console.log('Background preload for component provider started.');
        try {
            if (!this.provider) {
                this.provider = this.injector.get(EqualComponentsProviderService);
            }
        } catch (err) {
            console.error('Error during background data fetching', err);
        }
    }

    obk(object: { [id: string]: any }): string[] {
        return Object.keys(object).sort((a, b) => a.localeCompare(b));
    }

}
