export interface ViewSchemaBase {
    name: string;
    description?: string;
  }

  // --- Simple Layout ---
  export interface SimpleLayoutItem {
    type: string;
    value: string;
    width: string;
  }

  export interface SimpleLayout extends ViewSchemaBase {
    layout: {
      items: SimpleLayoutItem[];
    };
  }

  // --- Dataset Layout ---
  export interface Dataset {
    label: string;
    operation: string;
  }

  export interface DatasetLayout extends ViewSchemaBase {
    layout: {
      entity?: string;
      group_by?: string;
      datasets: Dataset[];
    };
  }

  // --- Grouped Layout ---
  export interface GroupedLayoutItem {
    type: string;
    label?: string;
    value: string;
    width: string;
    widget?: {
      heading?: boolean;
    };
  }

  export interface GroupedLayoutColumn {
    width: string;
    items: GroupedLayoutItem[];
  }

  export interface GroupedLayoutRow {
    columns: GroupedLayoutColumn[];
  }

  export interface GroupedLayoutSection {
    id?: string;
    label?: string;
    rows: GroupedLayoutRow[];
  }

  export interface GroupedLayoutGroup {
    sections: GroupedLayoutSection[];
  }

  export interface GroupedLayout extends ViewSchemaBase {
    layout: {
      groups: GroupedLayoutGroup[];
    };
  }

  export type ViewSchema = GroupedLayout | SimpleLayout;
