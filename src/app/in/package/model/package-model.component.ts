import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FieldClass } from './_object/FieldClass';
import { ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { EqualComponentDescriptor } from '../../_models/equal-component-descriptor.class';

@Component({
    selector: 'package-model',
    templateUrl: './package-model.component.html',
    styleUrls: ['./package-model.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class PackageModelComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public child_loaded = false;

    public package_name: string = '';

    public selected_model: string | undefined = undefined;

    public selected_class: EqualComponentDescriptor | undefined;

    public selected_field: FieldClass|undefined = undefined;

    // http://equal.local/index.php?get=config_packages
    public packages: string[];


    public fields_for_selected_class: FieldClass[];
    public types: any;

    public loading = true;
    public ready = false;

    constructor(
            private route:ActivatedRoute,
            private location: Location,
            public matDialog:MatDialog,
            private routerMemory: RouterMemory
        ) { }

    public async ngOnInit() {
        this.init();
    }

    public ngOnDestroy() {
        console.debug('ModelsComponent::ngOnDestroy');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private async init() {
        this.loading = true;
        this.selected_field = undefined;
        this.selected_model = undefined;
        this.child_loaded = false;
        console.log('ModelsComponent::init');

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
                this.package_name = params['package_name'];
                this.selected_model = params['class_name'];
                this.ready = true;
                this.loading = false;
                this.onSelectNode(new EqualComponentDescriptor(this.package_name, this.selected_model!));
            });

    }

    /**
     * Select a node.
     *
     * @param eq_route the route that the user has selected
     */
    public async onSelectNode(eq_class: EqualComponentDescriptor) {
        if (this.selected_class === eq_class) {
            this.selected_class = undefined;
        } else {
            this.selected_class = eq_class;
        }
    }


    public async onChangeStep(step:number) {
        /*
        if(step == 2) {
            this.route.navigate(['/fields',this.package_name,this.selected_class],{"class":this.selected_class})
        }
        if(step===3) {
            this.route.navigate(['/views',"entity",this.package_name+'\\'+this.selected_class],{"class":this.selected_class})
        }
        if(step===4) {
            this.route.navigate(['/translation/model',this.package_name,this.selected_class],{"class":this.selected_class})
        }
        if(step===5) {
            this.route.navigate(['/workflow',this.package_name,this.selected_class],{"class":this.selected_class})
        }
        */
    }

    /**
     * Update the name of a class for the selected package.
     *
     * @param event contains the old and new name of the class
     */
    public onUpdateNode(change: {old_node: EqualComponentDescriptor, new_node: EqualComponentDescriptor}) {
    }



    public getBack() {
        this.routerMemory.goBack();
    }


}
