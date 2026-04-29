import { Usage } from 'src/app/in/_models/Params';

export class ReturnValue {

    static get customTypes(): string[] {
        return [
            'entity', 'any'
        ];
    }

    public contentType = 'text/plain';
    public acceptOrigin: any = ['*'];
    public charset = 'utf-8';

    public type = 'any';
    public qty = 'many';
    public usage: Usage = new Usage('');
    public entity = '';
    public values: ReturnFormatItem[] = [];

    public _hasValues = false;

    constructor(scheme: any = {}) {
        if (scheme['content-type']) {
            this.contentType = scheme['content-type'];
        }
        if (scheme['charset']) {
            this.charset = scheme['charset'];
        }
        if (scheme['accept-origin']) {
            this.acceptOrigin = scheme['accept-origin'];
        }
        if (scheme['schema']){
            if (scheme['schema']['type']) {
                this.type = scheme['schema']['type'];
            }
            if (scheme['schema']['qty']) {
                this.qty = scheme['schema']['qty'];
            }
            if (scheme['schema']['usage']) {
                this.usage = new Usage(scheme['schema']['usage']);
            }
            if (scheme['schema']['entity']) {
                this.entity = scheme['schema']['entity'];
            }
            if (scheme['schema']['values']) {
                this._hasValues = true;
                scheme['schema']['values'].foreach((k: string, v: string) => {
                    this.values.push(new ReturnFormatItem(v, k));
                });
            }
        }
    }

    public export(): any {
        return {
            'content-type' : this.contentType,
            'accept-origin' : this.acceptOrigin,
            charset : this.charset,
            schema : {
                type : this.type,
                qty : this.qty,
                usage : ReturnValue.customTypes.includes(this.type) ? undefined : this.usage.export(),
                values : this._hasValues ? this.values.map(value => value.export()) : undefined
            }
        };
    }
}

export class ReturnFormatItem {
    public name = '';
    public description = '';
    public type = 'string';
    public usage: Usage = new Usage('');
    public selection: any[] = [];

    public _hasSelection = false;

    constructor(scheme: any = {}, name: string = '') {
        this.name = name;
        if (scheme['description']) {
            this.description = scheme['description'];
            delete scheme['description'];
        }
        if (scheme['type']) {
            this.type = scheme['type'];
            delete scheme['type'];
        }
        if (scheme['usage']) {
            this.usage = scheme['usage'];
            delete scheme['usage'];
        }
        if (scheme['selection']) {
            this._hasSelection = true;
            this.selection = scheme['selection'];
            delete scheme['selection'];
        }
    }

    export(): any {
        return {
            name : this.name,
            description : this.description,
            type : this.type,
            usage : this.usage,
            selection : this._hasSelection ? this.selection : undefined
        };
    }
}
