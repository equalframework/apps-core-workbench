import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvService } from 'sb-shared-lib';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Component({
  selector: 'info-system',
  templateUrl: './info-system.component.html',
  styleUrls: ['./info-system.component.scss']
})
export class InfoSystemComponent implements OnInit, OnChanges {
    @Input() component_type: string = '';
    @Input() package_name: string ='';
    total_count$!: Observable<number>;
    envData$!: Observable<any>;

    constructor(
        private equalComponentsProvider: EqualComponentsProviderService,
        private envService: EnvService
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Recalculate data if component_type changes
        if (changes['component_type'] && !changes['component_type'].firstChange) {
        this.loadData();
        }
    }

    private loadData(): void {
        this.total_count$ = this.loadCount();
        this.envData$ = this.loadEnvData();
    }

    private loadCount(): Observable<number> {
        return this.equalComponentsProvider.getComponentCountByType(this.component_type,this.package_name)
    }

    private loadEnvData(): Observable<any> {
        return from(this.envService.getEnv()).pipe(
        map((response:any) => ({
            app_logo_url: response.app_logo_url || '',
            app_name: response.app_name || '',
            backend_url: response.backend_url || '',
            company_name: response.company_name || '',
            version: response.version || '',
            license: response.license || '',
            license_url: response.license_url || '',
            locale: response.locale || '',
            currency_symbol: response.core?.units?.currency || ''
        }))
        );
    }
    }
