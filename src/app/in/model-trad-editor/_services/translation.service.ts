import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { promise } from 'protractor';
import { ApiService } from 'sb-shared-lib';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';


@Injectable({
    providedIn: 'root'
})
export class TranslationService extends EmbbedApiService {
    public cached_schema:any

    constructor(
        private http: HttpClient,
        api: ApiService,
    ) { super(api) }
    
    public async getTrads(pkg:string, entity:string, lang:string):Promise<{[id:string]:any}|null> {
        try {
            return await this.api.fetch("?get=core_config_translation&lang="+lang+"&entity="+pkg+"\\"+entity)
        } catch (response){
            return null
        }
        
    }

    public async getTradsLists(pkg:string,entity:string):Promise<{[id:string]:string[]}> {
        try {
            return await this.api.fetch("?get=core_config_translations&entity="+pkg+"\\"+entity)
        } catch (response){
            return {}
        }
    }
}
