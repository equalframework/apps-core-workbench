import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { FormControl } from '@angular/forms';
import { ItemTypes } from 'src/app/in/_models/item-types.class';
import { takeUntil, tap } from 'rxjs/operators';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class SearchMixedFacade implements OnDestroy {

  private elementsSubject: BehaviorSubject<EqualComponentDescriptor[]> = new BehaviorSubject<EqualComponentDescriptor[]>([]);
  private filteredDataSubject: BehaviorSubject<EqualComponentDescriptor[]> = new BehaviorSubject<EqualComponentDescriptor[]>([]);
  private search_scope:string;
  private search_value : string;
  elements$ = this.elementsSubject.asObservable();
  filteredData$ = this.filteredDataSubject.asObservable();

  public typeDict: { [id: string]: { icon: string, disp: string } } = ItemTypes.typeDict;
    destroy$: Subject<void> = new Subject<void>();

  constructor(
    private provider: EqualComponentsProviderService,
    private workbenchService: WorkbenchService,
  ) {

  }
    ngOnDestroy(): void {
this.destroy$.next();
this.destroy$.complete();
}




  loadComponents(package_name: string, node_type: string, model_name: string): void {
    const source$ = package_name
      ? this.provider.getComponents(package_name, node_type, model_name)
      : this.provider.equalComponents$;

    source$.pipe(takeUntil(this.destroy$)).subscribe(
      components => this.updateComponents(components),
      error => this.handleError(error)
    )
}

  private updateComponents(components: EqualComponentDescriptor[]) {
    this.elementsSubject.next(components);
    this.filteredDataSubject.next(components);
    this.onSearch()
  }

  private handleError(error: any) {
    console.error('Erreur lors du chargement des composants:', error);
  }

  setSearches(search_scope : string, search_value:string){
    this.search_value=search_value;
    this.search_scope=search_scope
  }
  
  onSearch() {
    const arrowSplit = this.search_value.split(">");
    const searchPackage = arrowSplit.length > 1 ? arrowSplit[0] : "";
    const searchArgs = (arrowSplit.length > 1 ? arrowSplit.slice(1).join("=>") : arrowSplit[0]).split(" ");

    const filteredData = this.elementsSubject.getValue().filter((node: EqualComponentDescriptor) => {
      let contains = true;
      let clue: string = "";

      if (node.type === "route") {
        clue = (node.package_name ? node.package_name : "") + "-" + (node.more ? node.more : "") + "-" + node.name;
      } else if (node.type === "class") {
        clue = (node.package_name ? node.package_name : "") + "\\" + node.name;
      } else {
        clue = node.name;
      }

      for (let arg of searchArgs) {
        if (searchPackage && (((node.package_name && node.package_name !== searchPackage)) || (!node.package_name && node.name !== searchPackage))) {
          contains = false;
          break;
        }
        if (!clue.toLowerCase().includes(arg.toLowerCase())) {
          contains = false;
          break;
        }
      }

      return (contains && (
        this.search_scope === ''
        || (node.type === '')
        || (node.type === this.search_scope)
        || ('controller' === this.search_scope && (node.type === 'get' || node.type === 'do'))
        || ('view' === this.search_scope && (node.type === 'list' || node.type === 'form'))
      ));
    });

    const sortedFilteredData = filteredData.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });


    this.filteredDataSubject.next(sortedFilteredData);
  }



  addNode(newNode: EqualComponentDescriptor): void {
    const currentElements = this.elementsSubject.getValue();
    this.setElements([...currentElements, newNode]);
    this.provider.reloadComponents(newNode.package_name, newNode.type);
  }

  removeNode(nodeToRemove: EqualComponentDescriptor): void {
    const currentElements = this.elementsSubject.getValue();
    this.setElements(currentElements.filter(node => node !== nodeToRemove));
    this.provider.reloadComponents(nodeToRemove.package_name, nodeToRemove.type);
  }

  deleteNode(node: EqualComponentDescriptor): Observable<any> {
    return this.workbenchService.deleteNode(node).pipe(
      takeUntil(this.destroy$),
      tap(result => {
        if (result.success) {
          this.removeNode(node);
        }
      })
    );
  }

  private setElements(elements: EqualComponentDescriptor[]): void {
    this.elementsSubject.next([...elements]);
    this.filteredDataSubject.next([...elements]);
  }


}
