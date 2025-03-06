import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExplorerDialogFacade } from './explorer-dialog.facade';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface DialogData {
  fetchItems: (packageName: string) => Observable<any>;
  createItem?: (item: string, packageName: string) => Observable<any>;
  formatItem?: (item: string) => string;
}

@Component({
  selector: 'app-explorer-dialog',
  templateUrl: './explorer-dialog.component.html',
  styleUrls: ['./explorer-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerDialogComponent implements OnInit {
    fileForm: FormGroup;


  packages$ = this.facade.packages$;
  items$ = this.facade.items$;
  selectedPackage$ = this.facade.selectedPackage$;
  errorMessage$ = this.facade.errorMessage$

  // Added property for selected item
  selectedItem: any = null;


  constructor(
    @Optional() public dialogRef: MatDialogRef<ExplorerDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private facade: ExplorerDialogFacade,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createForm()
  }



  onSelectPackage(packageName: string): void {
    // Reset selected item when switching folders.
    this.selectedItem = null;
    this.fileForm.reset();
    this.facade.selectPackage(packageName);
    if (this.data?.fetchItems) {
      this.facade.loadItems(this.data.fetchItems, packageName);
    }
  }

  // New method to handle item selection
  onSelectItem(item: any): void {
    this.selectedItem = item;
  }

  onCreateItem(): void {
    if (this.fileForm.valid && this.data?.createItem) {
      const newItem = this.fileForm.value.newItem;

      const formattedItem = this.data.formatItem ? this.data.formatItem(newItem) : newItem;
      const selectedPackage = this.facade.getSelectedPackage();
      if (selectedPackage) {
        // Use the optimistic method to add the item.
        this.facade.optimisticCreateItem(this.data.createItem, formattedItem, selectedPackage);
        // Reset the input field.
        this.fileForm.reset();
      }
    }
  }

   getErrorMessage(controlName: string): string {
    const control = this.fileForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Item name is required.';
    }
    if (control?.hasError('invalidCharacter')) {
      return 'The filename cannot contain a period (\'\').';
    }
    return '';
  }

  private createForm() {
    this.fileForm = this.fb.group({
      newItem: ['', [
        Validators.required,
        this.noDotsValidator,
      ]]
    });
  }

  private noDotsValidator(control: any) {
    if (control.value && control.value.includes('.')) {
      return { invalidCharacter: true };
    }
    return null;
  }



}
