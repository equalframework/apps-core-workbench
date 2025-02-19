import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { InitDataFile } from './_models/init-data';
import { cloneDeep } from 'lodash';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-init-data',
    templateUrl: './init-data.component.html',
    styleUrls: ['./init-data.component.scss']
})
export class InitDataComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public obk = Object.keys;

    public package_name: string = '';

    // 'init' | 'demo'
    public type: string  = 'init';

    public scheme:any;

    public file_list:InitDataFile[] = [];

    public error:boolean = false;
    public loading:boolean = true;

    public selected_file_index = 0;

    constructor(
            private api:EmbeddedApiService,
            private route: ActivatedRoute,
            private dialog:MatDialog,
            private snack:MatSnackBar,
            private router:RouterMemory) {}

    async ngOnInit(): Promise<void> {
        this.init();

    }

    public async init() {
        this.loading = true;

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.type = params['type'];
            console.log("type :", this.type);
            this.loadData();
        });

    }

    private async loadData() {
        this.scheme = await this.api.getInitData(this.package_name, this.type);
        for(let key in this.scheme) {
            try {
                this.file_list.push(new InitDataFile(this.api, key, cloneDeep(this.scheme[key])))
            }
            catch {
                this.error = true;
                return;
            }
        }
        this.loading = false;
    }

    public export() {
        let exp:any = {};
        for(let file of this.file_list) {
            exp[file.name] = file.export();
        }
        return exp;
    }

    public showJSON() {
        this.dialog.open(Jsonator, {data:this.export(),width:"70vw",height:"80vh"});
    }

    public async save() {
        const r = await this.api.updateInitData(this.package_name,this.type,JSON.stringify(this.export()))
        if(r) {
            this.snack.open("Saved successfully","INFO")
        }
    }

    public goBack() {
        this.router.goBack()
    }

}

@Component({
    selector: 'jsonator',
    template: "<pre [innerHtml]='datajson'><pre>"
})
class Jsonator implements OnInit {
  constructor(
    @Optional() public dialogRef: MatDialogRef<Jsonator>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:any,
  ) {}

  ngOnInit(): void {

  }

  get datajson() {
    return prettyPrintJson.toHtml(this.data)
  }
}