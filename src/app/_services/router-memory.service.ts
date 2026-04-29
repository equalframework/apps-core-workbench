import { query } from '@angular/animations';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// TODO add refresh function

@Injectable({
    providedIn: 'root'
})
export class RouterMemory {
    constructor(
        private router: Router,
    ) {
        // This is needed to make reload on same route working.
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    public previous: { url: string, queryParams?: { [key: string]: any } }[] = [];

    public savedArgs: {[route: string]: {[val: string]: any}} = {};

    public navigate(command: any[], args?: {[val: string]: any}): void {
        // Support being called with either a raw queryParams object
        // or an object that wraps them as { queryParams: { ... } }.
        const queryParams = args && (args as any).queryParams ? (args as any).queryParams : args;
        // Save the current route (with its current query params) so goBack can restore it.
        const currentUrl = this.router.url.replaceAll('%5C', '\\');
        const currentQueryParams = this.router.parseUrl(this.router.url).queryParams || {};
        this.previous.push({ url: currentUrl, queryParams: currentQueryParams });
        if (queryParams) {
            for (const [k, v] of Object.entries(queryParams)) {
                this.updateArg(k, v);
            }
        }

        this.router.navigate(command, { queryParams: queryParams });
    }

    public goBack(): void {
        let route;
        try {
            const prev = this.previous.pop();
            route = prev && prev.url ? prev.url : '/';
        } catch {
            route = '/';
        }
        this.router.navigateByUrl(route);
    }

    public retrieveArgs(): any {
        return this.savedArgs[this.router.url];
    }
    
    public updateArg(key: string, value: any): void {
        const r = this.router.url;
        if (!this.savedArgs[r]) { this.savedArgs[r] = {}; }
        this.savedArgs[r][key] = value;
    }
}
