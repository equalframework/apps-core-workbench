import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from  '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from  '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


import { InnerHeaderComponent } from '../../_components/inner-header/inner-header.component';
import { SearchMixedListComponent } from '../../_components/search-list/search-mixed-list/search-mixed-list.component';




// @deprecated - use workbench module


// #memo - importing sharedlib here prevents the build to complete

@NgModule({
    declarations: [
        InnerHeaderComponent,
        SearchMixedListComponent,
    ],
    imports: [
        CommonModule,
        // #memo - all material modules required by declared components must be imported
        MatDatepickerModule, MatNativeDateModule, MatRippleModule, MatCardModule, MatListModule, MatButtonModule, MatSidenavModule,  MatIconModule, MatToolbarModule,
        MatChipsModule, MatExpansionModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule,
        MatProgressBarModule, MatCheckboxModule, MatAutocompleteModule, MatMenuModule, MatBadgeModule, MatStepperModule, MatGridListModule, MatTreeModule, MatSlideToggleModule,
        MatButtonToggleModule, MatPaginatorModule, MatDialogModule, ReactiveFormsModule
    ],
    exports : [
        InnerHeaderComponent,
        SearchMixedListComponent,
    ]
})
export class WorkbenchSharedModule { }

/*
    Public API Surface of workbench module
    // #memo - this is mandatory for other modules to be able to load Components from this one
*/
export {
    InnerHeaderComponent, SearchMixedListComponent,
 };

