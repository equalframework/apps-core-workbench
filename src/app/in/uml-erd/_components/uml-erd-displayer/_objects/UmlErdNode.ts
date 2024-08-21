import { EmbeddedApiService } from "src/app/_services/embedded-api.service"

export class UmlErdNode {
    public entity: string;
    public schema: any;
    public parent: string;
    public hidden: string[];
    public fields: string[];
    public position: {x:number,y:number};
    public width: number;
    public height: number;
    public initialPos: {x:number, y:number};
    public show_inheritance: boolean;
    public show_relations: boolean;

    static api:EmbeddedApiService;

    constructor(entity:string = "", x:number = 0, y:number = 0, hidden:string[] = [], fields:string[] = [], parent:string = "equal\\orm\\Model", show_inheritance:boolean = true, show_relations:boolean = true) {
        this.entity = entity;
        this.hidden = hidden;
        this.fields = fields;
        this.parent = parent;
        this.show_inheritance = show_inheritance;
        this.show_relations = show_relations;
        this.position = {x: x, y: y};
        this.initialPos = {x: x, y: y};
    }

    public getFieldIndex(field:string):number {
        return this.fields.indexOf(field);
    }

    public addField(field:string) {
        if(!this.fields.includes(field)) {
            this.fields.push(field);
        }
        if(this.hidden.includes(field)) {
            this.hidden.splice(this.hidden.indexOf(field), 1);
        }
    }

    public hideField(field:string) {
        if(!this.hidden.includes(field)) {
            this.hidden.push(field);
        }
        if(this.fields.includes(field)) {
            this.fields.splice(this.fields.indexOf(field), 1);
        }
    }

    public static init(api:EmbeddedApiService) {
        UmlErdNode.api = api;
    }

    get fieldNames() {
        return Object.keys(this.schema);
    }

    public static async AsyncConstructor(entity: string = '', hidden: string[] = [], fields: string[] = [], x: number = 0, y: number = 0, show_inheritance: boolean = true, show_relations: boolean = true): Promise<UmlErdNode> {
        const schema = await this.api.getSchema(entity);
        let result = new UmlErdNode(entity, x, y, hidden, fields, schema.parent, show_inheritance, show_relations);
        result.schema = schema.fields ?? {};
        if(fields.length == 0) {
            for(let field of Object.keys(schema.fields)) {
                if(hidden.includes(field)) {
                    continue;
                }
                result.fields.push(field);
            }
        }
        return result;
    }

    public export() {
        return {
            entity : this.entity,
            hidden : [...this.hidden],
            fields : [...this.fields],
            position : {
                x: this.position.x,
                y: this.position.y
            },
            show_inheritance : this.show_inheritance,
            show_relations : this.show_relations
        }
    }
}
