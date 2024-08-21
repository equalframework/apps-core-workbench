import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';

@Component({
    selector: 'app-clause-domain-component',
    templateUrl: './property-clause.component.html',
    styleUrls: ['./property-clause.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})
export class PropertyClauseComponent implements OnInit {
    @Input() value: any;
    @Input() name: any;
    @Input() class: any;
    @Output() valueChange = new EventEmitter<[]>();
    public validOperators: any;
    public fields: any;
    tempValue: any;

    constructor(private api: EmbeddedApiService) {}

    async ngOnInit() {
        this.transformDomain();
        this.validOperators = await this.api.getValidOperators();
        this.getSchema();
    }

    async ngOnChanges() {
        this.getSchema()
        this.transformDomain();
    }

    async getSchema() {
        this.fields = await this.api.getSchema(this.class);
    }

    transformDomain() {
        if(this.value) {
            console.log(this.value)
            this.tempValue = [...this.value];
            if(this.tempValue.length <= 0)
                this.tempValue = []
            // 1 condition only : [ '{operand}', '{operator}', '{value}' ]
            if (this.tempValue.length == 3 &&typeof this.tempValue[0] == 'string' &&typeof this.tempValue[1] == 'string') {
                this.tempValue = [this.tempValue];
            }
        }
    }

    public getTypeFromField(value:string) {
        if(this.fields.fields[value]){
            console.log(this.fields.fields[value].type)
            if(this.fields.fields[value].type === "computed"){
                console.log(this.fields.fields[value].result_type)
                return this.fields.fields[value].result_type
            }
            return this.fields.fields[value].type 
        }
    }

    public updateOperand(event: any, j: any) {
        this.tempValue[j][0] = event;
        this.tempValue[j][1] = '';
        this.tempValue[j][2] = this.defaultTypeValue(
        this.getTypeFromField(this.tempValue[j][0]).type);
    }

    public selectOperator(value: any, j: any) {
        this.tempValue[j][1] = value;
        if (value == 'in' || value == 'not in' ||!Array.isArray(this.tempValue[j][2])) {
            this.tempValue[j][2] = [];
        } else {
            this.tempValue[j][2] = this.defaultTypeValue(this.getTypeFromField(this.tempValue[j][0]).type);
        }
    }

    public changeValue(new_value: any, j: any) {
        if (this.tempValue[j][1] == 'in' || this.tempValue[j][1] == 'not in' || this.tempValue[j][1] == 'contains') {
            if (!Array.isArray(this.tempValue[j][2])) {
                this.tempValue[j][2] = [];
            }
            console.log(new_value);
            console.log(typeof new_value);
            const index = this.tempValue[j][2].indexOf(new_value);
            console.log(this.tempValue);
            console.log(index);
            if (index >= 0) {
                this.tempValue[j][2].splice(index, 1);
            } else {
                this.tempValue[j][2].push(new_value);
            }
        } else {
            this.tempValue[j][2] = new_value;
        }

        this.valueChange.emit(this.tempValue);
    }

    public addCondition() {
        this.tempValue.push(['', '', '']);
    }

    public removeCondition(j: any) {
        this.tempValue.splice(j, 1);
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
}
