import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';

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
    public model_name: string='';
    public selected_view: EqualComponentDescriptor;

    public type: string|null;
    public entity: string;

    public loading = true;

    constructor(
            private route: ActivatedRoute,
            private location: Location,
        ) { }


    public async ngOnInit() {
        this.init();
    }

    private async init() {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.model_name = params['class_name'];
            this.view_name = params['view_name'];
            this.loading=false;
        });
    }



    public getBack() {
        this.location.back();
    }

    public selectNode(eq_view: EqualComponentDescriptor) {
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
        console.log("j'ai cliqué sur createView", this.entity)

    }

    goto() {
        // this.router.navigate(["/views_edit",this.selected_view],{"view":this.selected_view})
    }
}
