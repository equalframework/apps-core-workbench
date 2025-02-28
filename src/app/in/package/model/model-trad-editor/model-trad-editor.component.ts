import { result } from 'lodash';
import { Location } from '@angular/common';
import { Component, OnInit, Optional, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { prettyPrintJson } from 'pretty-print-json';

import { TranslationService } from './_services/translation.service';
import { ErrorItemTranslator, Translator } from './_object/Translation';
import { Menu } from '../../menu/_models/Menu';
import { View } from '../views/vieweditor/_objects/View';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';

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
    loading = false;
    addingLanguage = false;

    adderror = new FormControl('', { validators: [ ModelTradEditorComponent.snakeCaseValidator ] });
    langName = new FormControl('', { validators: [ ModelTradEditorComponent.langCaseValidator ] });
    data: { [id: string]: Translator } = {};

    constructor(
        private route: ActivatedRoute,
        private location:Location,
        private workbenchService: WorkbenchService,
        private notificationService: NotificationService,
        private dialog: MatDialog
    ) {}

    async ngOnInit() {
        const selectedPackage = this.route.parent?.snapshot.paramMap.get('package_name');
        const selectedModel = this.route.snapshot.paramMap.get('class_name');
        const type = this.route.snapshot.paramMap.get('type');
        if (type) { this.entitype = type; }
        if (!selectedPackage || !selectedModel) {
        this.error = true;
        return;
        }
        this.package_name = selectedPackage;
        this.model_name = selectedModel;

        if (this.entitype === 'menu') {
        await this.initMenu();
        } else {
        await this.initModel();
        }
        this.loading = false;
    }

    async initMenu() {
        this.loading = true;
        const langs = await this.workbenchService.getTranslationsList(this.package_name, `menu.${this.model_name}`).toPromise();
        for (const lang in langs) {
        if (langs[lang].length === 0) { continue; }
        const translationData = await this.workbenchService.getTranslations(this.package_name, `menu.${this.model_name}`, lang).toPromise();
        if (!translationData) { continue; }
        const newTranslation = await this.createNewMenuLang();
        if (!newTranslation.ok) { continue; }
        this.data[lang] = newTranslation;
        this.data[lang].fill(translationData);
        }
        this.lang = Object.keys(this.data).sort()[0] || '';
        this.loading = false;
    }

    async initModel() {
        this.loading = true;
        const langs = await this.workbenchService.getTranslationsList(this.package_name, this.model_name).toPromise();
        for (const lang in langs) {
        const translationData = await this.workbenchService.getTranslations(this.package_name, this.model_name, lang).toPromise();
        if (!translationData) { continue; }
        const newTranslation = await this.createNewLang();
        if (!newTranslation.ok) { continue; }
        this.data[lang] = newTranslation;
        this.data[lang].fill(translationData);
        }
        this.lang = Object.keys(this.data).sort()[0] || '';
        this.loading = false;
    }

    async createNewMenuLang(): Promise<Translator> {
        const scheme = await this.workbenchService.getView(`${this.package_name}\\menu`, this.model_name).toPromise();
        return Translator.MenuConstructor(new Menu(scheme));
    }

    async createNewLang(): Promise<Translator> {
        const scheme = await this.workbenchService.getSchema(`${this.package_name}\\${this.model_name}`).toPromise();
        const modelFields = Object.keys(scheme.fields);
        const viewsList = await this.workbenchService.collectViews(this.package_name, `${this.package_name}\\${this.model_name}`).toPromise();
        const views: { name: string, view: View }[] = [];
        for (const viewStr of viewsList) {
        const parts = viewStr.split(':');
        if (!parts[1].includes('list.') && !parts[1].includes('form.') && !parts[1].includes('search.')) { continue; }
        const viewSchema = await this.workbenchService.getView(parts[0], parts[1]).toPromise();
        views.push({ name: parts[1], view: new View(viewSchema, parts[1].split('.')[0]) });
        }
        return new Translator(modelFields, views);
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
        if (this.data[this.langName.value]) {
        this.notificationService.showError('this.model_name already has a translation for this language.', 'ERROR');
        return;
        }
        const newTranslation = this.entitype === 'menu'
        ? await this.createNewMenuLang()
        : await this.createNewLang();
        this.data[this.langName.value] = newTranslation;
        this.addingLanguage = false;
        this.lang = this.langName.value;
        this.langName.setValue('');
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

    goBack() {
        this.location.back();
    }

    debugExport() {
        this.dialog.open(ModelTradJsonComponent, {
        data: this.data[this.lang] ? this.data[this.lang].export() : {},
        height: '80%',
        width: '80%'
        });
    }

    saveAll() {
        this.workbenchService.saveTranslations(this.package_name, (this.entitype === 'menu' ? 'menu.' : '') + this.model_name, this.data).subscribe(()=> {
            this.notificationService.showSuccess("Translations updated")
        });
    }
    }

@Component({
  selector: 'app-model-trad-json',
  template: `<pre [innerHtml]="jsonData"></pre>`
})
export class ModelTradJsonComponent implements OnInit {
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModelTradJsonComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  get jsonData(): string {
    return prettyPrintJson.toHtml(this.data);
  }
}
