import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isEqual, cloneDeep, indexOf } from 'lodash';
import { WorkbenchService } from '../../_service/package.service';
import { prettyPrintJson } from 'pretty-print-json';
import { MatDialog } from '@angular/material/dialog';
import { InitValidatorComponent } from './_components/init-validator/init-validator.component';

@Component({
    selector: 'app-package-info',
    templateUrl: './package-info.component.html',
    styleUrls: ['./package-info.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})

export class PackageInfoComponent implements OnInit {

    @Input() current_package:string;
    @Input() package_init_list:string[];
    @Input() package_consitency:any
    @Output() onModelClick = new EventEmitter<void>();
    @Output() onControllerClick = new EventEmitter<void>();
    @Output() onViewClick = new EventEmitter<void>();
    @Output() refresh = new EventEmitter<void>();
    public current_initialised = false
    public warn_count:number
    public error_count:number
    public error_list:{type:number, text:string}[]
    public info_popup = false

    constructor(
        private snackBar: MatSnackBar,
        private api: WorkbenchService,
        private matDialog: MatDialog
    ) { }

    async ngOnInit() {
        this.current_initialised = this.package_init_list.indexOf(this.current_package) >= 0
    }

    public async ngOnChanges() {
        this.current_initialised = this.package_init_list.indexOf(this.current_package) >= 0
        this.error_list = this.package_consitency["result"]
        this.countErrors()
        console.log(this.error_list)
    }

    public countErrors() {
        this.warn_count = 0
        this.error_count = 0
        this.error_list = []
        for(var i in this.package_consitency["result"]) {
            if(this.package_consitency["result"][i].startsWith("WARN")){
                this.error_list.push({type:1,text:this.package_consitency["result"][i]})
                this.warn_count ++
            }
            else if (this.package_consitency["result"][i].startsWith("ERROR")) {
                this.error_list.push({type:2,text:this.package_consitency["result"][i]})
                this.error_count ++
            }
        }
    }

    public modelOnClick() {
        console.log("catch!")
        this.onModelClick.emit()
    }

    public controllerOnClick() {
        console.log("catch!")
        this.onControllerClick.emit()
    }

    public viewOnClick() {
        console.log("catch!")
        this.onViewClick.emit()
    }

    public consitencyPrint():any {
        prettyPrintJson.toHtml(this.package_consitency)
    }

    public async initPackage() {
        let d = this.matDialog.open(InitValidatorComponent,{data:{package:this.current_package},width:"35em"})
        d.afterClosed().subscribe(async (result) => {
            if(result){
                let x = await this.api.InitPackage(this.current_package,result.import)
                if(x) {
                    this.snackBar.open("Package "+this.current_package+" has been successfully initialised")
                    this.refresh.emit()
                } else {
                    this.snackBar.open("Error during package initialisation, check package consistency for more informations.")
                }
            }
        })
        
    }
}
