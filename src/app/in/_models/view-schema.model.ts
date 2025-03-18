export interface ViewSchemaBase {
    name: string;
    description?: string;
  }

  export interface SimpleLayout extends ViewSchemaBase {
    layout: {
      items: {
        type: string;
        value: string;
        width: string;
      }[];
    };
  }

  export interface DatasetLayout extends ViewSchemaBase {
    layout: {
      entity?: string;
      group_by?: string;
      datasets: {
        label: string;
        operation: string;
      }[];
    };
  }

  export interface GroupedLayout extends ViewSchemaBase {
    layout: {
      groups: {
        sections: {
            id?:string ,
            label?:string ,
          rows: {
            columns: {
              width: string;
              items: {
                type: string;
                label?: string;
                value: string;
                width: string;
                widget?: {
                  heading?: boolean;
                };
              }[];
            }[];
          }[];
        }[];
      }[];
    };
  }

  export type ViewSchema = SimpleLayout | DatasetLayout | GroupedLayout;
