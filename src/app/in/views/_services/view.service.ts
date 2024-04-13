import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';


@Injectable({
    providedIn: 'root'
})
export class ViewService extends EmbeddedApiService {
    public cached_schema:any

    constructor(api: ApiService) {
        super(api)
    }


}
