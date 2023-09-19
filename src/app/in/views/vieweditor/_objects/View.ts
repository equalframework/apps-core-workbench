abstract class ViewElement {

    constructor() {}

    getListDisplay():string {
        return ""
    }

    isValid():boolean {
        return false
    }
}

class View extends ViewElement{
    public layout:ViewLayout = new ViewLayout()
    public name:string = ""
    public description:string = ""
    public type:string = ""
    public domain:ViewDomain = new ViewDomain()
    public filters:ViewFilter[] = []
    constructor(scheme:any={}) {
        super()
        if(scheme['name']) this.name = scheme['name']
        if(scheme['description']) this.description = scheme['description']
        if(scheme['domain']) this.domain = new ViewDomain(scheme['domain'])
        if(scheme['filters']){
            for(let v of scheme['filters']){
                this.filters.push(new ViewFilter(v))
            }
        }
        if(scheme['layout']) this.layout = new ViewLayout(scheme['layout'])
    }

    override getListDisplay(): string {
        return this.name
    }
}

class ViewLayout extends ViewElement {
    public groups:ViewGroup[]|undefined
    public items:ViewItem[]|undefined

    constructor(scheme:any={}) {
        super()
        if(scheme["items"]){
            this.items = []
            for(let v of scheme["items"]){
                this.items.push(new ViewItem(v))
            }
        }
        if(scheme["groups"]){
            this.groups = []
            for(let v of scheme["groups"]){
                this.groups.push(new ViewGroup(v))
            }
        }
    }

    override getListDisplay(): string {
        return "Layout"
    }
}

class ViewGroup extends ViewElement {
    public sections:ViewSection[] = []

    constructor(scheme:any={}) {
        super()
        if(scheme['sections']) {
            for(let v of scheme["sections"]){
                this.sections.push(new ViewSection(v))
            }
        }
    }

    override getListDisplay(): string {
        return "Group"
    }
}

class ViewSection extends ViewElement {
    public label:string|undefined
    public id:string = ""
    public rows:ViewRow[] = []

    constructor(scheme:any={}) {
        super()
        if(scheme['label']) this.label = scheme.label
        if(scheme['id']) this.id = scheme['id']
        if(scheme['rows']) {
            for(let v of scheme["rows"]){
                this.rows.push(new ViewRow(v))
            }
        }
    }

    override getListDisplay(): string {
        return this.label ? this.label : this.id
    }
}

class ViewRow extends ViewElement {
    public columns:ViewColumn[] = []
    public height:number = 100

    constructor(scheme:any={}) {
        super()
        if(scheme['height']) this.height = scheme['height']
        if(scheme['columns']){
            for(let v of scheme["columns"]){
                this.columns.push(new ViewColumn(v))
            }
        }
    }

    override getListDisplay(): string {
        return "Row"
    }
}

class ViewColumn extends ViewElement {
    public width:number = 1000
    public items:ViewItem[] = []

    constructor(scheme:any={}) {
        super()
        if(scheme['width']) this.width = scheme['width']
        if(scheme['items']) {
            for(let v of scheme["items"]){
                this.items.push(new ViewItem(v))
            }
        }
    }

    override getListDisplay(): string {
        return "Column"
    }
}

class ViewItem extends ViewElement {
    public type:string = ""
    public value:string = ""
    public width:number = 100
    public sortable:boolean = false
    public readonly:boolean = false
    public visible:ViewDomain = new ViewDomain()
    public widget:ViewWidget = new ViewWidget()

    constructor(scheme:any={}) {
        super()
        if(scheme['type']) this.type = scheme['type']
        if(scheme['value']) this.value = scheme['value']
        if(scheme['width']) this.width = scheme['width']
        if(scheme['sortable']) this.sortable = scheme['sortable']
        if(scheme['readonly']) this.readonly = scheme['readonly']
        if(scheme['visible']) this.visible = new ViewDomain(scheme['visible'])
        if(scheme['widget']) this.widget = new ViewWidget(scheme['widget'])
    }
}

class ViewWidget {
    public link:boolean = false
    public heading:boolean = false
    public type:string|undefined
    public values:string[]|undefined

    constructor(scheme:any={}) {
        if(scheme['link']) this.link = scheme['link']
        if(scheme['heading']) this.heading = scheme['heading']
        if(scheme['type']) this.type = scheme['type']
        if(scheme['values']) this.values = scheme['values']
    }
}

class ViewDomain {
    public dom:any = {}

    constructor(scheme:any={}) {
        this.dom = scheme
    }
}

class ViewFilter {
    public id:string
    public label:string
    public description:string
    public clause:ViewClause

    constructor(scheme:any={}) {
        if(scheme['id']) this.id = scheme['id']
        if(scheme['label']) this.label = scheme['label']
        if(scheme['description']) this.description = scheme['description']
        if(scheme['clause']) this.clause = new ViewClause(scheme['clause'])
    }
}

class ViewClause {
    public arr:string[] = []

    constructor(scheme:any={}) {
        this.arr = scheme
    }
}

export {
    View,
    ViewClause,
    ViewColumn,
    ViewFilter,
    ViewDomain,
    ViewLayout,
    ViewSection,
    ViewRow,
    ViewItem,
    ViewElement,
    ViewGroup,
    ViewWidget
}