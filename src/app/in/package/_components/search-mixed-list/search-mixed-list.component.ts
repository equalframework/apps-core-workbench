import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EnvService } from 'sb-shared-lib';

@Component({
  selector: 'app-search-mixed-list',
  templateUrl: './search-mixed-list.component.html',
  styleUrls: ['./search-mixed-list.component.scss'],
  encapsulation : ViewEncapsulation.Emulated
})
export class SearchMixedListComponent implements OnInit {
 
    @Input() data:{package?:string,name:string,type:string}[];
    @Input() selected_node:{name:string,type:string};
    @Input() loading:boolean
    @Output() nodeSelect = new EventEmitter<{package?:string,name:string,type:string}>();

    public obk = Object.keys
    public inputValue: string;
    public filteredData: {package?:string,name:string,type:string}[];
    public search_value:string = ""
    public search_scope:string = ""
    public current_root:string = "";

    public type_dict:{[id:string]:{icon:string,disp:string}} = {
        "" : {icon:"category",disp:"all"},
        "class" : {icon:"data_object",disp:"model"},
        "package" : {icon:"inventory",disp:"package"},
        "controller" : {icon:"code",disp:"controller"},
        "get" : {icon:"data_array",disp:"controller-data"},
        "route" : {icon:"route",disp:"route"},
        "do" : {icon:"open_in_browser",disp:"controller-action"},
    }


    public inputcontrol = new FormControl('')

    constructor(
        private dialog: MatDialog,
        private env: EnvService
    ) { 
        
    }

    public async ngOnInit() {
        this.current_root = (await this.env.getEnv())['backend_url']
        this.onSearch();
    }

    public async ngOnChanges() {
        this.onSearch();
    }

    public onSelectChange() {
        if(this.search_scope !== "")
            this.inputcontrol.setValue(this.search_scope+":"+this.search_value)
        else 
            this.inputcontrol.setValue(this.search_value)
        this.onSearch()
    }       

    /**
     * Will update filterData with the new filter.
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
                (node.package ? node.package+"\\"+node.name : node.name).toLowerCase().includes(this.search_value.toLowerCase())
                && (this.search_scope === ""
                    || (node.type === this.search_scope)
                    || ("controller" === this.search_scope && (
                        node.type === 'get' || node.type === 'do'
                    ))
                )
        );
        this.search_scope+":"+this.search_value
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
