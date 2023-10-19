import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isObject } from 'lodash';
import { ApiService } from 'sb-shared-lib';

// TODO add refresh function

@Injectable({
    providedIn: 'root'
})
export class EmbbedApiService {
    constructor(
        protected api: ApiService
    ) {}

    public async createView(model:string,view_id:string) {
        this.api.fetch("?do=core_config_create-view&view_id="+view_id+"&entity="+model)
    }

    public getErrorstring(x:any):string {
        let res = "{"
        for(let key in x) {
            res += " "+key +" : "+x[key]+" "
        }
        return res + "}"
    }

    public async deleteView(entity:string,view_id:string):Promise<any|undefined>{
        try {
            await this.api.fetch("?do=core_config_delete-view&entity="+entity+"&view_id="+view_id)
            return undefined
        } catch(response) {
            this.api.errorFeedback(response)
            return response
        }
        
    }

    public async createPackage(packagename:string) {
        this.api.fetch("?do=core_config_create-package&package="+packagename)
    }

    public async listPackages():Promise<string[]|undefined> {
        try {
            return await this.api.fetch("?get=core_config_packages")
        } catch(response) {
            console.error(response)
            return undefined
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
            let x = (await this.api.fetch('?get=core_config_classes'))
            let ret:string[] = []
            for(let key in x) {
                console.log(key)
                for(let item of x[key]){
                    ret.push(key+"\\"+item)
                }
            }
            return ret
        }
        catch (response: any) {
            console.warn('fetch class error', response);
        }
        return []
    }

    public async listViewFrom(pkg:string,entity:string|undefined=undefined):Promise<string[]|undefined> {
        if(entity === undefined) {
            try {
                return (await this.api.fetch('?get=core_config_views&package='+pkg));
            }
            catch (response: any) {
                console.warn('fetch class error', response);
            }
            return []
        } else {
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
            let temp:string[] = (await this.api.fetch("?get=core_config_controllers&package="+pkg))[type]
            if(pkname) return temp
            let res:string[] = []
            for(let item of temp) {
                res.push(item.split("_").slice(1).join("_"))
            }
            return res
            
        }catch {
            return []
        }
        
    }

    public async createController(pkg:string,name:string,type:"do"|"get") {
        this.api.fetch("?do=core_config_create-controller&controller_name="+name+"&controller_type="+type+"&package="+pkg)
    }

    public async createModel(pkg:string,name:string,parent:string){
        this.api.fetch("?do=core_config_create-model&model="+name+"&package="+pkg+(parent === "equal\\orm\\Model" ? "" : "&extends="+parent))
    }

    public async getSchema(entity: string) {
        try {
            return await this.api.fetch('?get=core_model_schema&entity=' + entity);
        }
        catch (response: any) {
            console.warn('request error', response);
            return {}
        }
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
        
        let result:string[] = []
        let x:string[]
        try {
            x = (await this.api.fetch('?get=core_config_packages'))
        }
        catch (response: any) {
            x =  []
        }
        for(let pkg of x){
            let files:{[file:string]:any}
            try {
                files = (await this.api.fetch('?get=core_config_routes&package=' + pkg))
            } catch {
                files = {}
            }
            for(let file in files) {
                result.push(file)
            }
        }
        return result
        
    }

    public async createroute(pkg:string,file:string,url:string):Promise<boolean> {
        try {
            await this.api.fetch("?do=core_config_create-route&package="+pkg+"&file="+file+"&url="+url)
            return true
        } catch {
            return false
        }
    }

    public async getTypeList() {
        try {
            return Object.keys(await this.api.fetch("?get=core_config_types"))
        }
        catch {
            return []
        }
    }

    public async getUsageList() {
        try {
            let x = await this.api.fetch("?get=core_config_usage")
            let y = this.construct_usage_list(x)
            return y.filter((v:string) => !v.endsWith("/")).sort((a:string,b:string) => {
                for(let i = 0; i < a.length && i < b.length ; i++) {
                    if( a < b ) return -1
                    if( a > b ) return 1
                }
                return a.length - b.length
            })
        } catch {
            return []
        }
    }

    protected construct_usage_list(object:any,):string[] {
        let result = Object.keys(object)
        Object.keys(object).forEach((element) => {
            result = result.concat(
                Object.keys(object[element])
                    .map((field) => (!isNaN(parseFloat(field)) && isFinite(parseFloat(field))) ? field = `${element}/${object[element][field]}` : `${element}/${field}`)
            )
        })
        return result
    }

    public async deletePackage(pkg:string):Promise<any> {
        try {
            await this.api.fetch("?do=core_config_delete-package&package="+pkg)
            return undefined
        } catch(response) {
            this.api.errorFeedback(response)
            return response
        }
    }

    public async deleteModel(pkg:string,model:string):Promise<any> {
        try {
            await this.api.fetch("?do=core_config_delete-model&package="+pkg+"&model="+model)
            return undefined
        } catch(response) {
            this.api.errorFeedback(response)
            return response
        }
    }

    public async deleteController(pkg:string,type:string,name:string):Promise<any> {
        try {
            await this.api.fetch("?do=core_config_delete-controller&package="+pkg+"&controller_name="+name+"&controller_type="+type)
            return undefined
        } catch(response) {
            this.api.errorFeedback(response)
            return response
        }
    }

    public async getViews(type:string,entity:string):Promise<string[]> {
        try {
            return await this.api.fetch("?get=core_config_views&"+type+"="+entity)
        } catch(response) {
            return []
        }
    }

    public async getView(entity:string,name:string):Promise<any> {
        try {
            return await this.api.fetch("?get=core_model_view&view_id="+name+"&entity="+entity)
        } catch (response) {
            return null
        }
    }

}
 