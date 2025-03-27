import { Component, Inject, OnDestroy, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemTypes } from 'src/app/in/_models/item-types.class';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { forkJoin, from, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-mixed-creator-dialog',
  templateUrl: './mixed-creator-dialog.component.html',
  styleUrls: ['./mixed-creator-dialog.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class MixedCreatorDialogComponent implements OnInit, OnDestroy {
    // Flag to indicate that all data has been loaded
    public loaded = false;

    // Data for component creation
    public type = '';
    public selectedPackage = '';
    public selectedModel = '';
    public subtype = "";

    public cacheList: string[] | undefined;
    public cachePkgList: string[] | undefined;
    public cacheModelList: string[] | undefined;
    public subTypeList: string[];
    public customStList: string[];

    // UI flags
    public needPackage = false;
    public needModel = false;
    public needSubtype = false;
    public canAddSubtypes = false;
    public addingState = false;
    public implemented = true;
    public nameTitle = 'Name';
    public subtypeName = '';


    // Lock flags
    public lockType = false;
    public lockPackage = false;
    public lockModel = false;
    public lockSubType = false;

    // Old values for change detection
    private oldType: string;
    private oldSelectedPackage = '';
    private oldSelectedModel = '';
    private oldAddingState = false;
    private oldSubtype: string;
    private oldCustomSTValid: boolean;

    public tDict = ItemTypes.trueTypeDict;
    public obk = Object.keys;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    // Form controls with validators
    public nameControl: FormControl = new FormControl('', {
        validators: [
        Validators.required,
        MixedCreatorDialogComponent.snake_case,
        MixedCreatorDialogComponent.already_taken(() => this.cacheList || [])
        ]
    });

    public customSTControl: FormControl = new FormControl('', {
        validators: [Validators.required]
    });

    constructor(
        @Optional() public dialogRef: MatDialogRef<MixedCreatorDialogComponent>,
        private workbenchService: WorkbenchService,
        private provider : EqualComponentsProviderService,
        @Optional() @Inject(MAT_DIALOG_DATA)
        public data: { node_type: string, package?: string, model?: string, sub_type?: string, lock_type?: boolean, lock_package?: boolean, lock_model?: boolean, lock_subtype?: boolean }
    ) {
        if (!data) {
        this.type = 'package';
        return;
        }

        // Determine component type from injected data
        this.type = this.obk(this.tDict).includes(data.node_type)
        ? data.node_type
        : (data.node_type === 'controller' ? 'do' : 'package');

        this.selectedModel = data.model || '';
        this.selectedPackage = data.package || '';
        this.subtype = data.sub_type || '';

        this.lockType = data.lock_type || false;
        this.lockPackage = data.lock_package && data.package ? data.lock_package : false;
        this.lockModel = data.lock_model && data.model ? data.lock_model : false;
        this.lockSubType = data.lock_subtype && data.sub_type ? data.lock_subtype : false;

        if (this.selectedPackage) {
        this.onPackageSelect();
        }
    }
        ngOnDestroy(): void {
            this.destroy$.next();
            this.destroy$.complete();
        }

    public async ngOnInit() {
        this.cachePkgList = await this.workbenchService.collectAllPackages().toPromise();

        //this.cachePkgList = await this.workbenchService.listPackages();
        this.loaded = true;
        await this.reloadList();
    }

    /**
     * Reloads the form display based on the selected entity type.
     */
    public async reloadList(): Promise<void> {
        if (!this.hasSomethingChanged) {
        return;
        }
        this.nameTitle = 'Name';
        this.needPackage = false;
        this.needModel = false;
        this.needSubtype = false;
        this.canAddSubtypes = false;

        await this.casing();

        if (!this.canAddSubtypes) {
        this.addingState = false;
        }

        this.resetFormControl();

        // Store old values for change detection
        this.oldType = this.type;
        this.oldAddingState = this.addingState;
        this.oldSelectedModel = this.selectedModel;
        this.oldSubtype = this.subtype;
        this.oldSelectedPackage = this.selectedPackage;
        this.oldCustomSTValid = this.customSTControl.valid;
    }

    public get hasSomethingChanged(): boolean {
        return (
        this.oldType !== this.type ||
        this.oldAddingState !== this.addingState ||
        this.oldSelectedModel !== this.selectedModel ||
        this.oldSubtype !== this.subtype ||
        this.oldSelectedPackage !== this.selectedPackage ||
        this.oldCustomSTValid !== this.customSTControl.valid
        );
    }

    public onPackageSelect(): void {
        forkJoin({
            models: this.provider.getComponents(this.selectedPackage, "class"),
            controllers: this.provider.getComponents(this.selectedPackage, "controller")
        }).pipe(
            takeUntil(this.destroy$),
            map(({ models, controllers }) => [
                ...models.map(m => m.name),
                ...controllers.map(c => c.name)
            ])
        ).subscribe(result => {
            this.cacheModelList = result;
            this.reloadList();
        });
    }



    /**
     * Set up component fields based on the type.
     */
    protected async casing(): Promise<void> {
        switch (this.type) {
        case 'package':
            this.cacheList = this.cachePkgList;
            this.implemented = true;
            break;
        case 'view':
            this.needPackage = true;
            this.needModel = true;
            this.needSubtype = true;
            this.implemented = true;
            this.subTypeList = ['list', 'form', 'search'];
            this.subtypeName = 'View Type';
            this.cacheList = [];
            if (this.selectedPackage && this.selectedModel) {
            const views = await this.workbenchService.collectViews(this.selectedPackage, this.selectedModel).toPromise();
            views?.filter(item => {
                const sp = item.split(':');
                return sp[1].split('.')[0] === this.subtype &&
                    sp[0] === `${this.selectedPackage}\\${this.selectedModel}`;
            }).forEach(item => {
                this.cacheList?.push(item.split(':')[1].split('.')[1]);
            });
            }
            break;
        case 'menu':
            this.needPackage = true;
            this.needSubtype = true;
            this.implemented = true;
            this.subTypeList = ['left', 'top'];
            this.subtypeName = 'Menu Type';
            this.cacheList = [];
            if (this.selectedPackage) {
            const menus = await this.workbenchService.getMenusByPackage(this.selectedPackage).toPromise();
            menus.forEach(item => this.cacheList?.push(item.split('.')[0]));
            }
            break;
        case 'class':
            this.needPackage = true;
            this.implemented = true;
            this.needSubtype = true;
            this.subtypeName = 'Extends from';
            if (this.selectedPackage) {
            const models = await this.workbenchService.collectClasses(true).toPromise();
            this.subTypeList = ['equal\\orm\\Model', ...models];
            this.cacheList = this.cacheModelList;
            }
            break;
        case 'do':
            this.needPackage = true;
            this.implemented = true;
            this.needSubtype = false;
            if (this.selectedPackage) {
            this.cacheList = await this.workbenchService.collectControllers('actions',this.selectedPackage,true).toPromise();
            }
            break;
        case 'get':
            this.needPackage = true;
            this.implemented = true;
            this.needSubtype = false;
            if (this.selectedPackage) {
            this.cacheList = await this.workbenchService.collectControllers('data',this.selectedPackage,true).toPromise();
            }
            break;
        case 'route':
            this.implemented = true;
            this.needPackage = true;
            this.needSubtype = true;
            this.canAddSubtypes = true;
            this.subtypeName = 'File';
            this.nameTitle = 'URL';
            if (this.selectedPackage) {
            const routes = await this.workbenchService.getRoutesByPackage(this.selectedPackage).toPromise();
            this.subTypeList = Object.keys(routes);
            console.log("subtypeList : ", this.subTypeList)
            this.cacheList = [];
            if (routes[this.subtype] && !this.addingState) {
                for (const key in routes[this.subtype]) {
                    console.log("key, ", key)
                this.cacheList.push(key);
                }
            } else if (this.addingState) {
                this.customStList = await this.workbenchService.getAllRouteFiles().toPromise();
            }
            }
            break;
        case 'policy':
            this.needPackage = true;
            this.needModel = true;
            this.implemented = true;
            this.cacheList = await this.workbenchService
            .getPolicies(this.selectedPackage, this.selectedModel)
            .pipe(
              map(response => Object.keys(response))
            )
            .toPromise();
            console.log("this.cache Liste : ", this.cacheList);
            break;
        default:
            this.implemented = false;
        }
    }

    public resetFormControl(): void {
        this.nameControl.clearValidators();
        this.nameControl.addValidators([
        Validators.required,
        Validators.maxLength(65),
        MixedCreatorDialogComponent.already_taken(() => this.cacheList || [])
        ]);
        this.customSTControl.clearValidators();
        this.customSTControl.addValidators(Validators.required);

        this.nameCasing();

        // Trigger validation by setting the same value
        this.nameControl.setValue(this.nameControl.value);

        if (this.NameDisabled) {
        this.nameControl.disable();
        } else {
        this.nameControl.enable();
        }
    }

    protected nameCasing(): void {
        switch (this.type) {
        case 'package':
        case 'view':
        case 'menu':
            this.nameControl.addValidators(MixedCreatorDialogComponent.snake_case);
            break;
        case 'class':
            this.nameControl.addValidators(MixedCreatorDialogComponent.camelCase);
            break;
        case 'do':
        case 'get':
            this.nameControl.addValidators(MixedCreatorDialogComponent.snake_case_controller);
            break;
        case 'route':
            this.nameControl.addValidators(MixedCreatorDialogComponent.url_case_controller);
            this.customSTControl.addValidators(MixedCreatorDialogComponent.route_file_controller);
            this.customSTControl.addValidators(MixedCreatorDialogComponent.already_taken(() => this.cacheList || [])
        );
            break;
        case'policy':
            this.nameControl.addValidators(MixedCreatorDialogComponent.already_taken(()=>this.cacheList || []));
            this.nameControl.addValidators(MixedCreatorDialogComponent.snake_case_controller);
            this.nameControl.addValidators(MixedCreatorDialogComponent.allLowerCase);
            break;
        }
    }

    public createComponent(): void {
        let node: EqualComponentDescriptor = this.createNodeDescriptor();
        node = this.formatNodeName(node);
        this.workbenchService.createNode(node)
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                this.dialogRef.close({ ...result, node });
            });
    }

    private createNodeDescriptor(): EqualComponentDescriptor {
        return {
            type: this.type,
            name: this.nameControl.value,
            package_name: this.selectedPackage,
            file: this.generateFilePath(),
            item: {
                subtype: this.subtype ? this.subtype : this.customSTControl.value,
                model: this.selectedModel
            }
        };
    }

    private formatNodeName(node: EqualComponentDescriptor): EqualComponentDescriptor {
        let formattedNode = { ...node };

        if (formattedNode.type === 'view') {
            formattedNode.name = `${formattedNode.item.model}:${this.subtype}.${formattedNode.name}`;
        }

        switch (formattedNode.type) {
            case 'get':
            case 'do':
                formattedNode.name = `${formattedNode.package_name}_${formattedNode.name}`;
                break;
            case 'route':
                formattedNode.item = {}
                break;
        }

        return formattedNode;
    }

    private generateFilePath(): string {
        const folders: Record<string, { folder: string; extension: string }> = {
            view: { folder: 'views', extension: '.json' },
            class: { folder: 'classes', extension: '.class.php' },
            route: { folder: 'init/routes', extension: '' }
        };

        if (this.type === 'route') {
            return `${this.selectedPackage}/${folders.route.folder}/${this.subtype ? this.subtype : this.customSTControl.value}`;
        }

        if(this.type ==='view'){
            return `${this.selectedPackage}/${folders.view.folder}/${this.selectedModel}.${this.subtype}.${this.nameControl.value}${folders.view.extension}`;
        }
        const config = folders[this.type];
        return config ? `${this.selectedPackage}/${config.folder}/${this.nameControl.value}${config.extension}` : '';
    }





    public get createDisabled(): boolean {
        return this.NameDisabled || this.nameControl.invalid;
    }

    public get NameDisabled(): boolean {
        return (
        (this.needPackage && !this.selectedPackage) ||
        (this.needModel && !this.selectedModel) ||
        (
            ((!this.canAddSubtypes || !this.addingState) && this.needSubtype && !this.subtype) ||
            (this.canAddSubtypes && this.addingState && this.customSTControl.invalid)
        )
        );
    }

    public setAddingState(state: boolean): void {
        this.addingState = state;
        this.reloadList();
    }

    // ----- Custom Validators -----

    public static camelCase(control: AbstractControl): ValidationErrors | null {
        const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\\abcdefghijkmlnopqrstuvwxyz';
        for (const char of control.value) {
        if (!validChars.includes(char)) {
            return { case: true };
        }
        }
        const parts = control.value.split('\\');
        const firstChar = parts[parts.length - 1][0];
        for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i].toLowerCase() !== parts[i]) {
            return { case: true };
        }
        }
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(firstChar) ? null : { case: true };
    }

    public static containsUnderscore(control: AbstractControl): ValidationErrors | null {
        if (typeof control.value !== 'string') {
          return null;
        }
        return control.value.includes('_') ? null : { missingUnderscore: true };
      }
    public static allLowerCase(control: AbstractControl): ValidationErrors | null {
        if (typeof control.value === 'string' && control.value !== control.value.toLowerCase()) {
          return { allLowerCase: true };
        }
        return null;
      }

    public static snake_case(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value;
        const validChars = 'abcdefghijkmlnopqrstuvwxyz-';
        for (const char of value) {
        if (!validChars.includes(char)) {
            return { case: true };
        }
        }
        return null;
    }

    public static snake_case_controller(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value;
        const validChars = 'abcdefghijkmlnopqrstuvwxyz-_';
        for (const char of value) {
        if (!validChars.includes(char)) {
            return { case: true };
        }
        }
        return null;
    }

    public static url_case_controller(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value;
        if (value.length < 2 || !value.startsWith('/')) {
        return { case: true };
        }
        const validChars = 'abcdefghijkmlnopqrstuvwxyz_/:';
        for (const char of value) {
        if (!validChars.includes(char)) {
            return { case: true };
        }
        }
        return null;
    }

    public static route_file_controller(control: AbstractControl): ValidationErrors | null {
        const value: string = control.value;
        const dgts = '0123456789';
        const letter = 'abcdefghijklmnopqrstuvwxyz';
        if (value.length < 3 || !value.endsWith('.json')) {
        return { case: true };
        }
        if (!(dgts.includes(value[0]) && dgts.includes(value[1])) || (value[0] === '0' && value[1] === '0')) {
        return { case: true };
        }
        if (value[2] !== '-') {
        return { case: true };
        }
        for (let i = 3; i < value.length - 5; i++) {
        if (!letter.includes(value[i])) {
            return { case: true };
        }
        }
        return null;
    }

    public static already_taken(getPkgList: () => string[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
        const pkgList = getPkgList();
        if (!pkgList) {
            return { taken: true };
        }
        for (const pkg of pkgList) {
            if (pkg === control.value) {
            return { taken: true };
            }
        }
        return null;
        };
    }


    public getControlsErrors(control: FormControl): string {
        if (control.getError('required')) {
        return 'this field is mandatory';
        }
        if (control.getError('case')) {
        return 'this does not comply with naming standards';
        }
        if (control.getError('taken')) {
        return 'this name is already taken';
        }
        if (control.getError('maxlength')) {
        return 'this name is too long';
        }
        return '';
    }
}
