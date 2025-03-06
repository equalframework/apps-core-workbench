import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ExplorerDialogFacade {
    private packagesSubject = new BehaviorSubject<string[]>([]);
    private itemsSubject = new BehaviorSubject<any[]>([]);
    private selectedPackageSubject = new BehaviorSubject<string | null>(null);
    private errorMessageSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);



    errorMessage$: Observable<string | null> = this.errorMessageSubject.asObservable();
    packages$ = this.packagesSubject.asObservable();
    items$ = this.itemsSubject.asObservable();
    selectedPackage$ = this.selectedPackageSubject.asObservable();

    constructor(private provider: EqualComponentsProviderService, private snackBar: MatSnackBar) {
        this.loadPackages();
    }

    private loadPackages(): void {
        this.provider.getPackages().subscribe({
        next: (packages: string[]) => this.packagesSubject.next(packages),
        error: err => console.error('Error loading packages', err)
        });
    }

    selectPackage(packageName: string): void {
        if (this.selectedPackageSubject.getValue() !== packageName) {
        this.selectedPackageSubject.next(packageName);
        }
    }

    loadItems(fetchItems: (packageName: string) => Observable<any>, packageName: string): void {
        fetchItems(packageName).subscribe({
        next: (items: any[]) => this.itemsSubject.next(items),
        error: err => console.error('Error loading items', err)
        });
    }

    getSelectedPackage(): string | null {
        return this.selectedPackageSubject.getValue();
    }

    /**
     * Optimistically adds a new item.
     * @param createItemFn The function that performs the HTTP call to create the item.
     * @param newItem The new item to be added (string or object depending on your model).
     * @param packageName The name of the package to which the item is to be added.
     */
    optimisticCreateItem(
        createItemFn: (item: string, packageName: string) => Observable<any>,
        newItem: string,
        packageName: string
    ): void {
        // Get the current state
        const previousItems = this.itemsSubject.getValue();

        if (previousItems.some(item => item === newItem)) {
            this.errorMessageSubject.next("An item with the same name already exists")
            return;
        }

        // Create an optimistic item (using a temporary ID)
        const optimisticItem = { id: 'temp-' + new Date().getTime(), name: newItem, optimistic: true };

        // Immediately update the stream with the optimistic item
        this.itemsSubject.next([...previousItems, optimisticItem]);

        // Call the createItem function via HTTP
        createItemFn(newItem, packageName).subscribe({
        next: () => {
            // Replace the optimistic item with the actual item returned by the API
            const updatedItems = this.itemsSubject.getValue().map(item =>
            item.id === optimisticItem.id ? newItem : item
            );
            this.itemsSubject.next(updatedItems);
        },
        error: (error) => {
            console.error('Error creating item', error);
            // On error, revert back to the previous state
            this.itemsSubject.next(previousItems);
        }
        });
    }
}
