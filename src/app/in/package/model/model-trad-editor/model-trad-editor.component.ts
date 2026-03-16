import { result } from 'lodash';
import { Location } from '@angular/common';
import { Component, OnInit, Optional, Inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { prettyPrintJson } from 'pretty-print-json';

import { ErrorItemTranslator, Translator } from './_object/Translation';
import { View } from '../views/vieweditor/_objects/View';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';

import { TranslationActionField, TranslationErrorField, TranslationLayoutField, TranslationModelField, TranslationValue, FieldColumnConfig, FIELD_CONFIGS } from './_object/translation.types';

@Component({
  selector: 'app-model-trad-editor',
  templateUrl: './model-trad-editor.component.html',
  styleUrls: ['./model-trad-editor.component.scss']
})
export class ModelTradEditorComponent implements OnInit {
    package_name: string;
    model_name: string;
    lang: string;

    error = false;
    entitype = 'model';
    loading = true;
    addingLanguage = false;
    activeTab = 'model';
    activeView = '';
    private viewInnerTabs = ['layout', 'actions', 'routes'];
    viewActiveTab: { [view: string]: string } = {};
    activeField = '';
    errorActiveField = '';
    expandedErrorFields: { [key: string]: boolean } = {};

    adderror = new FormControl('', { validators: [ ModelTradEditorComponent.snakeCaseValidator ] });
    langName = new FormControl('', { validators: [ ModelTradEditorComponent.langCaseValidator ] });
    data: { [id: string]: Translator } = {};
    allLanguages = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl'];
    availableLanguages: string[] = [];
    public readonly FIELD_CONFIGS = FIELD_CONFIGS;
    public readonly TAB_NAMES = ['model', 'view', 'error'];

    // Field type metadata and error type mappings
    private fieldTypeMap: { [key: string]: string } = {};
    public readonly ERROR_TYPE_DESCRIPTIONS: { [key: string]: { description: string, severity: 'info' | 'warning' | 'error' } } = {
        'missing_mandatory': { description: 'Field is null/empty and required', severity: 'error' },
        'non_nullable': { description: 'Attempted to set to null when marked required', severity: 'error' },
        'size_exceeded': { description: 'String/data length exceeds maximum limit', severity: 'error' },
        'too_short': { description: 'Value is shorter than minimum length requirement', severity: 'error' },
        'too_long': { description: 'Value is longer than maximum length requirement', severity: 'error' },
        'pattern_mismatch': { description: 'Value does not match required pattern/format', severity: 'warning' },
        'invalid_choice': { description: 'Value not in allowed selection list', severity: 'error' },
        'invalid_type': { description: 'Value is not of the correct data type', severity: 'error' },
        'invalid_date': { description: 'Value is not a valid date/time', severity: 'error' },
        'broken_usage': { description: 'Invalid format for specialized field usage', severity: 'warning' },
        'unique_constraint_failed': { description: 'Value must be unique but duplicate exists', severity: 'error' },
        'invalid_email': { description: 'Email address format is invalid', severity: 'warning' },
        'invalid_phone': { description: 'Phone number format is invalid', severity: 'warning' },
        'invalid_url': { description: 'URL format is invalid', severity: 'warning' }
    };

    public readonly FIELD_TYPE_ERRORS: { [type: string]: string[] } = {
        'string': ['missing_mandatory', 'non_nullable', 'size_exceeded', 'pattern_mismatch', 'invalid_choice'],
        'text': ['missing_mandatory', 'non_nullable', 'size_exceeded', 'broken_usage', 'pattern_mismatch', 'invalid_choice'],
        'date': ['missing_mandatory', 'non_nullable', 'invalid_type', 'invalid_date', 'pattern_mismatch'],
        'integer': ['missing_mandatory', 'non_nullable', 'invalid_type', 'pattern_mismatch'],
        'float': ['missing_mandatory', 'non_nullable', 'invalid_type', 'pattern_mismatch'],
        'boolean': ['missing_mandatory', 'non_nullable', 'invalid_type'],
        'email': ['missing_mandatory', 'non_nullable', 'invalid_email', 'pattern_mismatch'],
        'phone': ['missing_mandatory', 'non_nullable', 'invalid_phone', 'pattern_mismatch'],
        'uri': ['missing_mandatory', 'non_nullable', 'invalid_url', 'pattern_mismatch'],
        'computed': []
    };

    private _modelTemplate: { modelFields: string[], views: { name: string, view: View }[], errors: { [field: string]: { fieldType: string, errorTypes: string[] } } } | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location:Location,
        private workbenchService: WorkbenchService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private routerMemory: RouterMemory
    ) {}

    get selectedTabIndex(): number {
        return Math.max(0, this.TAB_NAMES.indexOf(this.activeTab));
    }

    async ngOnInit() {
        this.loading = true;
        this.allLanguages = await this.workbenchService.collectAllLanguagesCode().toPromise();  // await this.api.collect("core\\pipeline\\Pipeline", [], ['name', 'nodes_ids'])
        const selectedPackage = this.route.parent?.snapshot.paramMap.get('package_name');
        const selectedModel = this.route.snapshot.paramMap.get('class_name');
        const type = this.route.snapshot.paramMap.get('type');
        
        if (type) { this.entitype = type; }
        if (!selectedPackage || !selectedModel) {
            this.error = true;
            return;
        }

        this.package_name = selectedPackage;
        this.model_name = selectedModel || '';

        await this.initTranslations();

        // Restore active tab from URL query param
        const urlTab = this.route.snapshot.queryParamMap.get('tab');
        if (urlTab && this.TAB_NAMES.includes(urlTab)) {
            this.activeTab = urlTab;
        }

        // Restore nested view selection (if any)
        await this.restoreNestedFromUrl();
        // Ensure URL only contains validated elements
        this.loading = false;

    }

    private async restoreNestedFromUrl(): Promise<void> {
        const qp = this.route.snapshot.queryParamMap;
        const urlView = qp.get('view');
        const urlViewTab = qp.get('viewTab');
        const urlField = qp.get('field');
        const urlErrorField = qp.get('errorField');
        const params: any = {};
        if (this.lang) { params.lang = this.lang; }
        params.tab = this.activeTab || 'model';

        let newActiveView = '';
        let newViewTab: string | undefined;
        let newActiveField: string | undefined;

        if (this.activeTab === 'view' && this.lang && this.data[this.lang]) {
            const names = this.obk(this.data[this.lang].view);
            newActiveView = (urlView && names.includes(urlView)) ? urlView : (names[0] || '');
            if (newActiveView) { params.view = newActiveView; }

            if (newActiveView && urlViewTab && this.viewInnerTabs.includes(urlViewTab)) {
                newViewTab = urlViewTab;
                params.viewTab = newViewTab;
            }

            if (urlField && this.fieldExists(this.lang, urlField)) {
                newActiveField = urlField;
                params.field = newActiveField;
                this.activeField = urlField;
            }
        } else {
            // Use a separate query param for error-tab field selection to avoid
            // colliding with model/view `field` usage.
            if (this.activeTab === 'error') {
                if (urlErrorField && this.fieldExists(this.lang, urlErrorField)) {
                    newActiveField = urlErrorField;
                    params.errorField = newActiveField;
                    this.errorActiveField = urlErrorField;
                    this.data[this.lang].error._base[urlErrorField].active = true;
                }
            } else if (urlField && this.activeTab !== 'view' && this.fieldExists(this.lang, urlField)) {
                newActiveField = urlField;
                params.field = newActiveField;
                this.activeField = urlField;
            }
        }

        const urlTree = this.router.createUrlTree([], { relativeTo: this.route, queryParams: params });
        // Apply validated state changes in a macrotask to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
            if (newActiveView) { this.activeView = newActiveView; }
            if (newViewTab && this.activeView) { this.viewActiveTab[this.activeView] = newViewTab; }
            this.location.replaceState(this.router.serializeUrl(urlTree));
            this.updateUrl();
            try { this.cdr.detectChanges(); } catch (e) { /* ignore detection errors */ }
        }, 0);
    }

    private fieldExists(lang: string | null | undefined, field: string): boolean {
        if (!lang) { return false; }
        const translator = this.data[lang];
        if (!translator) { return false; }
        const urlTab = this.route.snapshot.queryParamMap.get('tab');
        const urlViewTab = this.route.snapshot.queryParamMap.get('viewTab');

        if (urlTab === 'model') {
            if (translator.model && typeof translator.model === 'object') {
                try { return this.obk(translator.model).includes(field); } catch (e) { return false; }
            }
            return false;
        } else if (urlTab === 'view') {
            try {
                for (const viewName of this.obk(translator.view || {})) {
                    const viewObj = translator.view[viewName];

                    if (viewObj) {
                        if (urlViewTab === 'layout' && viewObj.layout && typeof viewObj.layout === 'object' && this.obk(viewObj.layout).includes(field)) { return true; }
                        if (urlViewTab === 'actions' && viewObj.actions && typeof viewObj.actions === 'object' && this.obk(viewObj.actions).includes(field)) { return true; }
                        if (urlViewTab === 'routes' && viewObj.routes && typeof viewObj.routes === 'object' && this.obk(viewObj.routes).includes(field)) { return true; }
                    }

                }
            } catch (e) {}
            return false;
        } else if (urlTab === 'error') {
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

    async initTranslations() {
        this.loading = true;
        this.data = {};
        const allData = await this.workbenchService.getTranslations(this.package_name, this.model_name).toPromise();

        if (!allData) {
            this.loading = false;
            this.updateAvailableLanguages();
            return;
        }

        const langs = Object.keys(allData);
        const urlLang = this.route.snapshot.queryParamMap.get('lang');
        const firstLang = (urlLang && langs.includes(urlLang)) ? urlLang : (langs[0] || null);

        const fillLanguage = async (lang: string) => {
            const newTranslation = await this.createNewLang();
            if (!newTranslation.ok) { return null; }
            this.data[lang] = newTranslation;

            // Ensure error._base contains entries for all model fields according to the model template
            this.ensureErrorBase(lang);

            // Try to fetch the existing translation payload for this specific language.
            // If it contains data, prefer it. Otherwise fall back to the previously fetched `allData`.
            try {
                const perLang = await this.workbenchService.getTranslationLanguages(this.package_name, this.model_name, lang).toPromise();
                if (perLang && Object.keys(perLang).length > 0) {
                    this.data[lang].fill(perLang);
                    // Ensure any missing error entries are present after filling
                    this.ensureErrorBase(lang);
                    return this.data[lang];
                }
            } catch (e) {
                // ignore and try fallback
            }

            if (allData && allData[lang]) {
                this.data[lang].fill(allData[lang]);
            }
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

        for (const lang of langs) {
            if (lang === firstLang) continue;
            await fillLanguage(lang);
        }
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

    /**
     * Return the list of error field names to display. Prefer the model template
     * modelFields when available, otherwise fall back to the translator data keys.
     */
    getErrorFieldNames(lang: string | null | undefined): string[] {
        if (this._modelTemplate && Array.isArray(this._modelTemplate.modelFields) && this._modelTemplate.modelFields.length > 0) {
            return this._modelTemplate.modelFields.slice().sort((a, b) => a.localeCompare(b));
        }
        if (lang && this.data[lang] && this.data[lang].error && this.data[lang].error._base) {
            return this.obk(this.data[lang].error._base);
        }
        return [];
    }

    reload(): void {
        this._modelTemplate = null;
        this.loading = true;
        this.initTranslations();
    }

    onLangChange(lang: string): void {
        this.lang = lang;
        this.router.navigate(['../translations'], {
            relativeTo: this.route,
            queryParams: { lang },
            queryParamsHandling: 'merge', // preserve context
        });
    }

    onTabChange(index: number): void {
        this.activeTab = this.TAB_NAMES[index] || 'model';
        this.activeView = this.activeTab === 'view' ? this.getViewNames()[0] || '' : '';
        this.activeField = '';
        this.updateUrl();
    }

    private updateUrl(): void {
        const params: any = {};
        if (this.lang) { params.lang = this.lang; }
        params.tab = this.activeTab || 'model';
        if (this.activeTab === 'view' && this.activeView) {
            params.view = this.activeView;
            const inner = this.viewActiveTab[this.activeView];
            if (inner) { params.viewTab = inner; }
        }
        if (this.activeTab !== 'error') {
            params.field = this.activeField;
            
        }
        if (this.activeTab === 'error') {
            params.errorField = this.errorActiveField;
        }
        // Replace the query params entirely with the validated set
        const urlTree = this.router.createUrlTree([], {
            relativeTo: this.route,
            queryParams: params,
        });
        this.location.replaceState(this.router.serializeUrl(urlTree));
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
        this.updateUrl();
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
        return Math.max(0, idx === -1 ? 0 : idx);
    }

    onViewInnerChange(view: string, index: number): void {
        const visible = this.getVisibleInnerTabs(view);
        this.viewActiveTab[view] = visible[index] || visible[0] || 'layout';
        this.activeField = '';
        this.updateUrl();
    }



    private async _buildModelTemplate(): Promise<void> {
        const scheme = await this.workbenchService.getSchema(`${this.package_name}\\${this.model_name}`).toPromise();
        console.log('Fetched schema for model template:', scheme);
        const modelFields = Object.keys(scheme.fields);
        const viewsList = await this.workbenchService.collectViews(this.package_name, `${this.package_name}\\${this.model_name}`).toPromise();
        const views: { name: string, view: View }[] = [];
        for (const viewStr of viewsList) {
            const parts = viewStr.split(':');
            if (!parts[1].includes('list.') && !parts[1].includes('form.') && !parts[1].includes('search.')) { continue; }
            const viewSchema = await this.workbenchService.getView(parts[0], parts[1]).toPromise();
            views.push({ name: parts[1], view: new View(viewSchema, parts[1].split('.')[0]) });
        }
        const errors: { [field: string]: { fieldType: string; errorTypes: string[] } } = {};
        for (const field of modelFields) {
            const fieldType = scheme.fields[field].type || 'string';
            errors[field] = {
                fieldType,
                errorTypes: this.FIELD_TYPE_ERRORS[fieldType] || []
            };
        }

        this._modelTemplate = { modelFields, views, errors};
        console.log('Model template built:', this._modelTemplate);
    }

    async createNewLang(): Promise<Translator> {
        if (!this._modelTemplate) {
            await this._buildModelTemplate();
        }
        return new Translator(this._modelTemplate!.modelFields, this._modelTemplate!.views);
    }

    obk(object: { [id: string]: any }): string[] {
        return Object.keys(object).sort((a, b) => a.localeCompare(b));
    }

    createError(lang: string, type: string) {
        const val = this.adderror.value;
        if (this.data[lang].error._base[type].val[val]) { return; }
        this.data[lang].error._base[type].val[val] = new ErrorItemTranslator();
        this.data[lang].error._base[type].val[val].is_active = true;
        this.adderror.setValue('');
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

      updateAvailableLanguages() {
        const existingLangs = Object.keys(this.data || {});
        this.availableLanguages = this.allLanguages.filter(lang => !existingLangs.includes(lang));
      }

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

    changeActive(key: string): void {
        if (!this.data[this.lang].error._base[key]) return;
        const item = this.data[this.lang].error._base[key];
        if (item && typeof item === 'object') {
          item.active = item.active ? false : true;
        }
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

    getFieldType(fieldName: string): string {
        if (this._modelTemplate && this._modelTemplate.errors && this._modelTemplate.errors[fieldName]) {
            return this._modelTemplate.errors[fieldName].fieldType || 'string';
        }
        if (this.fieldTypeMap[fieldName]) { return this.fieldTypeMap[fieldName]; }
        return 'string';
    }

    getSuggestedErrorsForField(fieldName: string): string[] {
        // Prefer suggested errors provided by the model template for the field
        if (this._modelTemplate && this._modelTemplate.errors && this._modelTemplate.errors[fieldName]) {
            return this._modelTemplate.errors[fieldName].errorTypes || [];
        }
        const fieldType = this.getFieldType(fieldName);
        return this.FIELD_TYPE_ERRORS[fieldType] || [];
    }

    getSuggestedErrorsNotAdded(fieldName: string, lang: string): string[] {
        const suggested = this.getSuggestedErrorsForField(fieldName);
        const added = (this.data[lang] && this.data[lang].error && this.data[lang].error._base && this.data[lang].error._base[fieldName])
            ? Object.keys(this.data[lang].error._base[fieldName].val || {})
            : [];
        return suggested.filter(err => !added.includes(err));
    }

    addPresetError(fieldName: string, errorType: string, lang: string): void {
        if (!this.data[lang]?.error._base[fieldName]) return;
        if (this.data[lang].error._base[fieldName].val[errorType]) return;
        this.data[lang].error._base[fieldName].val[errorType] = new ErrorItemTranslator();
        this.data[lang].error._base[fieldName].val[errorType].is_active = true;
        // Auto-activate the error field section
        this.data[lang].error._base[fieldName].active = true;
    }

    getErrorDescription(errorType: string): string {
        return this.ERROR_TYPE_DESCRIPTIONS[errorType]?.description || '';
    }

    getErrorSeverity(errorType: string): 'info' | 'warning' | 'error' {
        return this.ERROR_TYPE_DESCRIPTIONS[errorType]?.severity || 'info';
    }

    goBack() {
        this.location.back();
    }

    debugExport() {
        this.dialog.open(JsonViewerComponent, {
        data: this.data[this.lang] ? this.data[this.lang].export() : {},
        height: '80%',
        width: '80%'
        });
    }

    saveAll() {
        this.workbenchService.saveTranslations(this.package_name, this.model_name, this.data).subscribe(()=> {
            this.notificationService.showSuccess("Translations updated");
        });
    }
    
}
