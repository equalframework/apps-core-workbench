import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-explorer-dialog-component',
  templateUrl: './explorer-dialog-component.component.html',
  styleUrls: ['./explorer-dialog-component.component.scss']
})
export class ExplorerDialogComponentComponent implements OnInit {

    constructor(
        @Optional() public dialogRef: MatDialogRef<ExplorerDialogComponentComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: {
            fetchItems: (type: string) => Observable<any>,
            addItem?: (item: string, packageName: string) => Observable<any>
        },
        private provider: EqualComponentsProviderService
    ) {}

    items$: Observable<any>;
    packages$: Observable<string[]>;

    selectedPackage: string | null = null;
    selectedItem: string | null = null;

    newItem: string = '';

    ngOnInit() {
        this.loadPackages();
        //this.loadItems();
    }

    private loadPackages() {
        this.packages$ = this.provider.getPackages();
    }

    private loadItems() {
        if (this.data?.fetchItems) {
            this.items$ = this.data.fetchItems('genericType');
        }
    }

    private loadItemsFor(packageName: string) {
        if (this.data?.fetchItems && packageName) {
            this.items$ = this.data.fetchItems(packageName);
        }
    }

    onSelectPackage(packageName: string) {
        if(this.selectedPackage != packageName){
            this.loadItemsFor(packageName);
            this.selectedPackage = packageName;
            this.selectedItem = null;
        }
    }


    onSelectItem(item: string) {
        this.selectedItem = item;
    }

    isPackageSelected(packageName: string): boolean {
        return this.selectedPackage === packageName;
    }

    oncreateItem(){
        console.log("crée ");
    }
}
