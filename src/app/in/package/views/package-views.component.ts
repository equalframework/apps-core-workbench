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


    public async ngOnInit() {
        await this.init();
    }

    async init() {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.view_name = params['view_name'];
            // this.loadViews();
        });

        this.loading = false;
    }

    private async loadViews() {
        this.loading = true;
        /*
        let y = await this.api.getRoutesByPackage(this.package_name);
        for(let file in y) {
            for(let route in y[file]) {
                this.real_name[file.split("-")[0] + "-" + route] = route;
                this.routes_for_selected_package.push(file.split("-")[0] + "-" + route);
                this.routelist[file.split("-")[0] + "-" + route] = {
                        "info":{
                            "file":file,
                            "package":this.package_name
                        },
                        "methods":y[file][route]
                    };
            }
        }
        */
        this.loading = false;
    }

    public async getViewForSelectedPackage():Promise<string[]> {
        let x:string[];
        if (this.type && this.entity) {
            x = await this.api.getViews(this.type, this.entity);
            let res:string[] = [];
            for(let item  of x) {
                if(item.includes(this.entity)) {
                    res.push(item);
                }
            }
            return res;
        }
        else return []
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

    public async onDeleteNode(eq_view: EqualComponentDescriptor) {
        let sp = eq_view.name.split(":");
    
        if (sp[1].endsWith(".default")) {
            this.snackBar.open("Cannot delete a default view.", "Close", { duration: 3000 });
            return;
        }
    
        try {
            await this.api.deleteView(sp[0], sp[1]);
    
            // 🔥 Test : Vérifie si la suppression a bien été faite
            console.log("Avant suppression:", this.views_for_selected_package);
    
            this.views_for_selected_package = this.views_for_selected_package.filter(view => view !== eq_view.name);
    
            console.log("Après suppression:", this.views_for_selected_package);
    
            this.snackBar.open("Deleted view: " + eq_view.name, "Close", { duration: 3000 });
        } catch (error) {
            console.error("Deletion error:", error);
            this.snackBar.open("Error: " + error, "Close", { duration: 3000 });
        }
    }
    


    public onupdatedList() {
        
    }

    /*
    goto() {
        this.router.navigate(["/views_edit", this.selected_view], {"view":this.selected_view})
    }
    */
}
