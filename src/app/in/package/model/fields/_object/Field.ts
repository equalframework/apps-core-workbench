import { cloneDeep, isArray, isObject } from 'lodash';
import { Usage } from 'src/app/in/_models/Params';

export class Field {

    constructor(schema: any = {}, name = '') {
        this.name = name;
        for (const key in this) {
            if (key === 'usage') {
                if (schema[key]) {
                    this.usage = new Usage(schema[key]);
                    delete schema[key];
                }
                continue;
            }
            if (schema[key]){
                if (key === 'default') { this._hasDefault = true; }
                if (key === 'selection') { this._hasSelection = true; }
                if (key === 'dependencies') { this._hasDependencies = true; }
                if (key === 'visible') { this._hasVisible = true; }
                if (key === 'domain') { this._hasDomain = true; }
                this[key] = schema[key];
                delete schema[key];
            }
        }
        this._leftover = schema;
    }

    get finalType(): string {
        if (this.type !== 'computed') { return this.type; }
        return this.resultType;
    }

    get DummySchema(): any {
        return {type: this.type, result_type: this.resultType};
    }

    get JSON(): any {
        const res = cloneDeep(this._leftover);
        for (const key in this) {
            if (key === 'usage' && Field.type_directives[this.finalType].usage) {
                res[key] = this.usage.export();
                continue;
            }
            if (!Field.type_directives[this.type][key]) { continue; }
            if (key === 'name') { continue; }

            if (key === 'default' && !this._hasDefault) { continue; }
            if (key === 'selection' && !this._hasSelection) { continue; }
            if (key === 'dependencies' && !this._hasDependencies) { continue; }
            if (key === 'visible' && !this._hasVisible) { continue; }
            if (key === 'domain' && !this._hasDomain) { continue; }
            if (!this[key]) { continue; }
            res[key] = cloneDeep(this[key]);
        }
        return res;
    }

    get isUneditable(): boolean {
        return Field.uneditable_name.includes(this.name);
    }
    public static type_directives: any;

    public static uneditable_name: string[] = [
        'modified', 'modifier', 'id', 'deleted', 'created', 'creator', 'state'
    ];

    public type = 'string';
    public usage: Usage = new Usage();

    public name  = '';
    public description = '';
    public readonly = false;
    public required = false;
    public multilang = false;
    public unique = false;
    public store = false;
    public instant = false;
    public selection: any[] = [];

    public default: any;

    public foreign_object = '';
    public foreign_field = '';

    public relTable = '';
    public relLocalKey = '';
    public relForeignKey = '';

    public resultType = 'string';
    public function = '';

    public alias = '';

    public dependencies: string[] = [];
    public onUpdate = '';
    public onDelete = '';
    public onDetach = '';
    public onRevert = '';
    public visible: any = [];
    public sort: 'asc'|'desc' = 'asc';
    public domain: any = [];

    public _hasDefault = false;
    public _hasSelection = false;
    public _hasDependencies = false;
    public _hasVisible = false;
    public _hasDomain = false;

    public _leftover: any = {};

    public areSimilar(other: Field): boolean {
        return compareDictRecurs(this.JSON, other.JSON) === 0;
    }
}

/**
 * @description
 * Compare dict1 and dict2 recursively (could have better optimization)
 * @param dict1 if(!Field.type_directives[this.type][key]) continue
 * @param dict2 if(key === 'name') continue
 * @returns dict1 === dict2
 */
function compareDictRecurs(dict1: any, dict2: any): number {
    if (dict1 === undefined && dict2 === undefined) { return 0; }
    if (dict1 === undefined) { return -1; }
    if (dict2 === undefined) { return 1; }
    if (!isObject(dict1) && !isArray(dict1) && !isObject(dict2) && !isArray(dict2)) { return (dict1 === dict2) ? 0 : 1; }
    let res: number;
    for (const item in dict1) {
        if (dict2[item] === undefined) { return 1; }
        res = compareDictRecurs(dict1[item], dict2[item]);
        if (res !== 0){
            return 1;
        }
    }
    for (const item in dict2) {
        if (dict1[item] === undefined) { return 1; }
        res = compareDictRecurs(dict1[item], dict2[item]);
        if (res !== 0) {
            return -1;
        }
    }
    return 0;
}

