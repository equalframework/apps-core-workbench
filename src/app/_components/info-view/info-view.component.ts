import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

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

    public view_name: string;

    public viewSchema: any;
    obk = Object.keys
    constructor(
        private router: Router,
        private workbenchService: WorkbenchService) {
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
                    const schema = data;
                    this.viewSchema = schema;
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

}
