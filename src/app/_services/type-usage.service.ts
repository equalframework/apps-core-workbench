import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ApiService } from 'sb-shared-lib';

// TODO add refresh function

@Injectable({
    providedIn: 'root'
})
export class TypeUsageService {
    protected scheme:any

    private iconList: { [id: string]: string } = {
        "string": "format_quote",
        "integer": "123",
        "array": "data_array",
        "float": "money",
        "boolean": "question_mark",
        "computed": "functions",
        "alias": "type_specimen",
        "binary": "looks_one",
        "date": "today",
        "datetime": "event",
        "time": "access_time",
        "text": "article",
        "many2one": "call_merge",
        "one2many": "call_split",
        "many2many": "height"
      }

    constructor(
        protected api:ApiService,
    ) {
        this.api.fetch("?get=core_config_usages").then(
            data => {
                this.scheme = data
                console.log(this.scheme)
            }
        )
    }

    get usages() {
        return this.scheme
    }

    get typeIcon() {
        return cloneDeep(this.iconList)
    }
}