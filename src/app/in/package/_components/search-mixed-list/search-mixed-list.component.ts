import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-search-mixed-list',
  templateUrl: './search-mixed-list.component.html',
  styleUrls: ['./search-mixed-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchMixedListComponent implements OnInit {

    @Input() data:{name:string,type:string}[];
    @Input() selected_node:{name:string,type:string};
    @Output() nodeSelect = new EventEmitter<{name:string,type:string}>();

    public inputValue: string;
    public filteredData: any;

    constructor(private dialog: MatDialog) { }

    public ngOnInit(): void {
        this.onSearch('');
    }

    public ngOnChanges() {
        this.onSearch('');
    }

    /**
     * Will update filterData with the new filter.
     *
     * @param value value of the filter
     */
    public onSearch(value: string) {
        this.filteredData = this.data.filter((node: any) => node.toLowerCase().includes(value.toLowerCase()));
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node: string){
        this.nodeSelect.emit(node);
    }
}
