import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './autocomplete.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
    declarations: [
        AutocompleteComponent
    ],
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        MatOptionModule,
        MatAutocompleteModule,
        ReactiveFormsModule
    ],
    exports : [
        AutocompleteComponent
    ]
})
export class AutocompleteModule { }

export { AutocompleteComponent }