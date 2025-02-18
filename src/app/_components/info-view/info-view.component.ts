import { EqualComponentsProviderService } from './../../in/_services/equal-components-provider.service';
import { Component, Input, OnChanges, OnInit, Output, EventEmitter, SimpleChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
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

    public view_id: string;
    public entity: string;

    public view_schema: any;
    public fields: any;

    constructor(
            private router: Router,
            private api: WorkbenchService,
            private provider: EqualComponentsProviderService) {
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
      
        // Vérifier si 'view' est bien défini
        if (!this.view || !this.view.package_name || !this.view.item || !this.view.item.model) {
          console.error('Invalid view data:', this.view);
          this.loading = false;
          return;
        }
      
        try {
          // Préparer les paramètres pour 'getComponents'
          const packageName = this.view.package_name;
          const modelName = this.view.item.model;
          
          // Définir les valeurs pour 'entity' et 'view_id'
          this.entity = `${packageName}\\${modelName}`;
          this.view_id = this.view.name;
      
          // Appeler l'API pour récupérer les composants
          this.provider.getComponents(packageName, 'view', modelName)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (data) => {
                // Si les données sont valides
                if (data && Array.isArray(data)) {
                  this.view_schema = [...data];
                  this.fields = this.getFields(this.view_schema);
                } else {
                  console.warn('Invalid data format for view schema:', data);
                }
              },
              (error) => {
                console.error('Error loading view details:', error);
              },
              () => {
                // Charger les champs après la réception des données
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

        for(let item of this.view_schema.layout?.items ?? []) {
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

    getFieldsCount(): number {
        if (this.view_schema && this.view_schema.fields) {
            return Object.keys(this.view_schema.fields).length;
        }
        return 0;  // Si `view_schema` ou `fields` est undefined, retourne 0
    }
    
}
