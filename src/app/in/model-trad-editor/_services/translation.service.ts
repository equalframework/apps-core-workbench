import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { promise } from 'protractor';
import { ApiService } from 'sb-shared-lib';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';


@Injectable({
    providedIn: 'root'
})
export class TranslationService extends EmbeddedApiService {
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

    public async saveTrads(pkg:string,entity:string,dict:any) {
        try {
            for(let lang in dict) {
                await this.api.fetch("?do=core_config_update-translation&package="+pkg+"&entity="+entity+"&lang="+lang+"&create_lang=true&payload="+ JSON.stringify(dict[lang].export()))
            }
            
        }catch(resp) {
            this.api.errorFeedback(resp)
        }
    }
}
