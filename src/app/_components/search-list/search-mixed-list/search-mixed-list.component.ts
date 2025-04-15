import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ItemTypes } from 'src/app/in/_models/item-types.class';

import { MixedCreatorDialogComponent } from 'src/app/_dialogs/mixed-creator-dialog/mixed-creator-dialog.component';
import { DeleteConfirmationDialogComponent } from 'src/app/_dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';

import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/in/_services/notification.service';

/**
 * This component is used to display the list of all object you recover in package.component.ts
 *
 * If you need to add a new type, you just have to add it in type_dict and create the css rules for the icon in search-mixed-list.component.scss
 * You can also describe the spelling rule of the name in search-mixed-list.component.html
*/

@Component({
    selector: 'search-mixed-list',
    templateUrl: './search-mixed-list.component.html',
    styleUrls: ['./search-mixed-list.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class SearchMixedListComponent implements OnInit, OnDestroy {
    private destroy$: Subject<boolean> = new Subject<boolean>();

    // Selected node of the list (consistent with node_type, if provided): parent might force the selection of a node (goto)
    @Input() node_selected?: EqualComponentDescriptor;

    // (optional) Filter for type of components to be loaded (""[all], "package", "class", "get", "do", "route", "view", "menu"). Empty string means "all".
    // When set, only components of that type can be listed and created
    @Input() node_type?: string;

    // optional package ref for limiting creation of components to that specific package
    @Input() package_name: string = "";
    @Input() model_name : string="";
    @Input() allow_create: boolean = true;
    @Input() allow_update: boolean = true;
    @Input() allow_delete: boolean = true;
    public packageStates: { [packageName: string]: boolean } = {};  // Pour suivre l'état des packages

    /*
        EqualComponentDescriptor Structure is as follow:

        {
            package: name of the package,
            name: name of the component
            type: type of the component ("package", "get", "do", "route", "view", "menu")
            item: original item holding additional info, depending on the type of the component
        }
    */

    // event for notifying parent that selected object has changed
    @Output() selectNode = new EventEmitter<EqualComponentDescriptor>();
    @Output() updateNode = new EventEmitter<{ old_node: EqualComponentDescriptor, new_node: EqualComponentDescriptor }>();
    @Output() searchScopeChange = new EventEmitter<string>();

    // event for notifying parent that the list has been updated and needs to be refreshed
    @Output() updated = new EventEmitter();

    // Array of all components fetched from server
    public elements: EqualComponentDescriptor[] = [];

    public loading: boolean = false;

    // filtered derivative of `elements` with purpose to be displayed
    public filteredData: EqualComponentDescriptor[];
    // value part of the search bar field (parsed in onSearch() method)
    public search_value: string = '';
    // type part of the search bar field (is parsed in onSearch() method)
    public search_scope: string = "";

    // used to render info about components present in filteredData (or data)
    public type_dict: { [id: string]: { icon: string, disp: string } } = ItemTypes.typeDict;
    // formControl for search input field
    public inputControl = new FormControl('');

    public editingNode: EqualComponentDescriptor;
    public editedNode: EqualComponentDescriptor;

    constructor(
        private dialog: MatDialog,
        private provider: EqualComponentsProviderService,
        private notificationService: NotificationService,
        private workbenchService:WorkbenchService,
        private router: Router,
    ) { }


    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    public ngOnInit() {
        this.loading = true;
        this.loadNodesV2();
    }

    public async ngOnChanges(changes: SimpleChanges) {
        if (changes.node_type && this.node_type) {
            this.selectSearchScope();
        }
        this.onSearch();
    }

    trackByFn = (index: number, item: EqualComponentDescriptor) => item.name;

    private loadNodesV2() {

        if (this.package_name) {
            if (this.node_type) {
                this.provider.getComponents(this.package_name, this.node_type,this.model_name)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(
                        components => this.handleComponents(components),
                        error => this.handleError(error)
                    );
            }
        } else {

            if(this.node_type){

                this.provider.getComponents(this.package_name,this.node_type)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(
                        components => this.handleComponents(components),
                        error => this.handleError(error)
                    );
            }

            else{
            this.provider.equalComponents$
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    components => this.handleComponents(components),
                    error => this.handleError(error)
                );
            }
        }
    }

    private handleComponents(components: any[]) {
        this.elements = [...components];
        this.filteredData = this.elements;
        this.onSearch();
        this.loading = false;

    }

    private handleError(error: any) {
        console.error('Error while loading components:', error);
        this.loading = false;
    }

    private getSortKey(component: EqualComponentDescriptor): string {
        let key = component.package_name || '';

        if (component.type === "route") {
            key += component.more + component.name;
        } else if (component.type === "class" || component.type === "menu") {
            key += component.name;
        } else {
            key = component.name;
        }
        // normalize the key
        return key.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
    }

    private sortComponents() {
        this.elements.sort((a, b) => {
            let x = this.getSortKey(a);
            let y = this.getSortKey(b);
            return x.localeCompare(y);
        });
        this.filteredData.sort((a, b) => {
            let x = this.getSortKey(a);
            let y = this.getSortKey(b);
            return x.localeCompare(y);
        });
    }


    public getComponentsTypes() {
        if (!this.node_type || this.node_type == '') {
            return Object.keys(this.type_dict);
        }
        return [this.node_type];
    }

    /**
     * This method synchronize the search input with the search select
     */
    public selectSearchScope() {
        console.log('selectSearchScope', this.search_scope);
        this.searchScopeChange.emit(this.search_scope);
        this.onSearch();
    }

    /**
     * Parse the search input and filter object to display the search result
     *
     */
    public onSearch() {
        const input = this.inputControl.value.trim();
        const tokens = input.split(" ");

        const { filters, terms } = this.extractFiltersAndTerms(tokens);

        this.search_scope = this.node_type ?? 'package';
        this.filteredData = this.elements.filter((element: EqualComponentDescriptor) => {
            if (!this.matchesFilters(element, element.name, filters, terms)) {
                return false;
            }

            return this.matchesScope(element);
        });

        this.sortComponents();
    }

    /**
     * Parses tokens to separate filters (like `package:xyz`) from regular search terms.
     *
     * @param tokens Array of search tokens split by space
     * @returns An object containing extracted filters and search terms
     */
    private extractFiltersAndTerms(tokens: string[]): { filters: { [key: string]: string }, terms: string[] } {
        const filters: { [key: string]: string } = {};
        const terms: string[] = [];

        for (const token of tokens) {
            if (token.includes(":")) {
                const [key, ...valueParts] = token.split(":");
                filters[key.toLowerCase()] = valueParts.join(":");
            } else {
                terms.push(token.toLowerCase());
            }
        }

        return { filters, terms };
    }

    /**
     * Builds a searchable descriptor string for an element based on its type.
     * This string is used to match search terms against the element.
     *
     * @param element The component descriptor to convert into a search clue
     * @returns A formatted string representing the element
     */
    private buildDescriptor(element: EqualComponentDescriptor): string {
       return element.name;
    }

    /**
     * Verifies whether an element matches the provided filters and search terms.
     *
     * @param element The element to check
     * @param descriptor The pre-built string representing the element
     * @param filters A key-value map of applied filters (e.g., package, name)
     * @param terms Additional search keywords
     * @returns True if the element matches all criteria, false otherwise
     */
    private matchesFilters(
        element: EqualComponentDescriptor,
        descriptor: string,
        filters: { [key: string]: string },
        terms: string[]
    ): boolean {
        const keyMap: { [key: string]: string } = {
            package: "package_name",
            name: "name",
            type: "type",
            model: "item.model"
            };

        for (const key of Object.keys(filters)) {
            const filterValue = filters[key].toLowerCase();
            const mappedPath = keyMap[key] ?? key;
            // if propriety exist
            const elementValue = this.getValueByPath(element, mappedPath)?.toString().toLowerCase();

            // propriety doesn't exist or is not include
            if (!elementValue || !elementValue.includes(filterValue)) {
                return false;
            }
        }

        for (const term of terms) {
            if (!descriptor.toLowerCase().includes(term)) {
                return false;
            }
        }

        return true;
    }

    private getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    /**
     * Checks if an element's type matches the current search scope.
     * This includes special handling for groupings like "controller" and "view".
     *
     * @param element The element to validate against the selected scope
     * @returns True if the element belongs to the active search scope
     */
    private matchesScope(element: EqualComponentDescriptor): boolean {
        return (
            this.search_scope === '' ||
            element.type === this.search_scope ||
            (this.search_scope === 'controller' && (element.type === 'get' || element.type === 'do')) ||
            (this.search_scope === 'view' && (element.type === 'list' || element.type === 'form'))
        );
    }




    public clearSearch() {
        this.inputControl.setValue('');
        this.onSearch();
    }

    public areNodesEqual(node1: EqualComponentDescriptor, node2: EqualComponentDescriptor) {
        // console.log('comparing', node1, node2);
        return (node1?.package_name === node2?.package_name &&
            node1?.name === node2?.name &&
            node1?.type === node2?.type);
    }

    public cloneNode(node: EqualComponentDescriptor): EqualComponentDescriptor {
        return new EqualComponentDescriptor(
            node.package_name,
            node.name,
            node.type,
            node.file,
            JSON.parse(JSON.stringify(node.item ?? {}))
        );
    }

    public oncreateNode() {
        this.dialog.open(MixedCreatorDialogComponent, {
                data: {
                    node_type: this.search_scope,
                    lock_type: (this.node_type != ''),
                    package: this.package_name,
                    lock_package: (this.package_name != ''),
                    model: this.model_name,
                    lock_model: (this.model_name != '')
                },
                width: "40em",
                height: "26em"
            }).afterClosed().subscribe((result) => {
                if (result) {
                    if (result.success) {
                        this.notificationService.showSuccess(result.message);
                        this.addToComponents(result.node);
                        this.provider.reloadComponents(result.node.package_name,result.node.type);
                        this.selectNode.emit(result.node);
                    }
                    else {
                        this.notificationService.showError(result.message);
                    }
                }
            });
    }

    private addToComponents(node: EqualComponentDescriptor) {
        this.elements.push(node);
        this.onSearch();
    }

    private removeFromComponents(node: EqualComponentDescriptor) {
        this.elements = this.elements.filter(n => n.name !== node.name || n.type !== node.type);
        this.onSearch();
    }


    /**
     * Update the editingNode and editedNode value to match the node.
     *
     * @param node name of the node which is edited
     */
    public onEditNode(node: EqualComponentDescriptor) {
        console.log('onEditNode clicked', node);
        this.editingNode = this.cloneNode(node);
        this.editedNode = this.cloneNode(node);
    }

    public onclickCancelEdit() {
        this.editingNode.name = '__invalidated';
    }


    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickSelect(node: EqualComponentDescriptor) {
        //this.router.navigate(['/package', node.name]);
        this.selectNode.emit(node);
    }

    /**
     * Notify parent component of the updating of a node.
     *
     * @param node value of the node which is updating
     */
    public onclickUpdate(node: EqualComponentDescriptor) {
        this.updateNode.emit({ old_node: node, new_node: <EqualComponentDescriptor>this.editedNode });
    }

    /**
    * Handles the deletion of a node after user confirmation.
    * If the deletion is successful, the node is permanently removed.
    * If an error occurs, the node is restored to the list.
    *
    * @param {EqualComponentDescriptor} node - The node to be deleted.
    * @returns {void}
    */
    public ondeleteNode(node: EqualComponentDescriptor): void {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent,{
            data:node
        });

        dialogRef.afterClosed().subscribe(can_be_deleted => {
            if(can_be_deleted){
                this.workbenchService.deleteNode(node).pipe(takeUntil(this.destroy$)).subscribe(
                    result => {
                        if(result.success){
                            this.removeFromComponents(node);
                            this.notificationService.showSuccess(result.message);
                            this.provider.reloadComponents(node.package_name, node.type);
                            this.onSearch();
                            this.selectNode.emit(undefined);
                        } else {
                            this.notificationService.showError(result.message);
                        }
                    }
                )
            }

        });
    }





    public getTitle(node: EqualComponentDescriptor): string {
        let splitted_name: string[];
        switch (node.type) {
            case "package":
                return "Package - packages/" + node.name;
            case "class":
                return "Model - packages/" + node.file;
            case "get":
                splitted_name = node.name.split('_')
                return "Data provider - packages/" + node.package_name + "/data/" + splitted_name.slice(1).join("/");
            case "do":
                splitted_name = node.name.split('_')
                return "Data provider - packages/" + node.package_name + "/actions/" + splitted_name.slice(1).join("/");
            case "view":
                splitted_name = node.name.split('\\')
                return "View - packages/" + node.package_name + "/views/" + splitted_name.slice(1).join("/").replace(":", ".");
            case "route":
                return "Route - packages/" + node.package_name + node.file;
            default:
                return "";
        }
    }
}
