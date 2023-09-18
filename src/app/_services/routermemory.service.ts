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

    public navigate() {}
    
}
