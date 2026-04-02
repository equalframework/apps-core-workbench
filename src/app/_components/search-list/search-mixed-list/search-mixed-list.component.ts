import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ItemTypes } from 'src/app/in/_models/item-types.class';

import { MixedCreatorDialogComponent } from 'src/app/_dialogs/mixed-creator-dialog/mixed-creator-dialog.component';
import { DeleteConfirmationDialogComponent } from 'src/app/_dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';

import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { buildNodeIdentifier, reducePathIteratively } from './search-mixed-list-label.util';

/**
 * This component is used to display the list of all object
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
    @ViewChildren('nodeDisplay') private nodeDisplayElements!: QueryList<ElementRef<HTMLElement>>;
    @ViewChildren('nodeName') private nodeNameElements!: QueryList<ElementRef<HTMLElement>>;

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
    @Output() searchFiltersChange = new EventEmitter<{ [key: string]: string }>();
    @Output() searchTermsChange = new EventEmitter<string[]>();

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
    public search_filters: { [key: string]: string } = {};
    public search_terms: string[] = [];
    public reducedNodeLabels: { [key: string]: string } = {};

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
        private workbenchService: WorkbenchService,
        private location: Location,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) { }


    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    public ngOnInit() {
        this.route.queryParams.subscribe(params => {
        });
        this.loading = true;
        this.loadNodes();
        this.readQueryParams();
        this.updateSearchTerms();
        this.loading = false;
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['node_selected']) {
            console.log('node_selected changed to:', changes['node_selected'].currentValue);
            setTimeout(() => this.scrollSelectedNodeIntoView(), 0);
        }
        if (changes['node_type'] && this.node_type) {
            this.search_filters = {};
            this.search_terms = [];
            this.searchScopeChange.emit(this.search_scope);
        }
        this.applyFilters();
    }

    trackByFn = (index: number, item: EqualComponentDescriptor) => item.name;


    /**
     * Reads the query parameters from the URL to initialize the search filters and terms, and sets up a subscription to update the filtered data whenever the query parameters change. This ensures that the search state is synchronized with the URL.
     */
    private readQueryParams() {
        this.route.queryParams.subscribe(params => {
            if (params['scope']) {
                this.search_scope = params['scope'];
            }
            if (params['terms']) {
                this.search_terms = params['terms'].split(' ');
            }
            Object.keys(params).forEach(key => {
                if (key.startsWith('filter_')) {
                    this.search_filters[key.replace('filter_', '')] = params[key];
                }
            });
            let filtered = this.elements.filter((element: EqualComponentDescriptor) => {
                if (!this.matchesFilters(element, element.name, this.search_filters, this.search_terms)) {
                    return false;
                }
                return this.matchesScope(element);
            });

            filtered = this.rankResults(filtered, this.search_terms);
            this.filteredData = filtered;
            this.refreshReducedNodeLabels();
            setTimeout(() => this.scrollSelectedNodeIntoView(), 0);
        });
    }

    private loadNodes() {

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
                .subscribe({
                    next: (components: EqualComponentDescriptor[]) => this.handleComponents(components),
                    error: (error: any) => this.handleError(error)
                });
            }
        }
    }

    private handleComponents(components: any[]) {
        this.elements = [...components];
        this.filteredData = this.elements;
        this.applyFilters();
        this.refreshReducedNodeLabels();
        console.log('Selected node:', this.node_selected);
        setTimeout(() => this.scrollSelectedNodeIntoView(), 0);
    }

    private handleError(error: any) {
        console.error('Error while loading components:', error);
        this.loading = false;
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
        this.searchScopeChange.emit(this.search_scope);
        this.search_filters = {};
        this.search_terms = [];        
        this.onSearch();
    }

    /**
     * Parse the search input and filter object to display the search result
     *
     */
    private applyFilters() {
        const input = this.inputControl.value.trim();
        const tokens = input.split(" ");
        ({ filters: this.search_filters, terms: this.search_terms } = this.extractFiltersAndTerms(tokens));
        let filtered = this.elements.filter((element: EqualComponentDescriptor) => {
            if (!this.matchesFilters(element, element.name, this.search_filters, this.search_terms)) {
                return false;
            }
            return this.matchesScope(element);
        });
        filtered = this.rankResults(filtered, this.search_terms);
        this.filteredData = filtered;
        this.refreshReducedNodeLabels();
        this.searchScopeChange.emit(this.search_scope);
        this.searchFiltersChange.emit(this.search_filters);
        this.searchTermsChange.emit(this.search_terms);
        setTimeout(() => this.scrollSelectedNodeIntoView(), 0);
    }

    ngAfterViewInit(): void {
        this.nodeNameElements.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.refreshReducedNodeLabels());

        fromEvent(window, 'resize')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.refreshReducedNodeLabels());

        setTimeout(() => this.refreshReducedNodeLabels(), 0);
    }

    private scrollSelectedNodeIntoView(): void {
        if (!this.node_selected || !this.filteredData?.length || !this.nodeDisplayElements) {
            return;
        }
        const selectedIndex = this.filteredData.findIndex(node => this.areNodesEqual(node, this.node_selected));
        if (selectedIndex < 0) {
            return;
        }
        const nodeElement = this.nodeDisplayElements.toArray()[selectedIndex]?.nativeElement;
        if (!nodeElement) {
            return;
        }

        nodeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    public onSearch() {
        this.applyFilters();
        this.updateUrlForSearch(this.search_filters, this.search_terms);
    }

    /**
     * Updates the search input field based on the current URL query parameters, ensuring that the search state is reflected in the input for better user experience and consistency with the URL.
     * 
     */
    private updateSearchTerms() {
        const urlParams = this.route.snapshot.queryParams;
        const input = this.urlParamsToSearchInput(urlParams).join(' ');
        this.inputControl.setValue(input);
        this.searchScopeChange.emit(this.search_scope);
        this.searchFiltersChange.emit(this.search_filters);
        this.searchTermsChange.emit(this.search_terms);
    }

    /**
     * Converts URL query parameters to a format suitable for the search input field.
     * 
     * @param params URL query parameters containing search terms and filters
     * @returns An array of strings representing the search input, including both terms and filters in "key:value" format
     */
    private urlParamsToSearchInput(params: any): string[] {
    const input: string[] = [];
    // Add terms
    if (params['terms']) {
        input.push(...params['terms'].split(' '));
    }
    // Add filters as key:value
    Object.keys(params).forEach(key => {
        if (key.startsWith('filter_')) {
            const filterKey = key.replace('filter_', '');
            input.push(`${filterKey}:${params[key]}`);
        }
    });
    return input;
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
        return [element.name, element.file].filter(Boolean).join(' ');
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
        for (const key of Object.keys(filters)) {
            const actualKey = key === 'package' ? 'package_name' : key;
            const value = this.getValueByPath(element, actualKey);
            if (typeof value === 'undefined' || value == null) return false;
            if (!String(value).toLowerCase().includes(filters[key].toLowerCase())) return false;
        }
    
        const desc = this.buildDescriptor(element).toLowerCase();
        for (const term of terms) {
            if (term && !desc.includes(term)) return false;
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

    private normalizeNodeType(type?: string): string | undefined {
        return type === 'model' ? 'class' : type;
    }

    public areNodesEqual(node1?: EqualComponentDescriptor, node2?: EqualComponentDescriptor) {
        const node1Type = this.normalizeNodeType(node1?.type);
        const node2Type = this.normalizeNodeType(node2?.type);

        return (node1?.package_name === node2?.package_name &&
            node1?.name === node2?.name &&
            node1Type === node2Type);
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
        const prefill = this.getDialogPrefillData();
        this.dialog.open(MixedCreatorDialogComponent, {
            data: {
                node_type: this.search_scope,
                lock_type: (this.node_type != ''),
                package: prefill.package,
                lock_package: (this.package_name != ''),
                model: prefill.model,
                lock_model: (this.model_name != '')
            },
            width: "40em",
            height: "26em"
        }).afterClosed().subscribe((result) => {
            if (result) {
                if (result.success) {
                    this.selectNode.emit(result.node);
                    this.addToComponents(result.node);
                    this.notificationService.showSuccess(result.message);
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
        if (this.node_selected && this.areNodesEqual(this.node_selected, node)) {
            this.node_selected = undefined;
            this.selectNode.emit(undefined);
            this.updateUrlForSelectedNode(undefined);
        } else {
        this.node_selected = node;
        this.selectNode.emit(node);
        this.updateUrlForSelectedNode(node);
        }
    }

    /**
     * Notify parent component of the updating of a node.
     *
     * @param node value of the node which is updating
     */
    public onclickUpdate(node: EqualComponentDescriptor) {
        console.log("Feature not supported yet: ", node);
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
                            this.selectNode.emit(undefined);
                            this.removeFromComponents(node);
                            this.notificationService.showSuccess(result.message);
                            this.onSearch();
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
            case "menu":
                return "Menu - packages/" + node.package_name + "/menus/" + node.name;
            default:
                return "";
        }
    }

    
    /**
     * Handles the URI path update when a node is selected, ensuring the URL reflects the current selection for better navigation and bookmarking.
     * Updates the URL without navigating to a new component.
     * 
     * @param node The node that has been selected, containing its package name, type, and name to construct the URL.
     */
    private updateUrlForSelectedNode(node: EqualComponentDescriptor | undefined) {
        let url = '';

        // Packages
        if (node && node.type === 'package') {
            url = `/package/${node.name}`;
        }
        // Models
        else if (node && node.type === 'class') {
            url = `/package/${node.package_name}/model/${node.name}`;
        }
        // Controllers (get/do)
        else if (node && (node.type === 'get' || node.type === 'do')) {
            url = `/package/${node.package_name}/controller/${node.type}/${node.name}`;
        }
        // Views
        else if (node && (node.type === 'view')) {
            const [model, rest] = node.name.split(':');
            const [type, view] = rest.split('.');
            url = `/package/${node.package_name}/view/${model}:${type}.${view}`;
        }
        // Menus
        else if (node && node.type === 'menu') {
            url = `/package/${node.package_name}/menu/${node.name}`;
        }
        // Routes
        else if (node && node.type === 'route') {
            url = `/package/${node.package_name}/route${node.name}`;
        }

        // Defaults to package view if no specific type matches
        this.location.go(url);
    }


    /** 
     * Handles the update of the URI when a filter is applied, ensuring the URL reflects the current search scope for better navigation and bookmarking.
     * 
     */
    private updateUrlForSearch(filters: { [key: string]: string }, terms: string[]) {
        const params = new URLSearchParams();
        if (this.search_scope) params.set('scope', this.search_scope);
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(`filter_${key}`, value);
        });
        if (terms.length > 0 && !(terms.length === 1 && terms[0] === '')) params.set('terms', terms.join(' '));
        const path = this.location.path().split('?')[0];
        const queryString = params.toString();

        this.location.replaceState(path, queryString);
    }

    private rankResults(elements: EqualComponentDescriptor[], terms: string[]): EqualComponentDescriptor[] {
        if (terms.length === 0) {
            terms = [''];
        }

        // If terms is only empty string, sort alphabetically
        if (terms.length === 1 && terms[0] === '') {
            return elements.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return elements.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, terms);
            const scoreB = this.calculateRelevanceScore(b, terms);
            return scoreB - scoreA;
        });
    }

    public getNodeDisplayLabel(node: EqualComponentDescriptor, index: number): string {
        const key = this.getNodeKey(node);
        const existing = this.reducedNodeLabels[key];
        if (existing) {
            return existing;
        }

        const hostElement = this.nodeNameElements?.toArray?.()[index]?.nativeElement;
        const reduced = reducePathIteratively(buildNodeIdentifier(node), hostElement, node.name);
        this.reducedNodeLabels[key] = reduced;
        return reduced;
    }

    private refreshReducedNodeLabels(): void {
        if (!this.filteredData?.length) {
            this.reducedNodeLabels = {};
            return;
        }

        const nextLabels: { [key: string]: string } = {};
        const nameElements = this.nodeNameElements?.toArray?.() ?? [];

        this.filteredData.forEach((node, index) => {
            const hostElement = nameElements[index]?.nativeElement;
            nextLabels[this.getNodeKey(node)] = reducePathIteratively(buildNodeIdentifier(node), hostElement, node.name);
        });

        this.reducedNodeLabels = nextLabels;
    }

    private getNodeKey(node: EqualComponentDescriptor): string {
        return `${node.package_name || ''}|${node.type || ''}|${node.name || ''}`;
    }

    private calculateRelevanceScore(element: EqualComponentDescriptor, terms: string[]): number {
        let score = 0;
        const name = element.name.toLowerCase();
        const desc = (element.item?.description || '').toLowerCase();

        for (const term of terms) {
            // Exact name match (highest priority)
            if (name === term) score += 100;
            // Name starts with term
            else if (name.startsWith(term)) score += 50;
            // Name contains term
            else if (name.includes(term)) score += 25;
            // Description contains term
            else if (desc.includes(term)) score += 10;
        }
        
        return score;
    }

    private getDialogPrefillData() {
        const params = this.route.snapshot.queryParams;
        return {
            package: params['filter_package_name'] || this.package_name,
            model: params['filter_model_name'] || this.model_name,
            // Add more fields as needed
        };
    }

    /**
     * Highlights search terms in the given text by wrapping them in a <span class="highlight-term"> tag.
     * This enables visual feedback when searching for nodes.
     *
     * @param text The text to highlight
     * @param terms The search terms to highlight
     * @returns SafeHtml containing the highlighted text
     */
    public getHighlightedName(text: string, terms: string[]): SafeHtml {
        if (!text || !terms || terms.length === 0) {
            return this.sanitizer.sanitize(1, text) || '';
        }
        
        let highlighted = text;
        for (const term of terms) {
            if (term && term.length > 0) {
                const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
                highlighted = highlighted.replace(regex, '<span class="highlight-term">$1</span>');
            }
        }
        
        return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }

    /**
     * Escapes special regex characters in a string to prevent regex errors.
     *
     * @param str The string to escape
     * @returns The escaped string safe for use in a regex
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
