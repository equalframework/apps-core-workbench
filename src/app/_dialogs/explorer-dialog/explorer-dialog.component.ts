import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExplorerDialogFacade } from './explorer-dialog.facade';
import { Observable } from 'rxjs';

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


  packages$ = this.facade.packages$;
  items$ = this.facade.items$;
  selectedPackage$ = this.facade.selectedPackage$;
  errorMessage$ = this.facade.errorMessage$
  newItem: string = '';

  // Added property for selected item
  selectedItem: any = null;


  constructor(
    @Optional() public dialogRef: MatDialogRef<ExplorerDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private facade: ExplorerDialogFacade
  ) {}


  ngOnInit(): void {

  }

  onSelectPackage(packageName: string): void {
    // Reset selected item when switching folders.
    this.selectedItem = null;
    this.facade.selectPackage(packageName);
    if (this.data?.fetchItems) {
      this.facade.loadItems(this.data.fetchItems, packageName);
      console.log("this item : ", this.items$)
    }
  }

  // New method to handle item selection
  onSelectItem(item: any): void {
    this.selectedItem = item;
  }

  onCreateItem(): void {
    if (this.newItem && this.data?.createItem) {
      // Optionally apply formatting if necessary.
      const formattedItem = this.data.formatItem ? this.data.formatItem(this.newItem) : this.newItem;
      const selectedPackage = this.facade.getSelectedPackage();
      if (selectedPackage) {
        // Use the optimistic method to add the item.
        this.facade.optimisticCreateItem(this.data.createItem, formattedItem, selectedPackage);
        // Reset the input field.
        this.newItem = '';
      }
    }
  }
}
