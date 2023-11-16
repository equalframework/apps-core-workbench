import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { WorkbenchService } from './_service/property-domain.service';
import { prettyPrintJson } from 'pretty-print-json';

@Component({
    selector: 'app-property-domain-component',
    templateUrl: './property-domain.component.html',
    styleUrls: ['./property-domain.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class PropertyDomainComponent implements OnInit {
    @Input() value: any;
    @Input() name: any;
    @Input() class: any;
    @Input() can_have_env:boolean = true
    @Output() valueChange = new EventEmitter<[]>();
    public validOperators: any;
    public fields: any;
    public is_env: boolean[][] = []
    tempValue: any;

    oldclass:string = ""

    public viewmode:number = 0

    constructor(private api: WorkbenchService) { }

    async ngOnInit() {
        this.transformDomain();
        this.validOperators = await this.api.getValidOperators();
        this.getSchema();
        
    }

    fixdomain() {
        this.is_env = []
        for (let i = 0; i < this.tempValue.length; i++) {
            this.is_env.push([])
            console.log("i : "+i)
            console.log(this.is_env)
            console.log(this.tempValue[i])
            let l = this.tempValue[i].length
            for (let j = 0; j < l; j++) {
                console.log("j : "+j)
                console.log(this.is_env[i])
                this.is_env[i].push(
                    this.tempValue[i][j][2] && (this.tempValue[i][j][2].includes("object.") || this.tempValue[i][j][2].includes("user."))
                )
            }
        }
    }

    async ngOnChanges() {
        this.transformDomain();
        console.log(this.tempValue)
        this.fixdomain()
        this.getSchema()
    }

    async getSchema() {
        if(this.class !== this.oldclass){
            this.fields =  await this.api.getSchema(this.class);
            this.oldclass = this.class
        }
        
    }

    transformDomain() {
        if (this.value) {
            this.tempValue = [...this.value];
            if (this.tempValue.length == 0) {
                this.tempValue = [this.tempValue];
            }
            else if (nbdim(this.tempValue) === 2) {
                this.tempValue = [this.tempValue];
            }
            // 1 condition only : [ '{operand}', '{operator}', '{value}' ]
            else if (this.tempValue.length == 3 && typeof this.tempValue[0] == 'string' && typeof this.tempValue[1] == 'string') {
                this.tempValue = [[this.tempValue]];
            }
        }
    }

    public getTypeFromField(value: string) {
        if (this.fields.fields[value]) {
            if (this.fields.fields[value].type === "computed") {
                return this.fields.fields[value].result_type
            }
            return this.fields.fields[value].type
        }
    }

    public updateOperand(event: any, i: any, j: any) {
        this.tempValue[i][j][0] = event;
        this.tempValue[i][j][1] = '';
        this.tempValue[i][j][2] = this.defaultTypeValue(
            this.getTypeFromField(this.tempValue[i][j][0]).type);
    }

    public selectOperator(value: any, i: any, j: any) {
        this.tempValue[i][j][1] = value;
        if(this.is_env[i][j]) return
        if (value == 'in' || value == 'not in' || !Array.isArray(this.tempValue[i][j][2])) {
            this.tempValue[i][j][2] = [];
        } else {
            this.tempValue[i][j][2] = this.defaultTypeValue(this.getTypeFromField(this.tempValue[i][j][0]).type);
        }
        this.valueChange.emit(this.tempValue)
    }

    changeEnv(value:boolean,i:number,j:number) {
        this.is_env[i][j] = value
        if(this.is_env[i][j])
            this.tempValue[i][j][2]= ''
        else 
            this.selectOperator(this.tempValue[i][j][1],i,j)
    }

    public changeValue(new_value: any, i: any, j: any) {
        if (this.tempValue[i][j][1] == 'in' || this.tempValue[i][j][1] == 'not in' || this.tempValue[i][j][1] == 'contains') {
            if (!Array.isArray(this.tempValue[i][j][2])) {
                this.tempValue[i][j][2] = [];
            }
            console.log(new_value);
            console.log(typeof new_value);
            const index = this.tempValue[i][j][2].indexOf(new_value);
            console.log(this.tempValue);
            console.log(index);
            if (index >= 0) {
                this.tempValue[i][j][2].splice(index, 1);
            } else {
                this.tempValue[i][j][2].push(new_value);
            }
        } else {
            this.tempValue[i][j][2] = new_value;
        }

        this.valueChange.emit(this.tempValue);
    }

    public changeEnvVar(new_value:string, i:number, j:number) {
        this.tempValue[i][j][2] = new_value +"."+this.tempValue[i][j][2].split('.').slice(1).join('.')
        this.valueChange.emit(this.tempValue);
    }

    public changeAttribute(new_value:string, i:number, j:number) {
        console.log(this.tempValue[i][j][2].split('.')[0] + "." + new_value)
        this.tempValue[i][j][2] = this.tempValue[i][j][2].split('.')[0] + "." + new_value
        this.valueChange.emit(this.tempValue);
    }

    public addCondition(index: any) {
        this.tempValue[index].push(["","",""]);
        this.is_env[index].push(false)
    }

    public addClause() {
        this.tempValue.push([["","",""]]);
        this.is_env.push([false])
    }

    public removeCondition(i: any, j: any) {
        this.tempValue[i].splice(j, 1);
        this.valueChange.emit(this.tempValue);
    }

    public removeClause(i: any) {
        this.tempValue.splice(i, 1);
        this.valueChange.emit(this.tempValue);
    }

    private defaultTypeValue(type: any) {
        if (type == 'string' || type == 'text') {
            return '';
        } else if (
            type == 'integer' ||
            type == 'float' ||
            type == 'many2one' ||
            type == 'one2many' ||
            type == 'many2many'
        ) {
            return 0;
        } else if (type == 'array' || type == 'selection' || type == 'domain') {
            return [];
        } else {
            return '';
        }
    }

    get json() {
        return prettyPrintJson.toHtml(this.value)
    }
}



function nbdim(arr: any[], i: number = 0): number {
    if (Array.isArray(arr)) {
        try {
            let res = nbdim(arr[0], i + 1)
            return res
        }
        catch {
            return i + 1
        }
    }
    return i
}