import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { ActivatedRoute } from '@angular/router';
import { Param } from '../../../_models/Params';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, constant } from 'lodash';
import { ItemTypes } from 'src/app/in/_models/item-types.class';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Location } from '@angular/common';
import { QueryParamActivatorRegistry, QueryParamTabActivator } from 'src/app/_services/query-param-activator.registry';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { ca } from 'date-fns/locale';

/**
 * Component used to display the params of a controller
 * Can be used standalone via routing or as a tab component with @Input properties
 * This component has an action historic built in.
 * Be careful if you add an element that alter the structure, you need to call onChange for the historic to work
 *
 */
@Component({
  selector: 'app-package-controller-params',
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
    @Input() controllerName = '';
    @Input() controllerType = '';
    @Input() controllerPackage = '';

    // @Input properties for data from parent component
    @Input() types: string[] = [];
    @Input() usages: string[] = [];
    @Input() paramsScheme: any = null;
    @Input() modelList: string[] = [];
    @Input() dataReady = false;
    @Input() isSaving = false;
    public error = false;

    public paramListHistory: {param: Param[], message: string}[] = [];
    public paramFutureHistory: {param: Param[], message: string}[] = [];

    public scheme: any;
    public selectedIndex = -1;

    public paramList: Param[] = [];

    public alert = alert;

    public sch: any;
    public loading = true;

    public typeIcon: string;
    public packageIcon: string = ItemTypes.getIconForType('package');

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    get lastIndex(): number {
        return this.paramListHistory.length - 1;
    }

    constructor(
        private workbenchService: WorkbenchService,
        private matSnack: MatSnackBar,
        private dialog: MatDialog,
        private location: Location,
        private jsonValidator: JsonValidationService
      ) { }

      public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
      }

    public onKeydown(event: KeyboardEvent): void {
        if ( event.key === 'z' && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.cancelOneChange();
        }
        if ( event.key === 'y' && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.revertOneChange();
        }
        if (event.key === 's' && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.save();
        }
    }

    public ngOnInit(): void {
        // Use @Input properties from parent component (required)
        this.typeIcon = ItemTypes.getIconForType(this.controllerType);

        // Initialize from parent-provided data
        if (this.types.length > 0) {
            // Ensure 'array' is first if not already present
            if (!this.types.includes('array')) {
                this.types.unshift('array');
            }
        }

        // Initialize paramList from scheme if provided
        if (this.paramsScheme && this.paramsScheme.announcement && this.paramsScheme.announcement.params) {
            for (const key in this.paramsScheme.announcement.params) {
                this.paramList.push(new Param(key, cloneDeep(this.paramsScheme.announcement.params[key])));
            }
            this.scheme = this.paramsScheme;
            this.onChange('Opening file');
        }

        this.loading = false;

    }

    public onSelection(index: number): void {
        this.selectedIndex = index;
    }

  public cancelOneChange(): void {
    this.loading = true;
    if (this.lastIndex > 0) {
      const x = this.paramListHistory.pop();
      if (x){
        this.paramFutureHistory.push(x);
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param);
        this.matSnack.open('undone ' + x.message, 'INFO');
      }
    }
    this.toSchema();
    this.loading = false;
  }

  public revertOneChange(): void {
    this.loading = true;
    if (this.paramFutureHistory.length > 0) {
      const x = this.paramFutureHistory.pop();
      if (x){
        this.paramListHistory.push(x);
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param);
        this.matSnack.open('reverted ' + x.message, 'INFO');
      }

    }
    this.toSchema();
    this.loading = false;
  }

  public onChange(msg: string): void {
    // this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name))
    this.paramListHistory.push({param : cloneDeep(this.paramList), message: msg});
    this.paramFutureHistory = [];
    this.paramList = [...this.paramList];
    this.toSchema();
  }

  toSchema(): void {
    const res: {[id: string]: any} = {};
    for (const item of this.paramList) {
      res[item.name] = item.toSchema();
    }
    this.sch = res;
  }
  export(): {[id: string]: any} {
    const res: {[id: string]: any} = {};
    for (const item of this.paramList) {
      res[item.name] = item.export();
    }
    const result = cloneDeep(this.scheme);
    result.announcement.params = res;
    return result.announcement;
  }

  public formatJson(json: any): any {
    const formatted = cloneDeep(json);
    formatted['name'] = this.controllerName;
    formatted['type'] = this.controllerType;
    formatted['package_name'] = this.controllerPackage;

    const announcement = this.scheme?.announcement ?? {};
    for (const key of this.announcementFieldsToCopy) {
      if (announcement[key] !== undefined) {
        formatted[key] = announcement[key];
      }
    }

    return formatted;
  }

  showJson(): void {
    this.dialog.open(JsonViewerComponent, {data: this.export(), width: '75%', height: '85%'});
  }

  handleCustomButton(name: string): void {
    if (name === 'show JSON') {
      this.showJson();
      return;
    }
  }

  goBack(): void {
    this.location.back();
  }

  public async save(): Promise<void> {
    this.jsonValidator.validateAndSave(
      this.jsonValidator.validateBySchemaType(this.formatJson(this.export()), 'controller', this.controllerPackage),
      () => this.workbenchService.updateController(this.controllerPackage, this.controllerName, this.controllerType, this.export()),
      (saving) => this.isSaving = saving
    );
  }

}
