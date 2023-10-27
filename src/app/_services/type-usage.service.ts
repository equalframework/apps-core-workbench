import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';

// TODO add refresh function

@Injectable({
    providedIn: 'root'
})
export class TypeUsageService {
    protected scheme:any

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
}