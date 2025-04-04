import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { ClassicLayoutModule } from 'src/app/in/classic-layout/classic-layout.module';
import { PackageModelRolesComponent } from './package-model-roles.component';
import { RolesRoutingModule } from './roles-routing.module';



@NgModule({
    declarations: [
        PackageModelRolesComponent
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        ClassicLayoutModule,
        PropertyDomainModule,
        RolesRoutingModule
      ],
})
export class PackageModelRolesModule { }
