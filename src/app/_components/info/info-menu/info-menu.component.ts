import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonValidationService, ValidationStatusInfo } from 'src/app/in/_services/json-validation.service';

@Component({
  selector: 'info-menu',
  templateUrl: './info-menu.component.html',
  styleUrls: ['./info-menu.component.scss']
})
export class InfoMenuComponent implements OnInit, OnChanges, OnDestroy {

    @Input() menu: EqualComponentDescriptor;
    @Input() selected_package: string;

    public loading: boolean = true;
    public menuSchema: any = null;
    public validationStatus: ValidationStatusInfo[] = [];
    private destroy$ = new Subject<void>();

    constructor(
            private router: RouterMemory,
            private workbenchService: WorkbenchService,
            private jsonValidationService: JsonValidationService
        ) { }

    public ngOnInit(): void {
        this.loadMenu();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.menu) {
            this.loadMenu();
        }
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadMenu(): void {
        if (!this.menu?.package_name || !this.menu?.name) {
            this.loading = false;
            this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'No menu selected');
            return;
        }

        this.selected_package = this.menu.package_name;
        this.loading = true;
        this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, true);

        this.workbenchService.readMenu(this.menu.package_name, this.menu.name)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.menuSchema = data;
                    this.validateSchema();
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to load menu schema');
                }
            });
    }

    private validateSchema(): void {
        this.jsonValidationService.validate(
            this.menuSchema,
            'urn:equal:json-schema:core:menu',
            this.menu?.package_name
        ).subscribe({
            next: (result) => {
                this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', result);
            },
            error: () => {
                this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to validate menu');
            }
        });
    }

    public onclickTranslations() {
        this.router.navigate(['/package/'+this.selected_package+'/menu/'+this.menu.name+'/translations']);
    }

    public onclickEdit() {
        this.router.navigate(['/package/'+this.selected_package+'/menu/'+this.menu.name+'/edit']);
    }


}
