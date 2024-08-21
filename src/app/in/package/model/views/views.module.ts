import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewsRoutingModule } from './views-routing.module';
import { SharedLibModule } from 'sb-shared-lib';
import { FormsModule } from '@angular/forms';
import { PackageModelViewsComponent } from './package-model-views.component';
import { HttpClientModule } from '@angular/common/http';
import { ClassicLayoutModule } from '../../../classic-layout/classic-layout.module';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

@NgModule({
    declarations: [
        PackageModelViewsComponent,
    ],
    imports: [
        SharedLibModule,
        WorkbenchModule,
        FormsModule,
        CommonModule,
        ViewsRoutingModule,
        HttpClientModule,
        ClassicLayoutModule
    ],
    providers : [
        HttpClientModule
    ]
})
export class PackageModelViewsModule { }
