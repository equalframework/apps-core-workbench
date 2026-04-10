import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonValidationService, ValidationStatusInfo } from 'src/app/in/_services/json-validation.service';

@Component({
    selector: 'info-view',
    templateUrl: './info-view.component.html',
    styleUrls: ['./info-view.component.scss'],
    encapsulation : ViewEncapsulation.Emulated

})
export class InfoViewComponent implements OnInit, OnChanges, OnDestroy {
    @Input() view: EqualComponentDescriptor;
    private destroy$: Subject<boolean> = new Subject<boolean>();
    public loading: boolean = true;
    public validationStatus: ValidationStatusInfo[] = [];
    public metaData: {
        icon: string;
        tooltip: string;
        value: string;
        copyable?: boolean;
        double_backslash?:boolean
      }[];

    public view_name: string;

    public viewSchema: any;
    obk = Object.keys
    constructor(
        private router: RouterMemory,
      private workbenchService: WorkbenchService,
      private jsonValidationService: JsonValidationService) {
    }
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }


    public ngOnInit() {
        this.loading = true;
        this.load();
    }



    async ngOnChanges(changes: SimpleChanges) {
        if (changes.view) {
          this.load();
        }
      }

      private load() {
        this.loading = true;
        if (!this.view || !this.view.package_name || !this.view.item || !this.view.item.model) {
          console.error('Invalid view data:', this.view);
          this.loading = false;
          return;
        }

        try {
          const packageName = this.view.package_name;
          const model_name = this.view.item.model;
          this.view_name = this.view.name.split(":")[1];
          this.metaData =[
            { icon: 'description', tooltip: 'File path', value: this.view.file , copyable: true },
            { icon: 'key', tooltip: 'ID', value: this.view_name, copyable:true },
            {icon: 'category',tooltip: 'entity/model', value:`${this.view.package_name}\\${this.view.item.model}`, copyable:true, double_backslash:true}
            ]
          this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, true);
          this.workbenchService.readView(packageName, this.view_name, model_name)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (data) => {
                if (data) {
                    const schema = data;
                    this.viewSchema = schema;
                    this.validateSchema();
                } else {
                  console.warn('Invalid data format for view schema:', data);
                  this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to load view schema');
                }
              },
              (error) => {
                console.error('Error loading view details:', error);
                this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to load view schema');
              },
              () => {
                this.loading = false;
              }
            );
        } catch (response) {
          console.error('Unexpected error - restricted visibility?', response);
          this.loading = false;
        }
    }

    public onclickEdit() {
        this.router.navigate([`/package/${this.view.package_name}/view/${this.view.name}/edit`]);
    }

    public onclickTranslations() {
        this.router.navigate([`/package/${this.view.package_name}/model/${this.view.item.model}/translations`], 
        { queryParams: { 'tab': 'view', 'view': this.view.name } });
    }

    private validateSchema(): void {
      const schemaType = this.view_name.split('.')[0] || 'form';
      this.jsonValidationService.validate(
        this.viewSchema,
        `urn:equal:json-schema:core:view.${schemaType}.default`,
        this.view?.package_name
      ).pipe(takeUntil(this.destroy$)).subscribe((result) => {
        this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', result);
      });
    }

}
