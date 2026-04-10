
export class MenuElement {
    public leftover: any = {};

    constructor() {}

    public export(): any {
        const result: any = {};
        for (const key in this.leftover) {
            if (this.leftover[key]) { result[key] = this.leftover[key]; }
        }
        return result;
    }

    public idCompliancy(idList: string[]): {ok: boolean, idList: string[]} {
        return {ok : true, idList : idList};
    }
}

export class Menu extends MenuElement {
    public name = '';
    public access: any = {'groups': ['users']};
    public layout: MenuLayout = new MenuLayout();

    constructor(schema: any = {}) {
        super();

        if (schema.name) {
            this.name = schema.name;
            delete schema.name;
        }
        if (schema.access) {
            this.access = schema.access;
            delete schema.access;
        }
        if (schema.layout) {
            this.layout = new MenuLayout(schema.layout);
            delete schema.layout;
        }
        this.leftover = schema;
    }

    override export(): any {
        const result = super.export();

        if (this.name) {
            result.name = this.name;
        }
        if (this.access) {
            result.access = this.access;
        }
        if (this.layout){
            result.layout = this.layout.export();
        }
        return result;
    }

    override idCompliancy(idList: string[]): { ok: boolean; idList: string[]; } {
        const res = super.idCompliancy([]);
        return this.layout.idCompliancy(res.idList);
    }
}

export class MenuLayout extends MenuElement {
    public items: MenuItem[] = [];

    constructor(schema: any = {}) {
        super();

        if (schema.items) {
            for (const item of schema.items) {
                this.items.push(new MenuItem(item));
            }
            delete schema.item;
        }

        this.leftover = schema.item;
    }

    override export(): any {
        const result = super.export();

        if (this.items.length > 0) {
            result.items = [];
            for (const item of this.items) {
                result.items.push(item.export());
            }
        }
        return result;
    }

    override idCompliancy(idList: string[]): { ok: boolean; idList: string[]; } {
        let res = super.idCompliancy([]);

        for (const item of this.items) {
            res = item.idCompliancy(res.idList);
            if (!res.ok) {
                return res;
            }
        }
        return res;
    }
}

export class MenuItem extends MenuElement {
    public id = '';
    public label = '';
    public icon = '';
    public type = 'entry';
    public route = '';

    public description = '';
    children: MenuItem[] = [];
    context: MenuContext = new MenuContext();

    public static menuItemCount = 0;
    public static get availableTypes(): string[] {
        return ['parent', 'entry'];
    }

    constructor(schema: any = {}) {
        super();

        if (schema.id) {
            this.id = schema.id;
            delete schema.id;
        }
        if (schema.label) {
            this.label = schema.label;
            delete schema.label;
        }
        if (schema.icon) {
            this.icon = schema.icon;
            delete schema.icon;
        }
        if (schema.type) {
            this.type = schema.type;
            delete schema.type;
        }
        if (schema.description) {
            this.description = schema.description;
            delete schema.description;
        }
        if (schema.route) {
            this.route = schema.route;
            delete schema.route;
        }

        if (schema.children) {
            for (const child of schema.children) {
                this.children.push(new MenuItem(child));
            }
            delete schema.children;
        }
        if (schema.context) {
            this.context = new MenuContext(schema.context);
            delete schema.context;
        }
        this.leftover = schema;
    }

    override export(): any {
        const result = super.export();

        if (this.id) {
            result.id = this.id;
        }
        if (this.type) {
            result.type = this.type;
        }
        if (this.label) {
            result.label = this.label;
        }
        if (this.icon) {
            result.icon = this.icon;
        }
        if (this.description) {
            result.description = this.description;
        }
        if (this.route) {
            result.route = this.route;
        }
        if (this.context) {
            result.context = this.context.export();
        }
        if (this.children) {
            result.children = this.children.map(child => child.export());
        }
        return result;
    }


    override idCompliancy(idList: string[]): { ok: boolean; idList: string[]; } {
        let res = super.idCompliancy(idList);
        if (res.idList.includes(this.id)) {
            return {ok : false, idList : [...res.idList, this.id]};
        }
        else {
            res.idList.push(this.id);
            for (const item of this.children) {
                res = item.idCompliancy(res.idList);
                if (!res.ok) {
                    return res;
                }
            }
        }
        return res;
    }
}

export class MenuContext extends MenuElement {
    public entity = '';
    public view = '';
    public domain: any = [];
    public sort: 'asc'|'desc' = 'asc';
    public order = '';
    public purpose = '';
    public displayMode = '';

    static get PossiblePurpose(): string[] {
        return [
            '',
            'view',
            'create',
            'update',
            'select',
            'add'
        ];
    }

    static get PossibleDisplayMode(): string[] {
        return [
            '',
            'stacked',
            'popup'
        ];
    }

    public _hasDomain = false;
    public _hasSort = false;
    public _hasOrder = false;

    constructor(schema: any = {}) {
        super();

        if (schema.entity) {
            this.entity = schema.entity;
            delete schema.description;
        }
        if (schema.view) {
            this.view = schema.view;
            delete schema.description;
        }
        if (schema.domain) {
            this._hasDomain = true;
            this.domain = schema.domain;
            delete schema.domain;
        }
        if (schema.sort) {
            this._hasSort = true;
            this.sort = schema.sort;
            delete schema.sort;
        }
        if (schema.order) {
            this._hasOrder = true;
            this.order = schema.order;
            delete schema.order;
        }
        if (schema.purpose) {
            this.purpose = schema.purpose;
            delete schema.purpose;
        }
        if (schema.display_mode) {
            this.displayMode = schema.display_mode;
            delete schema.display_mode;
        }
    }

    override export(): any {
        const result = super.export();

        if (this.entity) {
            result.entity = this.entity;
        }
        if (this.view) {
            result.view = this.view;
        }
        if (this.domain && this._hasDomain) {
            result.domain = this.domain;
        }
        if (this.sort && this._hasSort) {
            result.sort = this.sort;
        }
        if (this.order && this._hasOrder) {
            result.order = this.order;
        }
        if (this.purpose) {
            result.purpose = this.purpose;
        }
        if (this.displayMode) {
            result.display_mode = this.displayMode;
        }

        return result;
    }
}
