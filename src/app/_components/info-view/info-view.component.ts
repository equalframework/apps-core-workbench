import { EqualComponentsProviderService } from './../../in/_services/equal-components-provider.service';
import { Component, Input, OnChanges, OnInit, Output, EventEmitter, SimpleChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchV1Service } from 'src/app/in/_services/workbench-v1.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


@Component({
    selector: 'info-view',
    templateUrl: './info-view.component.html',
    styleUrls: ['./info-view.component.scss']
})
export class InfoViewComponent implements OnInit, OnChanges, OnDestroy {
    @Input() view: EqualComponentDescriptor;
    private destroy$: Subject<boolean> = new Subject<boolean>();
    public loading: boolean = true;

    public view_name: string;

    public viewSchema: any;
    public fields: any;

    constructor(
        private router: Router,
        private workbenchService: WorkbenchV1Service) {
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

          this.workbenchService.readView(packageName, this.view_name, model_name)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (data) => {
                if (data) {
                    const schema = data.response; // Nom plus clair
                    this.viewSchema = schema;                  
                    this.fields = this.getFields(this.viewSchema);
                } else {
                  console.warn('Invalid data format for view schema:', data);
                }
              },
              (error) => {
                console.error('Error loading view details:', error);
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
        console.log("view ", this.view);
        this.router.navigate(['/package/' + this.view.package_name + '/view/' + this.view.name]);
    }

    public onclickTranslations() {
        // #todo - depends on route assigned to translation
        this.router.navigate([`/package/${this.view.package_name}/model/${this.view.item.model}/translations`]);
    }

    private getFields(schema: any): any {
        let mapFields: any = {};
        let items: Array<any> = [];

        for(let group of schema.layout?.groups ?? []) {
            for(let section of group.sections) {
                for(let row of section.rows) {
                    for(let column of row.columns) {
                        for(let item of column.items) {
                            if(item.type == 'field') {
                                items.push(item);
                            }
                        }
                    }
                }
            }
        }

        for(let item of this.viewSchema.layout?.items ?? []) {
            if(item.type == 'field') {
                items.push(item);
            }
        }

        for(let item of items) {
            if(item.type == 'field') {
                mapFields[item.value] = item;
            }
        }

        return mapFields;
    }
    getFieldKeys(): string[] {
        return this.fields ? Object.keys(this.fields) : [];
    }

    public getFieldsCount(): number {
        return this.fields ? Object.keys(this.fields).length : 0;
    }

}
