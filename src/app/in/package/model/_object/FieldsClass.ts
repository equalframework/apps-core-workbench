import { cloneDeep } from 'lodash';

export class FieldClass {
    public name: string;
    public syncName: string;
    public isSynchronized: boolean;
    public inherited: boolean;
    public currentScheme: any;
    public syncScheme: any;
    public isNew = false;
    public deleted = false;

    // Default value for field
    static get defaultModel(): any {
        return { type: 'string' };
    }

    constructor(name: string, inherited: boolean = false, isSynchronized: boolean = true, scheme: any = FieldClass.defaultModel) {
        this.name = name;
        this.syncName = this.name;
        this.inherited = inherited;
        this.isSynchronized = isSynchronized;
        this.isNew = !isSynchronized;
        this.syncScheme = cloneDeep(scheme);
        this.currentScheme = cloneDeep(scheme);
    }

    public checkSync(): boolean {
        // TODO : Make this work
        this.isSynchronized = compareDictRecurs(this.syncScheme, this.currentScheme) === 0 && this.syncName === this.name && !this.deleted;
        return this.isSynchronized;
    }
}

/**
 * @description
 * Compare dict1 and dict2 recursively (could have better optimization)
 * @param dict1 First dict to compare
 * @param dict2 Second dict to compare
 * @returns dict1 === dict2
 */
function compareDictRecurs(dict1: any, dict2: any): number {
    try {
        if (dict1 === undefined) {
            return -1;
        }
        if (dict2 === undefined) {
            return 1;
        }
        if (typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 === dict2) {
            return 0;
        }
        if (typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 !== dict2) {
            return -1;
        }
        let res: number;
        for (const item in dict1) {
            if (dict2[item] === undefined) {
                return 1;
            }
            res = compareDictRecurs(dict1[item], dict2[item]);
            if (res !== 0) {
                return 1;
            }
        }
        for (const item in dict2) {
            if (dict1[item] === undefined) {
                return 1;
            }
            res = compareDictRecurs(dict1[item], dict2[item]);
            if (res !== 0) {
                return -1;
            }
        }
    }
    catch {
        return 0;
    }
    return 0;
}

