import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';

// TODO add refresh function

@Injectable({
    providedIn: 'root'
})
export class EmbeddedApiService {
    constructor(
        protected api: ApiService
    ) {}

    public async createView(model:string,view_id:string) {
        this.api.fetch("?do=core_config_create-view&view_id="+view_id+"&entity="+model);
    }

    public getErrorstring(x:any): string {
        let res = "{";
        for(let key in x) {
            res += " "+key +" : "+x[key]+" ";
        }
        return res + "}";
    }

    public async deleteView(entity:string,view_id:string): Promise<any|undefined>{
        try {
            await this.api.fetch("?do=core_config_delete-view&entity="+entity+"&view_id="+view_id);
            return undefined;
        }
        catch(response) {
            this.api.errorFeedback(response);
            return response;
        }

    }

    public async createPackage(package_name: string) {
        this.api.fetch("?do=core_config_create-package&package="+package_name);
    }

    public async listPackages(): Promise<string[]> {
        try {
            return await this.api.fetch("?get=core_config_packages");
        }
        catch(response) {
            console.error(response);
            return [];
        }
    }

    public async listModelFrom(pkg:string):Promise<string[]> {
        try {
            return (await this.api.fetch('?get=core_config_classes'))[pkg];
        }
        catch (response: any) {
            console.warn('fetch class error', response);
        }
        return []
    }

    public async listAllModels():Promise<string[]> {
        try {
            let x = (await this.api.fetch('?get=core_config_classes'));
            let ret:string[] = [];
            for(let key in x) {
                console.log(key);
                for(let item of x[key]) {
                    ret.push(key+"\\"+item);
                }
            }
            return ret
        }
        catch (response: any) {
            console.warn('fetch class error', response);
        }
        return [];
    }

    public async listViewFrom(pkg:string,entity:string|undefined=undefined):Promise<string[]|undefined> {
        if(entity === undefined) {
            try {
                return (await this.api.fetch('?get=core_config_views&package='+pkg));
            }
            catch (response: any) {
                console.warn('fetch class error', response);
            }
            return [];
        } 
        else {
            try {
                return (await this.api.fetch('?get=core_config_views&entity='+pkg+'\\'+entity));
            }
            catch (response: any) {
                console.warn('fetch class error', response);
            }
            return []
        }

    }

    public async listControlerFromPackageAndByType(pkg:string,type:"data"|"actions"|"apps",pkname:boolean=false):Promise<string[]> {
        try {
            let temp:string[] = (await this.api.fetch("?get=core_config_controllers&package="+pkg))[type];
            if(pkname) {
                return temp;
            }
            let res:string[] = [];
            for(let item of temp) {
                res.push(item.split("_").slice(1).join("_"));
            }
            return res;
        }
        catch {
            return [];
        }

    }

    public async listControllersByType(type:"data"|"actions"|"apps"):Promise<string[]> {
        try {
            let res:string[] = [];
            let pkgs = (await this.listPackages());
            if(pkgs) {
                for(let pkg of pkgs) {
                    let temp:string[] = (await this.api.fetch("?get=core_config_controllers&package="+pkg))[type];
                    for(let item of temp) {
                        res.push(item);
                    }
                }
            }
            return res;
        }
        catch {
            return [];
        }
    }

    public async createController(pkg:string,name:string,type:"do"|"get") {
        this.api.fetch("?do=core_config_create-controller&controller_name="+name+"&controller_type="+type+"&package="+pkg);
    }

    public async createModel(pkg:string,name:string,parent:string){
        this.api.fetch("?do=core_config_create-model&model="+name+"&package="+pkg+(parent === "equal\\orm\\Model" ? "" : "&extends="+parent));
    }

    public async getSchema(entity: string):Promise<any> {
        if (entity) {
            try {
                return await this.api.fetch('?get=core_model_schema&entity=' + entity);
            }
            catch (response: any) {
                console.warn('request error', response);
                return {"fields" : []};
            }
        }
        return {"fields" : []};
    }

    public async getRoutesByPackages(pkg:string) {
        try {
            return await this.api.fetch('?get=core_config_routes&package=' + pkg);
        }
        catch (response: any) {
            return []
        }
    }

    public async getAllRouteFiles():Promise<string[]> {

        let result:string[] = [];
        let x:string[];
        try {
            x = (await this.api.fetch('?get=core_config_packages'));
        }
        catch (response: any) {
            x =  [];
        }
        for(let pkg of x){
            let files:{[file:string]:any}
            try {
                files = (await this.api.fetch('?get=core_config_routes&package=' + pkg));
            } 
            catch {
                files = {};
            }
            for(let file in files) {
                result.push(file);
            }
        }
        return result;

    }

    public async createroute(pkg:string,file:string,url:string):Promise<boolean> {
        try {
            await this.api.fetch("?do=core_config_create-route&package="+pkg+"&file="+file+"&url="+url);
            return true;
        } 
        catch {
            return false;
        }
    }

    public async getTypeList() {
        try {
            return Object.keys(await this.api.fetch("?get=core_config_types"));
        }
        catch {
            return [];
        }
    }

    public async getTypeDirective() {
        try {
            return await this.api.fetch("?get=core_config_types");
        }
        catch {
            return [];
        }
    }

    public async getUsageList() {
        try {
            let x = await this.api.fetch("?get=core_config_usage");
            let y = this.construct_usage_list(x);
            return y.filter((v:string) => !v.endsWith("/")).sort((a:string,b:string) => {
                for(let i = 0; i < a.length && i < b.length ; i++) {
                    if( a < b ) return -1;
                    if( a > b ) return 1;
                }
                return a.length - b.length;
            })
        } 
        catch {
            return [];
        }
    }

    protected construct_usage_list(object:any,):string[] {
        let result = Object.keys(object);
        Object.keys(object).forEach((element) => {
            result = result.concat(
                Object.keys(object[element])
                    .map((field) => (!isNaN(parseFloat(field)) && isFinite(parseFloat(field))) ? field = `${element}/${object[element][field]}` : `${element}/${field}`)
            )
        })
        return result;
    }

    public async deletePackage(pkg:string):Promise<any> {
        try {
            await this.api.fetch("?do=core_config_delete-package&package="+pkg);
            return undefined;
        } 
        catch(response) {
            this.api.errorFeedback(response);
            return response;
        }
    }

    public async deleteModel(pkg:string,model:string):Promise<any> {
        try {
            await this.api.fetch("?do=core_config_delete-model&package="+pkg+"&model="+model);
            return undefined;
        } 
        catch(response) {
            this.api.errorFeedback(response);
            return response;
        }
    }

    public async deleteController(pkg:string, type:string, name:string): Promise<any> {
        try {
            await this.api.fetch("?do=core_config_delete-controller&package="+pkg+"&controller_name="+name+"&controller_type="+type);
            return undefined;
        } 
        catch(response) {
            this.api.errorFeedback(response);
            return response;
        }
    }

    public async getViews(type:string, entity:string): Promise<string[]> {
        try {
            return await this.api.fetch("?get=core_config_views&"+type+"="+entity);
        } 
        catch(response) {
            return [];
        }
    }

    public async getView(entity:string,name:string):Promise<any> {
        try {
            return await this.api.fetch("?get=core_model_view&view_id="+name+"&entity="+entity);
        } 
        catch (response) {
            return {};
        }
    }

    public async getInitData(pkg:string,type:string):Promise<{[id:string]:any}> {
        try {
            return (await this.api.fetch(`?get=core_config_init-data&package=${pkg}&type=${type}`));
        } 
        catch {
            return {};
        }
    }

    public async updateInitData(pkg:string,type:string,payload:string): Promise<boolean> {
        try {
            await this.api.post(`?do=core_config_update-init-data&package=${pkg}&type=${type}`,{payload:payload});
            return true;
        } 
        catch(e) {
            console.log(e);
            this.api.errorFeedback(e);
            return false;
        }
    }

    public async getWorkflow(pkg:string,model:string):Promise<any> {
        try {
            return {exists : true, info : await this.api.get(`?get=core_model_workflow&entity=${pkg}\\${model}`)};
        } 
        catch(e:any) {
            const cast:HttpErrorResponse = e;
            if(cast.status === 404) {
                return {exists : false, info : {}};
            }
            else {
                this.api.errorFeedback(e);
                return {};
            }
        }
    }

    public async saveWorkflow(pkg:string,model:string,payload:string):Promise<boolean> {
        try {
            await this.api.post(`?do=core_config_update-workflow&entity=${pkg}\\${model}`,{payload : payload});
            return true;
        } 
        catch(e) {
            console.error(e);
            this.api.errorFeedback(e);
            return false;
        }
    }

    public async createWorkflow(pkg:string,model:string):Promise<boolean> {
        try {
            await this.api.post(`?do=core_config_create-workflow&entity=${pkg}\\${model}`);
            return true;
        } 
        catch(e) {
            console.error(e);
            this.api.errorFeedback(e);
            return false;
        }
    }

    public async fetchMetaData(code:string,reference:string): Promise<any[]> {
        try {
            return await this.api.get(`?get=core_model_collect&entity=core\\Meta&fields=[value]&domain=[[code,=,${code}],[reference,=,${reference}]]`);
        } 
        catch(e) {
            console.error(e);
            this.api.errorFeedback(e);
            return [];
        }
    }

    public async createMetaData(code:string,reference:string,payload:string): Promise<boolean> {
        try {
            await this.api.post(`?do=core_model_create&entity=core\\Meta`,{"fields" : {"value" : payload, "code" : code, reference : reference}});
            return true;
        } 
        catch(e) {
            console.error(e);
            this.api.errorFeedback(e);
            return false;
        }
    }

    public async saveMetaData(id:number,payload:string):Promise<boolean> {
        try {
            await this.api.post(`?do=core_model_update&entity=core\\Meta&id=${id}`,{"fields" : {"value" : payload}});
            return true;
        } 
        catch(e) {
            console.error(e)
            this.api.errorFeedback(e)
            return false
        }
    }

    public async getAllInstanceFrom(entity:string,fields:string[] = []):Promise<any[]> {
        try {
            return await this.api.get(`?get=core_model_collect&entity=${entity}&fields=${JSON.stringify(fields)}`);
        } 
        catch(e) {
            console.error(e);
            this.api.errorFeedback(e);
            return [];
        }
    }

    public async saveUML(pkg:string,type:string,path:string,payload:string):Promise<boolean> {
        try {
            await this.api.post(`?do=core_config_update-uml&package=${pkg}&type=${type}&path=${path}`,{"payload":payload});
            return true;
        } 
        catch(e) {
            console.error(e);
            this.api.errorFeedback(e);
            return false;
        }
    }

    public async getUMLList(type:string):Promise<{[id:string]:string[]}> {
        try {
            return await this.api.get(`?get=core_config_umls&type=${type}`);
        }
        catch(e) {
            this.api.errorFeedback(e);
            return {};
        }
    }

    public async getUMLContent(pkg:string, type:string, path:string):Promise<any[]> {
        try {
            return await this.api.get(`?get=core_config_uml&package=${pkg}&type=${type}&path=${path}`);
        }
        catch(e) {
            console.error(e);
            this.api.errorFeedback(e);
            return [];
        }
    }

}
