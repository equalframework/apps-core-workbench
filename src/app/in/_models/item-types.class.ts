export class ItemTypes {

    static types: { [id: string]: { icon: string, disp: string, truetype: boolean, showInFilter: boolean } } = {
        '':          { icon: "category", disp: "All", truetype: false, showInFilter: true },
        'package':   { icon: "inventory", disp: "Packages", truetype: true, showInFilter: true },
        'class':     { icon: "data_object", disp: "Models", truetype: true, showInFilter: true },
        'controller':{ icon: "code", disp: "Controllers", truetype: false, showInFilter: true },
        'route':     { icon: "route", disp: "Routes", truetype: true, showInFilter: true },
        'view':      { icon: "view_quilt", disp: "Views", truetype: true, showInFilter: true },
        'menu':      { icon: "menu_open", disp: "App Menu", truetype: true, showInFilter: true },
        'get':       { icon: "data_array", disp: "Data providers", truetype: true, showInFilter: true },
        'do':        { icon: "open_in_browser", disp: "Action handlers", truetype: true, showInFilter: true },
        'policy':    { icon: "policy", disp: "Policies", truetype: true, showInFilter: false },
    };


    public static get typeDict(): { [id: string]: { icon: string, disp: string } } {
        let result: { [id: string]: { icon: string, disp: string } } = {};

        for (let key in ItemTypes.types) {
          if (ItemTypes.types[key].showInFilter === true) {
            result[key] = {
              icon: ItemTypes.types[key].icon,
              disp: ItemTypes.types[key].disp,
            };
          }
        }

        return result;
      }


    public static get trueTypeDict (): {[id:string]:{icon:string, disp:string}}  {
        let result:{[id:string]:{icon:string,disp:string}} = {}
        for(let key in ItemTypes.types) {
            if(ItemTypes.types[key].truetype) {
                result[key] = {
                        icon:ItemTypes.types[key].icon,
                        disp:ItemTypes.types[key].disp
                    };
            }
        }
        return result;
    }

    public static getIconForType(type:string):string {
        return this.types[type] ? this.types[type].icon : "";
    }
}