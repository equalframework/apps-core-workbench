import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { Param } from '../../../_models/Params';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep } from 'lodash';
import { ItemTypes } from 'src/app/in/_models/item-types.class';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

/**
 * Component used to display the params of a controller
 * Can be used standalone via routing or as a tab component with @Input properties
 * This component has an action historic built in.
 * Be careful if you add an element that alter the structure, you need to call onChange for the historic to work
 *
 */
@Component({
  selector: 'package-controller-params',
  templateUrl: './package-controller-params.component.html',
  styleUrls: ['./package-controller-params.component.scss'],
  host : {
    "(body:keydown)" : "onKeydown($event)"
  }
})
export class PackageControllerParamsComponent implements OnInit, OnDestroy {

    // @Input properties for tab-based usage
    @Input() controllerName: string = '';
    @Input() controllerType: string = '';
    @Input() controllerPackage: string = '';

    public error:boolean = false;

    public paramListHistory:{param:Param[],message:string}[] = [];
    public paramFutureHistory:{param:Param[],message:string}[] = [];

    public scheme:any;
    public controller_package:string = '';
    public controller_name:string = '';
    public controller_type:string = '';
    public selectedIndex = -1;

    public modelList:string[];

    public paramList:Param[] = [];

    public types:string[] = [];
    public usages:string[] = [];

    public alert = alert;

    public sch:any;
    public loading: boolean = true;

    public type_icon:string;
    public package_icon:string = ItemTypes.getIconForType('package');

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    get lastIndex():number {
        return this.paramListHistory.length - 1;
    }

    constructor(
        private workbenchService: WorkbenchService,
        private activatedRoute: ActivatedRoute,
        private router: RouterMemory,
        private matSnack:MatSnackBar,
        private dialog: MatDialog,
        private snack: MatSnackBar,
        private notificationService: NotificationService,
        private route: ActivatedRoute,
        private provider: EqualComponentsProviderService,
        private location: Location
      ) { }

      public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
      }

    public onKeydown(event: KeyboardEvent) {
        if( event.key === "z" && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.cancelOneChange();
        }
        if( event.key === "y" && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.revertOneChange();
        }
    }

    public async ngOnInit(){
        this.loading = true;
        this.types = ["array",...(await this.workbenchService.getTypeList())]
        this.usages = await this.workbenchService.getUsageList()
        this.types.sort((p1,p2) => p1.localeCompare(p2))
        
        // Use @Input properties if provided, otherwise get from ActivatedRoute
        if (this.controllerName) {
            this.controller_name = this.controllerName;
            this.controller_type = this.controllerType;
            this.controller_package = this.controllerPackage;
            await this.initializeController();
        } else {
            let a = this.activatedRoute.snapshot.paramMap.get('controller_name')
            if(a) {
                this.controller_name = a;
            }
            else {
                this.error = true;
            }
            a = this.activatedRoute.snapshot.paramMap.get('controller_type')
            if(a) {
                this.controller_type = a;
            }
            else {
                this.error = true;
            }
            this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
                this.controller_package = this.route.parent ? this.route.parent?.snapshot.paramMap.get('package_name') : params['package_name'];
                await this.initializeController();
            });
        }
    }

    private async initializeController() {
        this.type_icon = ItemTypes.getIconForType(this.controller_type);
        let comp: any = null;
        try {
          comp = await this.provider.getComponent(this.controller_package, 'controller', '', this.controller_name).toPromise();
        } catch (err) {
          console.error('Error fetching component descriptor', err);
        }
        let originalName = this.controller_package + '_' + this.controller_name;
        if (comp && comp.file) {
          const parts = comp.file.split('/');
          originalName = parts[parts.length - 1].replace('.php', '');
        }
        try {
          this.scheme = await this.workbenchService.announceController(this.controller_type, originalName).toPromise();
        } catch (err) {
          console.error('Failed to fetch announceController', err);
          this.notificationService && this.notificationService.showError
            ? this.notificationService.showError('Failed to fetch controller announcement. Check CORS or server.')
            : this.matSnack.open('Failed to fetch controller announcement','ERROR');
          this.loading = false;
          return;
        }

        if (!this.scheme || !this.scheme.announcement || !this.scheme.announcement.params) {
          console.warn('No announcement params for', originalName, this.scheme);
          this.loading = false;
          return;
        }

        for (let key in this.scheme['announcement']['params']) {
          this.paramList.push(new Param(key, cloneDeep(this.scheme['announcement']['params'][key])));
        }
        //this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name))
        this.onChange("Opening file");
        this.modelList = await this.workbenchService.collectClasses(true).toPromise();
        this.loading = false;
    }

    public onSelection(index:number){
        this.selectedIndex = index
    }

  public cancelOneChange() {
    this.loading = true;
    if(this.lastIndex > 0) {
      let x = this.paramListHistory.pop()
      if(x){
        this.paramFutureHistory.push(x)
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param)
        this.matSnack.open("undone "+x.message,"INFO")
      }
    }
    this.toSchema()
      this.loading = false;
  }

  public revertOneChange() {
    this.loading = true;
    if(this.paramFutureHistory.length > 0) {
      let x = this.paramFutureHistory.pop()
      if(x){
        this.paramListHistory.push(x)
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param)
        this.matSnack.open("reverted "+x.message,"INFO")
      }

    }
    this.toSchema()
    this.loading = false;
  }

  public onChange(msg:string) {
    //this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name))
    this.paramListHistory.push({param : cloneDeep(this.paramList), message:msg})
    this.paramFutureHistory = []
    this.paramList = [...this.paramList]
    this.toSchema()
  }

  toSchema() {
    let res:{[id:string]:any} = {}
    for(let item of this.paramList) {
      res[item.name] = item.toSchema()
    }
    this.sch = res
  }

  export():{[id:string]:any} {
    let res:{[id:string]:any} = {}
    for(let item of this.paramList) {
      res[item.name] = item.export()
    }
    let result = cloneDeep(this.scheme)
    result["announcement"]["params"] = res
    return result["announcement"]
  }

  showJson() {
    this.dialog.open(JsonViewerComponent,{data:this.export(),width:"75%",height:"85%"})
  }

  handleCustomButton(name:string) {
    if(name === "show JSON") {
      this.showJson()
      return
    }
  }

  goBack() {
    this.location.back();
  }

save() {
    this.snack.open("Saving...","INFO")
    this.workbenchService.updateController(this.controller_name, this.controller_type, this.export()).subscribe((result) => {
            if(result.success){
                    this.notificationService.showSuccess(result.message)
            } else{
                this.notificationService.showError(result.message);
            }
    })

  }

}

