import { KeyValue } from '@angular/common';
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
    @Input() class_name:string = '';
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
        return this.equalComponentsProvider.getComponentCountByType(this.component_type,this.package_name,this.class_name)
    }

    private loadEnvData(): Observable<any> {
        return from(this.envService.getEnv());
    }
    objectEntries(obj: any): Array<{ key: string, value: any }> {
        return Object.keys(obj).map(key => ({ key, value: obj[key] }));
    }
    isUrl(value: unknown): value is string {
        return typeof value === 'string' && value.startsWith('http');
      }


// Dans le composant
originalOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => 0;


    }
