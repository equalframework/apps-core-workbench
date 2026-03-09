import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/routermemory.service';

/**
 * Main container component for controller management
 * Routes to params and return sub-modules
 */
@Component({
    selector: 'package-controller',
    templateUrl: './package-controller.component.html',
    styleUrls: ['./package-controller.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class PackageControllerComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public controller_name: string = '';
    public controller_type: string = '';
    public package_name: string = '';
    public loading = true;
    public error = false;

    constructor(
            private route: ActivatedRoute,
            private location: Location,
            public matDialog: MatDialog,
            private routerMemory: RouterMemory
        ) { }

    public async ngOnInit() {
        this.init();
    }

    public ngOnDestroy() {
        console.debug('PackageControllerComponent::ngOnDestroy');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private async init() {
        this.loading = true;
        console.log('PackageControllerComponent::init');

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.controller_type = params['controller_type'];
            this.controller_name = params['controller_name'];
            
            if (!this.controller_name || !this.controller_type) {
                this.error = true;
            }
            this.loading = false;
        });
    }

    public getBack() {
        this.location.back();
    }
}
