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
    public selected_view: EqualComponentDescriptor | undefined;

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

    public async selectNode(eq_view: EqualComponentDescriptor) {

        if (this.selected_view && this.areNodesEqual(this.selected_view, eq_view)) {
            this.selected_view = undefined;
        } else {
            this.selected_view = eq_view;
        }
    }
    public areNodesEqual(node1: EqualComponentDescriptor | undefined, node2: EqualComponentDescriptor): boolean {
        return node1?.package_name === node2?.package_name &&
               node1?.name === node2?.name &&
               node1?.type === node2?.type;
    }

    public onupdatedList() {

    }

    /**
     * Select a node.
     *
     * @param eq_route the route that the user has selected
     */
    public async onSelectNode(eq_view: EqualComponentDescriptor) {

        if (this.selected_view && this.areNodesEqual(this.selected_view, eq_view)) {
            this.selected_view = undefined;
        } else {
            this.selected_view = eq_view;
        }
    }

    public onUpdateNode(event: any) {

    }

    public async onDeleteNode(eq_view: EqualComponentDescriptor) {
    }

    public onCreateView() {
        console.log("j'ai cliqué sur createView", this.entity)

    }

    goto() {
        // this.router.navigate(["/views_edit",this.selected_view],{"view":this.selected_view})
    }
}
