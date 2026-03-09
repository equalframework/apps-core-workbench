import { query } from '@angular/animations';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// TODO add refresh function

@Injectable({
    providedIn: 'root'
})
export class RouterMemory {
    constructor(
        private router : Router,
        private activatedRoute : ActivatedRoute,
    ) {
        // This is needed to make reload on same route working.
        this.router.routeReuseStrategy.shouldReuseRoute = function(){
            return false;
        }
    }

    public previous: { url: string, queryParams?: { [key: string]: any } }[] = []

    public saved_args: {[route:string]:{[val:string]:any}} = {}

    public navigate(command:any[],args:{[val:string]:any}|undefined=undefined) {
        // Support being called with either a raw queryParams object
        // or an object that wraps them as { queryParams: { ... } }.
        const queryParams = args && (args as any).queryParams ? (args as any).queryParams : args;
        // Save the current route (with its current query params) so goBack can restore it.
        const currentUrl = this.router.url.replaceAll("%5C","\\");
        const currentQueryParams = this.router.parseUrl(this.router.url).queryParams || {};
        this.previous.push({ url: currentUrl, queryParams: currentQueryParams });
        if (queryParams) {
            for (let [k, v] of Object.entries(queryParams)) {
                this.updateArg(k, v)
            }
        }

        this.router.navigate(command, { queryParams: queryParams });
    }

    public goBack() {
        let route
        try {
            const prev = this.previous.pop();
            route = prev && prev.url ? prev.url : "/";
        } catch {
            route = "/"
        }
        this.router.navigateByUrl(route)
    }

    public retrieveArgs():any {
        return this.saved_args[this.router.url]
    }
    
    public updateArg(key:string,value:any) {
        let r = this.router.url
        if(!this.saved_args[r]) this.saved_args[r] = {}
        this.saved_args[r][key] = value
    }
}
