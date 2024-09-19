import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorDialogComponent } from 'src/app/_modules/workbench.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'package-model-views',
    templateUrl: './package-model-views.component.html',
    styleUrls: ['./package-model-views.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})
export class PackageModelViewsComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public selected_package: string = '';
    public views_for_selected_package: string[] = [];

    public package_name: string = '';
    public view_name: string = '';

    public selected_view: EqualComponentDescriptor;

    public type: string|null;
    public entity: string;

    public loading = true;

  constructor(
            private api: EmbeddedApiService,
            private route: ActivatedRoute,
            private router: RouterMemory,
            private matDialog: MatDialog,
            private snackBar: MatSnackBar
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

    public async getViewForSelectedPackage():Promise<string[]> {
        let x:string[];
        if (this.type && this.entity) {
            x = await this.api.getViews(this.type,this.entity);
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
        this.router.goBack()
    }

    public onclickViewSelect(eq_view: EqualComponentDescriptor) {
        this.selected_view = eq_view;
    }

    public onupdatedList() {
        
    }

    /**
     * Select a node.
     *
     * @param eq_route the route that the user has selected
     */
    public async onSelectNode(eq_view: EqualComponentDescriptor) {
        this.selected_view = eq_view;
    }

    public onUpdateNode(event: any) {

    }

    public async onDeleteNode(eq_view: EqualComponentDescriptor) {
        /*
        let sp = event.split(":")
        let res = await this.api.deleteView(sp[0],sp[1])
        this.init()
        if(!res) this.snackBar.open("Deleted")
        else this.snackBar.open(res)
        */
    }

    public onCreateView() {
        console.log(this.entity)
        let d = this.matDialog.open(MixedCreatorDialogComponent,{
        data : this.type === "package" ?
            {
                type:"view",
                package: this.entity,
                lock_type : true,
                lock_package: true
            }
            :
            {
                type:"view",
                package: this.entity?.split('\\')[0],
                model : this.entity?.split("\\").slice(1).join("\\"),
                lock_type : true,
                lock_package: true,
                lock_model : true
            },width : "40em",height: "26em"
        })
        d.afterClosed().subscribe(() => {
        this.init()
        });
    }

    goto() {
        // this.router.navigate(["/views_edit",this.selected_view],{"view":this.selected_view})
    }
}
