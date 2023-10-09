import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteConfirmationComponent } from './delete-confirmation.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    DeleteConfirmationComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  exports : [
    DeleteConfirmationComponent
  ]
})
export class DeleteConfirmationModule { }
