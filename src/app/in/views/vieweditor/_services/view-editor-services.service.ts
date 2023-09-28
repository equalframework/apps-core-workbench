import { Injectable } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { ViewService } from '../../_services/view.service';

@Injectable({
  providedIn: 'root'
})
export class ViewEditorServicesService extends ViewService {

  constructor(api:ApiService) { super(api) }

  public async getDataControllerList(pkg:string):Promise<string[]> {
    try {
      return (await this.api.fetch("?get=core_config_controllers&package="+pkg))['data']
    } catch {
      return []
    }
  }

  /**
   * Return the announcement of a controller
   *
   * @param string type_controller the action of the controller(do or get)
   * @param string eq_package name of the package
   * @param string name of the controller
   * @returns array with the announcement of a controller
   */
  public async getAnnounceController(name: string) {
    try {
        return await this.api.fetch('?get=' + name + '&announce=true');
    }
    catch (response: any) {
        return null;
    }
  }

    /**
   * Return the announcement of a controller
   *
   * @param string type_controller the action of the controller(do or get)
   * @param string eq_package name of the package
   * @param string name of the controller
   * @returns array with the announcement of a controller
   */
    public async doAnnounceController(name: string) {
      try {
          return await this.api.fetch('?do=' + name + '&announce=true');
      }
      catch (response: any) {
          return null;
      }
    }

  public async getAllActionControllers():Promise<string[]> {
    try {
      let packs:string[] = await this.api.fetch('?get=core_config_packages')
      let contrs = []
      for(let pkg of packs) {
        let temp:{[type:string]:string[]} = await this.api.fetch('?get=core_config_controllers&package='+pkg)
        for(let cont of temp["actions"]) {
          contrs.push(cont)
        }
      }
      return contrs
    } catch {
      return []
    }
  }

  public async getCoreGroups():Promise<any> {
    try {
        return await this.api.fetch('?get=core_model_collect&fields=[name]&lang=en&domain=[]&order=id&sort=asc&entity=core\\Group');
    }
    catch (response: any) {
        return  [];
    }
  }

  public async saveView(payload:any,entity:string,viewid:string):Promise<boolean> {
    try {
      await this.api.fetch("?do=core_config_update-view&entity="+entity+"&view_id="+viewid+"&payload="+JSON.stringify(payload))
    }
    catch {
      return false
    }
    return true
  }
}
