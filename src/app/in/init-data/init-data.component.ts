import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';
import { InitDataFile } from './_objects/init-data';
import { cloneDeep } from 'lodash';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterMemory } from 'src/app/_services/routermemory.service';

@Component({
  selector: 'app-init-data',
  templateUrl: './init-data.component.html',
  styleUrls: ['./init-data.component.scss']
})
export class InitDataComponent implements OnInit {

  obk = Object.keys

  package:string = ""
  type:"init"|"demo" = "init"

  scheme:any = undefined

  file_list:InitDataFile[] = []

  error:boolean = false
  loading:boolean = true

  selected_file_index = 0

  constructor(
    private api:EmbbedApiService,
    private activatedRoute:ActivatedRoute,
    private dialog:MatDialog,
    private snack:MatSnackBar,
    private router:RouterMemory
  ) { }

  async ngOnInit(): Promise<void> {
    const a = this.activatedRoute.snapshot.paramMap.get('package')
    if(a) {
      this.package = a
    } else {
      this.error = true
      return
    }
    const b = this.activatedRoute.snapshot.paramMap.get('type')
    if(b === "init" || b === "demo") {
      this.type = b
    } else {
      this.error = true
      return
    }
    this.scheme = await this.api.getInitData(this.package,this.type)
    console.log(this.scheme)
    for(let key in this.scheme) {
      console.log(key)
      try {
        this.file_list.push(new InitDataFile(this.api,key,cloneDeep(this.scheme[key])))
      } catch {
        this.error = true
        return
      }
    }
    console.log(this.file_list)
    setTimeout(() => this.loading = false, 100*Object.keys(this.scheme).length)
  }

  export() {
    let exp:any = {}
    for(let file of this.file_list) {
      exp[file.name] = file.export()
    }
    return exp
  }

  showJSON() {
    this.dialog.open(Jsonator,{data:this.export(),width:"70vw",height:"80vh"})
  }

  async save() {
    const r = await this.api.updateInitData(this.package,this.type,JSON.stringify(this.export()))
    if(r) {
      this.snack.open("Saved successfully !","INFO")
    }
  }

  goBack() {
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