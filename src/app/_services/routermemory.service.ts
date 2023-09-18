import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RouterMemory {
    constructor(
        private router : Router,
        private activatedRoute : ActivatedRoute,
    ) {}

    public previous:any[] = []

    public navigate(command:any[]) {
        this.previous.push(this.router.url)
        console.log(this.previous)
        this.router.navigate(command)
    }

    public goBack() {
        let route
        try {
            route = this.previous.pop()
            route = route ? route : "/"
        } catch {
            route = "/"
        }
        console.log(this.previous)
        this.router.navigate([route])
    }
    
}
