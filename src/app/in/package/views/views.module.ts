import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageViewsRoutingModule } from './views-routing.module';
import { SharedLibModule } from 'sb-shared-lib';
import { FormsModule } from '@angular/forms';
import { PackageViewsComponent } from './package-views.component';
import { HttpClientModule } from '@angular/common/http';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { GroupsViewerComponent } from 'src/app/_components/groups-viewer/groups-viewer.component';
import { ItemViewerComponent } from 'src/app/_components/item-viewer/item-viewer.component';

@NgModule({
    declarations: [
        PackageViewsComponent,
    ],
    imports: [
        SharedLibModule,
        WorkbenchModule,
        FormsModule,
        CommonModule,
        PackageViewsRoutingModule,
        HttpClientModule
    ],
    providers : [
        HttpClientModule
    ]
})
export class PackageViewsModule { }
