import { GroupedLayout, ViewSchema } from '../../in/_models/view-schema.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hierarchical-overview',
  templateUrl: './hierarchical-overview.component.html',
  styleUrls: ['./hierarchical-overview.component.scss']
})
export class HierarchicalOverviewComponent implements OnInit {
getTotalRows() {
return this.viewSchema?.layout?.groups[0]?.sections[0]?.rows?.length ?? 0;
}

    @Input() viewSchema:GroupedLayout;


  constructor() { }

  ngOnInit(): void {
    console.log("viewSchema ", this.viewSchema)
  }
  getTotalSections(): number {
    return this.viewSchema?.layout?.groups?.reduce((acc, group) => acc + (group.sections?.length || 0), 0) || 0;
  }
  getTotalItemsPerSection(): number {
    let total = 0;
    this.viewSchema?.layout?.groups?.forEach(group => {
      group.sections?.forEach(section => {
        section.rows?.forEach(row => {
          row.columns?.forEach(column => {
            total += column.items?.length || 0;
          });
        });
      });
    });
    return total;
  }

  getTotalItemsForSection(section: any): number {
    return section.rows?.reduce((total: any, row: { columns: any[]; }) => {
      return total + row.columns?.reduce((s: any, column: { items: string | any[]; }) => s + (column.items?.length || 0), 0);
    }, 0) || 0;
  }



}
