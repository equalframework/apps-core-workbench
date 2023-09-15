import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EnvService } from 'sb-shared-lib';

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
  encapsulation : ViewEncapsulation.Emulated
})
export class SearchMixedListComponent implements OnInit {

    
    @Input() data:{package?:string,name:string,type:string}[]; // The array of object to display
    @Input() selected_node:{name:string,type:string}; // The selected object of the list
    @Input() loading:boolean; // Notify if the parent node finished loading
    @Output() nodeSelect = new EventEmitter<{package?:string,name:string,type:string}>();  // Used to send selected object reference to parent

    public obk = Object.keys;   // Object.keys method for utilisation in search-mixed-list.component.html
    public filteredData: {package?:string,name:string,type:string}[];   // filtered derivative of data with purpose to be displayed
    public search_value:string = "";    // value part of the search bar field ( is parsed in onSearch() method )
    public search_scope:string = "";    // type part of the search bar field ( is parsed in onSearch() method )
    public current_root:string = "";    // root url of the backend ( parsed in ngOnInit() method )

    /**
     * This dict is used to display properly all the different types of object contained in filteredData ( or data )
     */
    public type_dict:{[id:string]:{icon:string,disp:string}} = {
        "" : {icon:"category",disp:"all"},
        "class" : {icon:"data_object",disp:"model"},
        "package" : {icon:"inventory",disp:"package"},
        "controller" : {icon:"code",disp:"controller"},
        "route" : {icon:"route",disp:"route"},
        "get" : {icon:"data_array",disp:"controller-data"},
        "do" : {icon:"open_in_browser",disp:"controller-action"},
    }

    public inputcontrol = new FormControl('') // formcontrol for search input field

    constructor(
        private dialog: MatDialog, // could be useful later
        private env: EnvService // used to parse the backend url
    ) { 
        
    }

    public async ngOnInit() {
        this.current_root = (await this.env.getEnv())['backend_url']
        this.onSearch();
    }

    public async ngOnChanges() {
        this.onSearch();
    }

    /**
     * This method synchronise the search input with the search select
     */
    public onSelectChange() {
        if(this.search_scope !== "")
            this.inputcontrol.setValue(this.search_scope+":"+this.search_value)
        else 
            this.inputcontrol.setValue(this.search_value)
        this.onSearch()
    }       

    /**
     * Parse the search input and filter object to display the search result
     *
     * @param value value of the filter
     */
    public onSearch() {
        let splitted = this.inputcontrol.value.split(":")
        console.log(splitted)
        if(splitted.length > 1) {
            this.search_scope = splitted[0]
            this.search_value = splitted[1]
        }
        else {
            this.search_scope = ""
            this.search_value = splitted[0]
        }
        this.filteredData = this.data.filter(
            node => 
                // checking value part
                (node.package ? node.package+"\\"+node.name : node.name).toLowerCase().includes(this.search_value.toLowerCase())
                // checking types part
                && (this.search_scope === ""
                    || (node.type === this.search_scope)
                    || ("controller" === this.search_scope && (
                        node.type === 'get' || node.type === 'do'
                    ))
                )
        );
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node:{package?:string,name:string,type:string}){
        this.nodeSelect.emit(node);
    }
}
