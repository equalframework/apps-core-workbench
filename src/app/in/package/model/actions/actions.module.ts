import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { ClassicLayoutModule } from 'src/app/in/classic-layout/classic-layout.module';
import { ActionsRoutingModule } from './actions-routing.module';
import { PackageModelActionsComponent } from './package-model-actions.component';


@NgModule({
    declarations: [
        PackageModelActionsComponent
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        ClassicLayoutModule,
        PropertyDomainModule,
        ActionsRoutingModule
      ],
})
export class PackageModelActionsModule { }
