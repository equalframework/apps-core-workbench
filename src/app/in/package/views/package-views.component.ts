import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorDialogComponent } from 'src/app/_modules/workbench.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { EqualComponentDescriptor } from '../../_models/equal-component-descriptor.class';

@Component({
    selector: 'package-views',
    templateUrl: './package-views.component.html',
    styleUrls: ['./package-views.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})
export class PackageViewsComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public package_name: string = '';
    public view_name: string = '';

    public selected_view: EqualComponentDescriptor;

    public views_for_selected_package: string[] = [];

    public type: string|null;
    public entity: string;

    public loading = true;

  constructor(
            private api: WorkbenchService,
            private route: ActivatedRoute,
            private matDialog: MatDialog,
            private snackBar: MatSnackBar,
            private location: Location
        ) { }


    public  ngOnInit() {
        this.init();
    }

    private init() {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.view_name = params['view_name'];
            // this.loadViews();
        });

        this.loading = false;
    }




    public getBack() {
        this.location.back()
    }


    /**
     * Select a node.
     *
     * @param eq_route the route that the user has selected
     */
    public async onSelectNode(eq_view: EqualComponentDescriptor) {
        this.selected_view = eq_view;
    }

    public onUpdateNode(event:any) {

    }


}
