import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FieldClass } from './_object/FieldClass';
import { ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/router-memory.service';
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

    public childLoaded = false;

    public packageName: string = '';

    public selectedModel: string | undefined = undefined;

    public selectedClass: EqualComponentDescriptor | undefined;

    public selectedField: FieldClass|undefined = undefined;

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

    public async ngOnInit(): Promise<void> {
        this.init();
    }

    public ngOnDestroy(): void  {
        console.debug('ModelsComponent::ngOnDestroy');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private async init(): Promise<void> {
        this.loading = true;
        this.selectedField = undefined;
        this.selectedModel = undefined;
        this.childLoaded = false;

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
                this.packageName = params['package_name'];
                this.selectedModel = params['class_name'];
                this.ready = true;
                this.loading = false;
                this.onSelectNode(new EqualComponentDescriptor(this.packageName, this.selectedModel!));
            });

    }

    /**
     * Select a node.
     *
     * @param eq_route the route that the user has selected
     */
    public async onSelectNode(eqClass: EqualComponentDescriptor): Promise<void> {
        if (this.selectedClass === eqClass) {
            this.selectedClass = undefined;
        } else {
            this.selectedClass = eqClass;
        }
    }


    public async onChangeStep(step:number): Promise<void> {
        /*
        if(step == 2) {
            this.route.navigate(['/fields',this.packageName,this.selectedClass],{"class":this.selectedClass})
        }
        if(step===3) {
            this.route.navigate(['/views',"entity",this.packageName+'\\'+this.selectedClass],{"class":this.selectedClass})
        }
        if(step===4) {
            this.route.navigate(['/translation/model',this.packageName,this.selectedClass],{"class":this.selectedClass})
        }
        if(step===5) {
            this.route.navigate(['/workflow',this.packageName,this.selectedClass],{"class":this.selectedClass})
        }
        */
    }

    /**
     * Update the name of a class for the selected package.
     *
     * @param event contains the old and new name of the class
     */
    public onUpdateNode(change: {oldNode: EqualComponentDescriptor, newNode: EqualComponentDescriptor}) {
    }



    public getBack() {
        this.location.back();
    }


}
