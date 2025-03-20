import { Component, Input, OnInit } from '@angular/core';
import { GroupedLayout, ViewSchema, SimpleLayout } from '../../in/_models/view-schema.model';

@Component({
  selector: 'hierarchical-overview',
  templateUrl: './hierarchical-overview.component.html',
  styleUrls: ['./hierarchical-overview.component.scss']
})
export class HierarchicalOverviewComponent implements OnInit {

  @Input() viewSchema: ViewSchema;

  constructor() { }

  ngOnInit(): void {
    console.log("viewSchema", this.viewSchema);
  }

  // Type guard pour vérifier si c'est un GroupedLayout
  private isGroupedLayout(viewSchema: ViewSchema): viewSchema is GroupedLayout {
    return (viewSchema as GroupedLayout).layout?.groups !== undefined;
  }

  // Fonction pour obtenir le type du layout
  getLayoutType(viewSchema: ViewSchema): 'GroupedLayout' | 'SimpleLayout' {
    return this.isGroupedLayout(viewSchema) ? 'GroupedLayout' : 'SimpleLayout';
  }

  get groupedLayout(): GroupedLayout | null {
    return this.isGroupedLayout(this.viewSchema) ? this.viewSchema : null;
  }

  get simpleLayout(): SimpleLayout | null {
    return !this.isGroupedLayout(this.viewSchema) ? this.viewSchema : null;
  }

  getTotalSections(): number {
    return this.groupedLayout?.layout?.groups?.reduce((acc, group) => acc + (group.sections?.length || 0), 0) || 0;
  }

  getSectionItems(section: any): any[] {
    return section.rows
      ?.flatMap((row: { columns: any; }) => row.columns || [])
      .flatMap((column: { items: any; }) => column.items || []) || [];
  }



}
