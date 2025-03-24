import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { PackageModelPolicies } from './package-model-policies.component';
import { PoliciesRoutingModule } from './policies-routing.module';
import { PolicyEditorListComponent } from './_components/policy-editor-list/policy-editor-list.component';
import { ClassicLayoutModule } from 'src/app/in/classic-layout/classic-layout.module';


@NgModule({
    declarations: [
        PackageModelPolicies,
        PolicyEditorListComponent
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        ClassicLayoutModule,
        PropertyDomainModule,
        PoliciesRoutingModule,
    ],
})
export class PackageModelPoliciesModule { }
