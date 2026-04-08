import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { Param } from '../../../_models/Params';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, constant } from 'lodash';
import { ItemTypes } from 'src/app/in/_models/item-types.class';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Location } from '@angular/common';
import { QueryParamActivatorRegistry, QueryParamTabActivator } from 'src/app/_services/query-param-activator.registry';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';

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

    private readonly announcementFieldsToCopy: string[] = [
      'response',
      'access',
      'providers',
      'constants',
      'description',
      'deprecated',
      'help',
      'usage'
    ];

    // @Input properties for tab-based usage
    @Input() controllerName: string = '';
    @Input() controllerType: string = '';
    @Input() controllerPackage: string = '';

    // @Input properties for data from parent component
    @Input() types: string[] = [];
    @Input() usages: string[] = [];
    @Input() paramsScheme: any = null;
    @Input() modelList: string[] = [];
    @Input() dataReady: boolean = false;
    @Input() isSaving: boolean = false;
    public error:boolean = false;

    public paramListHistory:{param:Param[],message:string}[] = [];
    public paramFutureHistory:{param:Param[],message:string}[] = [];

    public scheme:any;
    public controller_package:string = '';
    public controller_name:string = '';
    public controller_type:string = '';
    public selectedIndex = -1;

    public paramList:Param[] = [];

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
        private location: Location,
        private jsonValidator: JsonValidationService
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

    public ngOnInit(){
        // Use @Input properties from parent component (required)
        this.controller_name = this.controllerName;
        this.controller_type = this.controllerType;
        this.controller_package = this.controllerPackage;
        this.type_icon = ItemTypes.getIconForType(this.controller_type);

        // Initialize from parent-provided data
        if (this.types.length > 0) {
            // Ensure 'array' is first if not already present
            if (!this.types.includes('array')) {
                this.types.unshift('array');
            }
        }

        // Initialize paramList from scheme if provided
        if (this.paramsScheme && this.paramsScheme.announcement && this.paramsScheme.announcement.params) {
            for (let key in this.paramsScheme.announcement.params) {
                this.paramList.push(new Param(key, cloneDeep(this.paramsScheme.announcement.params[key])));
            }
            this.scheme = this.paramsScheme;
            this.onChange("Opening file");
        }

        this.loading = false;
        console.log("Initialized with @Input properties:", {
            controllerName: this.controller_name,
            controllerType: this.controller_type,
            controllerPackage: this.controller_package,
            scheme: this.scheme,
            types: this.types,
            usages: this.usages,
            modelList: this.modelList,
            paramsScheme: this.paramsScheme
        });

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

  public formatJson(json: any): any {
    const formatted = cloneDeep(json);
    formatted["name"] = this.controller_name;
    formatted["type"] = this.controller_type;
    formatted["package_name"] = this.controller_package;

    const announcement = this.scheme?.announcement ?? {};
    for (const key of this.announcementFieldsToCopy) {
      if (announcement[key] !== undefined) {
        formatted[key] = announcement[key];
      }
    }

    return formatted;
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

  public async save() {



    this.jsonValidator.validateAndSave(
      this.jsonValidator.validateBySchemaType(this.formatJson(this.export()), "controller", this.controller_package),
      () => this.workbenchService.updateController(this.controller_package, this.controller_name, this.controller_type, this.export()),
      (saving) => this.isSaving = saving
  );
  }

}

