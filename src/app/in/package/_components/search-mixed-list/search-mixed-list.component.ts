import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EnvService } from 'sb-shared-lib';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ItemTypes } from '../../_constants/ItemTypes';
import { MixedCreatorComponent } from '../mixed-creator/mixed-creator.component';
import { DeleteConfirmationComponent } from 'src/app/in/delete-confirmation/delete-confirmation.component';

/**
 * This component is used to display the list of all object you recover in package.component.ts
 *
 * If you need to add a new type, you just have to add it in type_dict and create the css rules for the icon in search-mixed-list.component.scss
 * You can also describe the spelling rule of the name in search-mixed-list.component.html
*/
@Component({
    selector: 'app-search-mixed-list',
    templateUrl: './search-mixed-list.component.html',
    styleUrls: ['./search-mixed-list.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class SearchMixedListComponent implements OnInit {


    @Input() data: { package?: string, name: string, type: string, more?: any }[]; // The array of object to display
    @Input() selected_node: { name: string, type: string }; // The selected object of the list
    @Input() loading: boolean; // Notify if the parent node finished loading
    @Output() nodeSelect = new EventEmitter<{ package?: string, name: string, type: string, more?: any }>();  // Used to send selected object reference to parent
    @Output() refresh = new EventEmitter<void>();
    @Output() delete = new EventEmitter<{ package?: string, name: string, type: string, more?: any }>();

    public obk = Object.keys;   // Object.keys method for utilisation in search-mixed-list.component.html
    public filteredData: { package?: string, name: string, type: string, more?: any }[];   // filtered derivative of data with purpose to be displayed
    public search_value: string = "";    // value part of the search bar field ( is parsed in onSearch() method )
    public search_scope: string = "";    // type part of the search bar field ( is parsed in onSearch() method )
    public current_root: string = "";    // root url of the backend ( parsed in ngOnInit() method )

    /**
     * This dict is used to display properly all the different types of object contained in filteredData ( or data )
     */
    public type_dict: { [id: string]: { icon: string, disp: string } } = ItemTypes.typeDict

    public inputControl = new FormControl('') // formcontrol for search input field

    constructor(
        private dialog: MatDialog, // could be useful later
        private env: EnvService, // used to parse the backend url
        private router: RouterMemory
    ) {

    }

    public async ngOnInit() {
        this.current_root = (await this.env.getEnv())['backend_url']
        let arg = this.router.retrieveArgs()
        if (arg && arg['searchvalue']) {
            this.inputControl.setValue(arg['searchvalue'])
        } else {
            this.inputControl.setValue("package:")
        }
        this.onSearch();
    }

    public async ngOnChanges() {
        this.onSearch(false);
    }

    /**
     * This method synchronise the search input with the search select
     */
    public onSelectChange() {
        if (this.search_scope !== "")
            this.inputControl.setValue(this.search_scope + ":" + this.search_value)
        else
            this.inputControl.setValue(this.search_value)
        this.onSearch()
    }

    /**
     * Parse the search input and filter object to display the search result
     *
     * @param value value of the filter
     */
    public onSearch(updaterouter: boolean = true) {
        if (updaterouter) this.router.updateArg('searchvalue', this.inputControl.value)
        let splitted = this.inputControl.value.split(":")
        if (splitted.length > 1) {
            this.search_scope = splitted[0]
            this.search_value = splitted.slice(1).join(":")
        }
        else {
            this.search_scope = ""
            this.search_value = splitted[0]
        }
        if (this.search_scope !== this.actual_scope) {
            this.search_value = this.search_scope + ":" + this.search_value
            this.search_scope = this.actual_scope
        }

        let arrow_split = this.search_value.split(">")
        let search_package = arrow_split.length > 1 ? arrow_split[0] : ""
        let search_args = (arrow_split.length > 1 ? arrow_split.slice(1).join("=>") : arrow_split[0]).split(" ")

        console.log(search_args)

        this.filteredData = this.data.filter(
            (node:any) => {
                let contains = true
                let naming: string = ""
                if(node.type === "route") naming = (node.package ? node.package : "") + "-" + (node.more ? node.more : "") + "-" + node.name
                else if(node.type === "class") naming = (node.package ? node.package : "") + "\\" + node.name
                else naming = node.name
                for (let arg of search_args) {
                    if(search_package && (((node.package && node.package !== search_package)) || (!node.package && node.name !==search_package))){
                        contains = false
                        break
                    }
                    if (!naming.toLowerCase().includes(arg.toLowerCase()))  {
                        contains = false
                        break
                    }
                        
                }

                return contains && (this.search_scope === ""
                    || (node.type === this.search_scope)
                    || ("controller" === this.search_scope && (node.type === 'get' || node.type === 'do'))
                    || ("view" === this.search_scope && (node.type === 'list' || node.type === 'form'))
                )
            }
        );
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node: { package?: string, name: string, type: string, more?: any }) {
        this.nodeSelect.emit(node);
    }

    clearSearch() {
        this.inputControl.setValue('')
        this.onSearch()
    }

    get actual_scope() {
        return this.type_dict[this.search_scope] ? this.search_scope : ""
    }

    openCreator() {
        let d = this.dialog.open(MixedCreatorComponent, { data: { type: this.search_scope }, width: "40em", height: "26em" })

        d.afterClosed().subscribe(() => {
            // Do stuff after the dialog has closed
            this.refresh.emit()
            this.onSearch()
        });


    }

    clickDelete(node: { package?: string, name: string, type: string, more?: any }) {
        const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
            data: node.name,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.delete.emit(node);
            }
        });
    }

    get_node_title(node: { package?: string, name: string, type: string, more?: any }): string {
        let splitted_name: string[]
        switch (node.type) {
            case "package":
                return "Package - packages/" + node.name
            case "class":
                return "Model - packages/" + node.package + "/classes/" + node.name.replaceAll("\\", "/") + ".php"
            case "get":
                splitted_name = node.name.split('_')
                return "Data provider - packages/" + node.package + "/data/" + splitted_name.slice(1).join("/")
            case "do":
                splitted_name = node.name.split('_')
                return "Data provider - packages/" + node.package + "/actions/" + splitted_name.slice(1).join("/")
            case "view":
                splitted_name = node.name.split('\\')
                return "View - packages/" + node.package + "/views/" + splitted_name.slice(1).join("/").replace(":", ".")
            case "route":
                return "Route - packages/" + node.package + "/init/routes/" + node.more
            default:
                return ""
        }
    }
}