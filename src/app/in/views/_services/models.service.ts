import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';


@Injectable({
    providedIn: 'root'
})
export class ViewService {
    public cached_schema:any

    constructor(private api: ApiService) { }

}
