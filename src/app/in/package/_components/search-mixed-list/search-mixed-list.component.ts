import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-search-mixed-list',
  templateUrl: './search-mixed-list.component.html',
  styleUrls: ['./search-mixed-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchMixedListComponent implements OnInit {

    @Input() data:{package?:string,name:string,type:string}[];
    @Input() selected_node:{name:string,type:string};
    @Output() nodeSelect = new EventEmitter<{package?:string,name:string,type:string}>();

    public inputValue: string;
    public filteredData: {package?:string,name:string,type:string}[];
    public search_value:string = ""
    public search_scope:string = ""

    public icon_dict:{[id:string]:string} = {
        "get" : "data_array",
        "do" : "open_in_browser",
        "controller" : "code",
        "class" : "data_object",
        "package" : "inventory",
        "" : "category"
    }

    public disp_dict:{[id:string]:string} = {
        "get" : "controller-data",
        "do" : "contrller-action",
        "controller" : "controller",
        "class" : "model",
        "package" : "package",
        "" : "all"
    }


    public inputcontrol = new FormControl('')

    constructor(private dialog: MatDialog) { 
        
    }

    public ngOnInit(): void {
        this.onSearch();
    }

    public async ngOnChanges() {
        setTimeout(() => {
            this.onSearch();
        }, 500);
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
