import { Menu } from '../../../menu/_models/Menu';
import { View } from '../../_object/View';


export class Translation {
    public value = '';

    constructor(value?: string) {
        if (value !== undefined){
            this.value = value;
        }
    }
}

export class Translator {
    name: Translation = new Translation();
    description: Translation = new Translation();
    plural: Translation = new Translation();
    model: {[id: string]: ModelTranslator} = {};
    view: {[id: string]: ViewTranslator} = {};
    error: ErrorTranslator = new ErrorTranslator();
    ok = true;
    viewLeftover: any = {};

    constructor(model: string[], view: {name: string, view: View}[]) {
        for (const item of model) {
            this.model[item] = new ModelTranslator();
        }
        for (const item of view) {
            const compl = item.view.id_compliant([]);
            if (!compl.ok){
                this.ok = false;
                return;
            }
            this.view[item.name] = new ViewTranslator(item.view);
        }
        this.error = new ErrorTranslator(model);
    }

    static MenuConstructor(menu: Menu): Translator {
        const res = new Translator([], []);
        res.view.menu = new ViewTranslator(new View({}, 'list'));
        for (const id of menu.idCompliancy([]).idList) {
            res.view.menu.layout[id] = new ViewLayoutItemTranslator();
        }
        return res;
    }

    fill(values: any): void {
        this.name = new Translation(values.name);
        this.description = new Translation(values.description);
        this.plural = new Translation(values.plural);
        if (values.model){
            for (const item in values.model) {
                if (!this.model[item]) { continue; }
                this.model[item].fill(values.model[item]);
            }
        }
        if (values.view) {
            for (const item in values.view) {
                if (!this.view[item]){
                    this.viewLeftover[item] = values.view[item];
                    continue;
                }
                this.view[item].fill(values.view[item]);
            }
        }
        if (values.error) {
            this.error.fill(values.error);
        }
    }

    export(): any {
        const res: any = {
            name : this.name.value,
            plural : this.plural.value,
            description : this.description.value,
        };
        if (Object.keys(this.model).length > 0) {
            res.model = {};
            for (const key in this.model) {
                if (this.model[key].is_active) {
                    res.model[key] = {
                        label : this.model[key].label.value,
                        description : this.model[key].description.value,
                        help : this.model[key].help.value
                    };
                }
            }
        }
        if (Object.keys(this.view).length > 0) {
            res.view = {};
            for (const key in this.view) {
                res.view[key] = {};
                res.view[key].name = this.view[key].name.value;
                res.view[key].description = this.view[key].description.value;
                if (Object.keys(this.view[key].layout).length > 0) {
                    res.view[key].layout = {};
                    for (const id in this.view[key].layout) {
                        if (!this.view[key].layout[id].isActive) { continue; }
                        res.view[key].layout[id] = {
                            label : this.view[key].layout[id].label.value
                        };
                    }
                }
                if (Object.keys(this.view[key].actions).length > 0) {
                    res.view[key].actions = {};
                    for (const id in this.view[key].actions) {
                        if (!this.view[key].actions[id].isActive) { continue; }
                        res.view[key].actions[id] = {
                            label : this.view[key].actions[id].label.value,
                            description : this.view[key].actions[id].description.value
                        };
                    }
                }
                if (Object.keys(this.view[key].routes).length > 0) {
                    res.view[key].routes = {};
                    for (const id in this.view[key].routes) {
                        if (!this.view[key].routes[id].isActive) { continue; }
                        res.view[key].routes[id] = {
                            label : this.view[key].routes[id].label.value,
                            description : this.view[key].routes[id].description.value
                        };
                    }
                }
            }

            for (const key in this.viewLeftover){
                res.view[key] = this.viewLeftover[key];
            }
        }
        if (Object.keys(this.error).length > 0) {
            res.error = {};
            for (const key in this.error._base) {
                if (!this.error._base[key].active) { continue; }
                res.error[key] = {};
                for (const id in this.error._base[key].val) {
                    if (!this.error._base[key].val[id].isActive) { continue; }
                    res.error[key][id] = this.error._base[key].val[id]._val.value;
                }
            }
            if (Object.keys(res.error).length <= 0) {
                delete res.error;
            }
        }
        return res;
    }
}

export class ErrorTranslator {
    _base: {[id: string]: {active: boolean, val: {[id: string]: ErrorItemTranslator}}} = {errors: {active: false, val: {}}};

    constructor(model: string[] = []) {
        for (const field of model) {
            this._base[field] = {active: false, val: {}};
        }
    }

    fill(values: any): void {
        for (const key in values) {
            if (!this._base[key]) {
                this._base[key] = {active: false, val: {}};
            }
            this._base[key].active = true;
            for (const k2 in values[key]) {
                this._base[key].val[k2] = new ErrorItemTranslator();
                this._base[key].val[k2].fill(values[key][k2]);
            }
        }
    }

}

export class ModelTranslator {
    is_active = false;
    label: Translation = new Translation();
    description: Translation = new Translation();
    help: Translation = new Translation();


    fill(values: any): void {
        if (values) {
            this.label = new Translation(values.label);
            this.description = new Translation(values.description);
            this.help = new Translation(values.help);
            this.is_active = true;
        }

    }
}

export class ViewTranslator {
    layout: {[id: string]: ViewLayoutItemTranslator} = {};
    name: Translation = new Translation();
    description: Translation = new Translation();
    actions: {[id: string]: ViewActionTranslator} = {};
    routes: {[id: string]: ViewRouteTranslator} = {};

    constructor(view: View) {
        for (const id of view.layout.id_compliant([]).id_list) {
            this.layout[id] = new ViewLayoutItemTranslator();
        }
        for (const action of view.actions) {
            this.actions[action.id] = new ViewActionTranslator();
        }
        for (const route of view.routes) {
            this.routes[route.id] = new ViewRouteTranslator();
        }
    }

    fill(values: any): void {
        this.name = new Translation(values.name);
        this.description = new Translation(values.description);
        if (values.layout){
            for (const item in values.layout) {
                if (!this.layout[item]) { continue; }
                this.layout[item].fill(values.layout[item]);
            }
        }
        if (values.actions){
            for (const item in values.actions) {
                if (!this.actions[item]) { continue; }
                this.actions[item].fill(values.actions[item]);
            }
        }
        if (values.routes) {
            for (const item in values.routes) {
                if (!this.routes[item]) { continue; }
                this.routes[item].fill(values.routes[item]);
            }
        }
    }
}

export class ViewRouteTranslator {
    label: Translation = new Translation();
    description: Translation = new Translation();

    isActive = false;

    fill(values: any): void {
        if (values) {
            this.label = new Translation(values.label);
        }
        this.description = new Translation(values.description);
        this.isActive = true;
    }
}

export class ViewActionTranslator {
    label: Translation = new Translation();
    description: Translation = new Translation();

    isActive = false;

    fill(values: any): void {
        if (values) {
            this.label = new Translation(values.label);
        }
        this.description = new Translation(values.description);
        this.isActive = true;
    }
}

export class ViewLayoutItemTranslator {
    label: Translation = new Translation();
    isActive = false;

    fill(values: any): void {
        if (values) {
            this.label = new Translation(values.label);
        }
        this.isActive = true;
    }
}


export class ErrorItemTranslator {
    _val: Translation = new Translation();
    isActive = false;

    fill(values: any): void {
        if (values) {
            this._val = new Translation(values);
        }
        this.isActive = true;
    }
}
