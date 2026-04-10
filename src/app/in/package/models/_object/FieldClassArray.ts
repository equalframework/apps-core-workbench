import { FieldClass } from './FieldClass';

export class FieldClassArray extends Array<FieldClass> {
    public getNameList(): string[] {
        const result: string[] = [];
        for (const field in this) {
            result.push(this[field].name);
        }
        return result;
    }
    public getInheritDict(): {[id: string]: boolean} {
        const result: {[id: string]: boolean} = {};
        for (const field in this) {
            result[this[field].name] = this[field].inherited;
        }
        return result;
    }
    public getByName(name: string): FieldClass|undefined {
        for (const field in this) {
            if (this[field].name === name) {
                return this[field];
            }
        }
        return undefined;
    }
    public removeByName(name: string): void {
        for (let  i = 0 ; i < this.length ; i++) {
            if (this[i].name === name) {
                this.splice(i, 1);
            }
        }
    }
    public override push(...item: FieldClass[]): number{
        let cpt = 0;
        for (const i of item) {
            if (this.getByName(i.name) !== undefined) {
                continue;
            }
            super.push(i);
            cpt++;
        }
        return cpt;
    }
}
