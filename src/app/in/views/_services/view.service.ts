import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';


@Injectable({
    providedIn: 'root'
})
export class ViewService extends EmbbedApiService {
    public cached_schema:any

    constructor(api: ApiService) {
        super(api)
    }


}
