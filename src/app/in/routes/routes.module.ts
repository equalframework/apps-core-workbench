import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesComponent } from './routes.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RoutesRoutingModule } from './routes-routing.module';
import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

@NgModule({
    declarations: [
        RoutesComponent,
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        DragDropModule,
        RoutesRoutingModule,
        AutocompleteModule,
        ClassicLayoutModule
    ]
})
export class RoutesModule { }
