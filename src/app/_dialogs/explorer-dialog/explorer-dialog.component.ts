import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Optional, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExplorerDialogFacade } from './explorer-dialog.facade';
import { Observable, Subject } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

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
export class ExplorerDialogComponent implements OnInit, OnDestroy {
    fileForm: FormGroup;


    packages$ = this.facade.packages$;
    items$ = this.facade.items$;
    selectedPackage$ = this.facade.selectedPackage$;
    errorMessage$ = this.facade.errorMessage$

    // Added property for selected item
    selectedItem: any = null;
    private destroy$ = new Subject<void>();


    constructor(
        @Optional() public dialogRef: MatDialogRef<ExplorerDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private facade: ExplorerDialogFacade,
        private fb: FormBuilder
    ) {}


    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.facade.reset();
    }

    ngOnInit(): void {
        this.createForm()
        this.resetState()
        this.facade.items$.pipe(takeUntil(this.destroy$)).subscribe(items => {
            const existingNames = items;
            const control = this.fileForm.get('newItem');
            if (control) {
            control.setValidators([
                Validators.required,
                this.noDotsValidator,
                this.duplicateValidator(existingNames)
            ]);
            control.updateValueAndValidity();
            }
        });
    }

    private resetState() {
        this.fileForm.reset();
        this.selectedItem = null;
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
        return 'The filename cannot contain a period (\'.\').';
        }
        if (control?.hasError('duplicate')) {
        return 'Same name already exists';
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

    private duplicateValidator(existingNames: string[]) {
        return (control: AbstractControl): ValidationErrors | null => {
        if (control.value && existingNames.includes(this.data.formatItem ? this.data.formatItem(control.value) : control.value)) {
            return { duplicate: true };
        }
        return null;
        };
    }



}
