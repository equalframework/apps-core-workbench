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
    @Input() allow_create?: boolean = true;
    @Input() allow_update?: boolean = true;
    @Input() allow_delete?: boolean = true;
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
    public inputControl = new FormControl('package:');

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
            // Si package_name est défini, appelez getComponents
            if (this.node_type) {
                this.provider.getComponents(this.package_name, this.node_type,this.model_name)
                    .pipe(takeUntil(this.destroy$)) // Ajout de takeUntil
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
                // Si package_name n'est pas défini et qu'il n'y a pas de note_type, utilisez equalComponents$
            this.provider.equalComponents$
                .pipe(takeUntil(this.destroy$)) // Ajout de takeUntil
                .subscribe(
                    components => this.handleComponents(components),
                    error => this.handleError(error)
                );
            }
        }
    }

    private handleComponents(components: any[]) {
        this.elements = [...components]; // Copie superficielle du tableau
        this.filteredData = this.elements;
        this.onSearch();
        this.loading = false;
    }

    private handleError(error: any) {
        console.error('Erreur lors du chargement des composants:', error);
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
        if (this.search_scope !== '' && !this.node_type) {
            this.inputControl.setValue(this.search_scope + ":" + this.search_value);
        }
        else {
            this.inputControl.setValue(this.search_value);
        }
        this.searchScopeChange.emit(this.search_scope);
        this.onSearch();
    }

    /**
     * Parse the search input and filter object to display the search result
     *
     */
    public onSearch() {
        let splitted = this.inputControl.value.split(":");
        if (splitted.length > 1) {
            this.search_scope = splitted[0];
            this.search_value = splitted.slice(1).join(":");
        }
        else {
            this.search_scope = this.node_type ?? '';
            this.search_value = splitted[0];
        }

        const arrow_split = this.search_value.split(">");
        const search_package = arrow_split.length > 1 ? arrow_split[0] : "";
        const search_args = (arrow_split.length > 1 ? arrow_split.slice(1).join("=>") : arrow_split[0]).split(" ");

        this.filteredData = this.elements.filter(
            (node: EqualComponentDescriptor) => {
                let contains = true;
                let clue: string = "";
                if (node.type === "route") {
                    clue = (node.package_name ? node.package_name : "") + "-" + (node.more ? node.more : "") + "-" + node.name;
                }
                else if (node.type === "class") {
                    clue = (node.package_name ? node.package_name : "") + "\\" + node.name;
                }
                else {
                    clue = node.name;
                }
                for (let arg of search_args) {
                    if (search_package && (((node.package_name && node.package_name !== search_package)) || (!node.package_name && node.name !== search_package))) {
                        contains = false;
                        break;
                    }
                    if (!clue.toLowerCase().includes(arg.toLowerCase())) {
                        contains = false;
                        break;
                    }
                }

                return (contains &&
                    (
                        this.search_scope === ''
                        || (node.type === '')
                        || (node.type === this.node_type)
                        || (node.type === this.search_scope)
                        || ('controller' === this.search_scope && (node.type === 'get' || node.type === 'do'))
                        || ('view' === this.search_scope && (node.type === 'list' || node.type === 'form'))
                    )
                );
            });
            this.sortComponents()
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
                return "Model - packages/" + node.package_name + "/classes/" + node.name + ".php";
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
                return "Route - packages/" + node.package_name + "/init/routes/" + node.item.file;
            default:
                return "";
        }
    }
}
