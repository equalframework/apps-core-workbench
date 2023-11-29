import { result } from "lodash"

export class MenuElement {
    leftover:any = {}

    constructor() {}
    export() {
        let result:any = {}
        for(let key in this.leftover) {
            if(this.leftover[key]) result[key] = this.leftover[key]
        }
        return result
    }
}

export class Menu extends MenuElement {
    public name:string = ""
    public access:any = {"groups": ["users"]}
    public layout:MenuLayout = new MenuLayout()

    constructor(schema:any = {}) {
        super()

        if(schema.name) {
            this.name = schema.name
            delete schema.name
        }
        if(schema.access) {
            this.access = schema.access
            delete schema.access
        }
        if(schema.layout) {
            this.layout = new MenuLayout(schema.layout)
            delete schema.layout
        }
        this.leftover = schema
    }

    override export() {
        let result = super.export()

        if(this.name) result.name = this.name
        if(this.access) result.access = this.access
        if(this.layout) result.layout = this.layout.export()
        return result
    }
}

export class MenuLayout extends MenuElement {
    public items:MenuItem[] = []

    constructor(schema:any = {}) {
        super()

        if(schema.items) {
            for(let item of schema.items) {
                this.items.push(new MenuItem(item))
            }
            delete schema.item
        }

        this.leftover = schema.item
    }

    override export() {
        let result = super.export()

        if(this.items.length > 0) {
            result.items = []
            for(let item of this.items) {
                result.items.push(item.export())
            }
        }
        return result
    }
}

export class MenuItem extends MenuElement {
    public id:string = ''
    public label:string = ''
    public icon:string = ''
    public type:string = 'entry'
    public route:string = ''

    public description:string = ''
    children:MenuItem[] = []
    context:MenuContext = new MenuContext()

    public static incrementer:number = 0
    public static get availableTypes() { return ['parent','entry'] }

    constructor(schema:any = {}) {
        super()

        if(schema.id) {this.id = schema.id;delete schema.id}
        if(schema.label) {this.label = schema.label;delete schema.label}
        if(schema.icon) {this.icon = schema.icon;delete schema.icon}
        if(schema.type) {this.type = schema.type;delete schema.type}
        if(schema.description) {this.description = schema.description;delete schema.description}
        if(schema.route) {this.route = schema.route;delete schema.route}

        if(schema.children) {
            for(let child of schema.children) this.children.push(new MenuItem(child))
            delete schema.children
        }
        if(schema.context) {this.context = new MenuContext(schema.context);delete schema.context}
        this.leftover = schema
    }

    override export() {
        let result = super.export()

        if(this.id) result.id = this.id
        if(this.type) result.type = this.type
        if(this.label) result.label = this.label
        if(this.icon) result.icon = this.icon
        if(this.description) result.description = this.description
        if(this.route) result.route = this.route
        if(this.context) result.context = this.context.export()
        if(this.children) {
            result.children = this.children.map(child => child.export())
        }
        
        

        return result
    }
}

export class MenuContext extends MenuElement {
    public entity:string = ''
    public view:string = ''
    public domain:any = []
    public sort:'asc'|'desc' = 'asc'
    public order:string = ''
    public purpose:string=''
    public display_mode:string = ''

    static get PossiblePurpose():string[] {
        return [
            '',
            'view',
            'create',
            'update',
            'select',
            'add'
        ]
    }

    static get PossibleDisplayMode():string[] {
        return [
            '',
            'stacked',
            'popup'
        ]
    }

    public _has_domain:boolean = false
    public _has_sort:boolean = false
    public _has_order:boolean = false

    constructor(schema:any = {}) {
        super()

        if(schema.entity) {this.entity = schema.entity;delete schema.description}
        if(schema.view) {this.view = schema.view;delete schema.description}
        if(schema.domain) {this._has_domain = true;this.domain = schema.domain;delete schema.domain}
        if(schema.sort) {this._has_sort = true;this.sort = schema.sort;delete schema.sort}
        if(schema.order) {this._has_order = true;this.order = schema.order;delete schema.order}
        if(schema.purpose) {this.purpose = schema.purpose;delete schema.purpose}
        if(schema.display_mode) {this.display_mode = schema.display_mode;delete schema.display_mode}
    }  

    override export() {
        let result = super.export()

        if(this.entity) result.entity = this.entity
        if(this.view) result.view = this.view
        if(this.domain && this._has_domain) result.domain = this.domain
        if(this.sort && this._has_sort) result.sort = this.sort
        if(this.order && this._has_order) result.order = this.order
        if(this.purpose) result.purpose = this.purpose
        if(this.display_mode) result.display_mode = this.display_mode

        return result
    }
}
