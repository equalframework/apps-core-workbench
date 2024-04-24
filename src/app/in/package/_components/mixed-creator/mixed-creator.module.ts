import { NgModule } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { FormsModule } from '@angular/forms';
import { MixedCreatorComponent } from './mixed-creator.component';
import { AutocompleteModule } from 'src/app/in/autocomplete/autocomplete.module';


@NgModule({
    imports: [
        SharedLibModule,
        FormsModule,
        AutocompleteModule
    ],
    declarations: [
        MixedCreatorComponent,
    ],
    exports:[
        MixedCreatorComponent
    ],
    providers: [
    ]
})
export class MixedCreatorModule { }