import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslationService } from './_services/translation.service';
import { ErrorItemTranslator, Translator } from './_object/Translation';
import { View } from '../views/vieweditor/_objects/View';
import { MatTabGroup } from '@angular/material/tabs';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { snakeCase } from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { prettyPrintJson } from 'pretty-print-json';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Menu } from '../menu-editor/_object/Menu';

@Component({
  selector: 'app-model-trad-editor',
  templateUrl: './model-trad-editor.component.html',
  styleUrls: ['./model-trad-editor.component.scss']
})
export class ModelTradEditorComponent implements OnInit {


  package:string
  model:string
  lang:string

  error:boolean = false
  entitype:string = "model"
  loading = true

  adding_language = false

  adderror = new FormControl("",{
    validators: [
      ModelTradEditorComponent.snake_case,
    ]
  })

  lang_name = new FormControl("",{
    validators: [
      ModelTradEditorComponent.lang_case
    ]
  })

  data:{[id:string]:Translator} = {}

  constructor(
    private activatedRoute: ActivatedRoute,
    private router:RouterMemory,
    private api:TranslationService,
    private snack:MatSnackBar,
    private dialog:MatDialog
  ) { }

  async ngOnInit() {
    const a = this.activatedRoute.snapshot.paramMap.get('selected_package')
    const b = this.activatedRoute.snapshot.paramMap.get('selected_model')
    const c = this.activatedRoute.snapshot.paramMap.get('type')
    if(c) this.entitype = c
    if(!a || !b) {
      this.error = true
      return
    }
    this.package = a
    this.model = b
    switch(this.entitype) {
      case 'menu' :
        await this.menuInit()
        break
      default :
        await this.init()
        break
    }
  }

  async menuInit() {
    this.loading = true
    let langs = await this.api.getTradsLists(this.package,"menu."+this.model)
    console.log(langs)
    for(let lang in langs) {
      if(langs[lang].length === 0) continue
      let x = await this.api.getTrads(this.package,"menu."+this.model,lang)
      if(!x) {
        console.log("x is null")
        continue
      }
      console.log(x)

      let temp = await this.createNewMenuLang()

      if(!temp.ok) {
        console.log("temp_is_not_ok")
        continue
      }

      this.data[lang] = temp
      console.log(this.data)
      this.data[lang].fill(x)
      console.log(this.data)
      if (this.obk(this.data).length > 0) {
        this.lang = this.obk(this.data)[0]
      }
      console.log(this.lang)
    }
    this.loading = false
  }

  async init() {
    this.loading = true

    let langs = await this.api.getTradsLists(this.package,this.model)

    for(let lang in langs) {
      let x = await this.api.getTrads(this.package,this.model,lang)
      if(!x) {
        console.log("x is null")
        continue
      }
      console.log(x)

      let temp = await this.createNewLang()

      if(!temp.ok) {
        console.log("temp_is_not_ok")
        continue
      }

      this.data[lang] = temp
      console.log(this.data)
      this.data[lang].fill(x)
      console.log(this.data)
    }

    if (this.obk(this.data).length > 0) {
      this.lang = this.obk(this.data)[0]
    }
    console.log(this.lang)
    this.loading = false
  }

  public async createNewMenuLang() {
    let scheme = await this.api.getView(this.package+"\\menu",this.model)
    console.log(scheme)
    
    return Translator.MenuConstructor(new Menu(scheme))

    
  }

  public async createNewLang() {
    let scheme = await this.api.getSchema(this.package+"\\"+this.model)
      
    let modl = Object.keys(scheme["fields"])

    let views = (await this.api.getViews("entity",this.package+"\\"+this.model))
    console.log(views)
    let vs:{name:string,view:View}[] = []
    console.log("fetching view")
    for(let view of views) {
      console.log(view)
      let sp = view.split(":")
      if(!sp[1].includes("list.")&&!sp[1].includes("form.")&&!sp[1].includes("search.") ) continue
      let sch = await this.api.getView(sp[0],sp[1])
      console.log(sch)
      vs.push({name:sp[1],view:new View(sch,sp[1].split(".")[0])})
    }
    console.log("passed view")
    return new Translator(modl,vs)
    
  }

  public obk(object:{[id:string]:any}) {
    let arr = Object.keys(object)
    return arr.sort((a:string,b:string) => a.localeCompare(b))
  }

  get SelectedIndex() {
    console.log("CALLED")
    return 0
  }

  public createError(lang:string,type:string) {
    let val = this.adderror.value
    if(this.data[lang].error._base[type].val[val]) {
      return
    } 
    this.data[lang].error._base[type].val[val] = new ErrorItemTranslator()
    this.data[lang].error._base[type].val[val].is_active = true
    this.adderror.setValue("")
  }

  startAddingLanguage() {
    this.adding_language = true
  }

  stopAddingLanguage() {
    this.adding_language = false
  }

  async createLanguage() {
    if(Object.keys(this.data).includes(this.lang_name.value)){
      this.snack.open("This model already have a traduction file for this language.","ERROR")
      return
    }
    this.data[this.lang_name.value] = this.entitype === 'menu' ? await this.createNewMenuLang() : await this.createNewLang()
    this.adding_language = false
    this.lang = this.lang_name.value
    this.lang_name.setValue("")
  }

  static snake_case(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value
    let valid_chars = "abcdefghijkmlnopqrstuvwxyz-_"
    for(let char of value) {
      if(!valid_chars.includes(char)) return {"case":true}
    }
    return null
  }

  static lang_case(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value
    let lower = "abcdefghijkmlnopqrstuvwxyz"
    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    switch(value.length){
    // Thanks to ts, fallthrought case are an error lol.
    // @ts-expect-error
    case 5:
      if(value[2] !== "_") return {"case" : true}
      if(!upper.includes(value[3])) return {"case" : true}
      if(!upper.includes(value[4])) return {"case" : true}
    case 2:
      if(!lower.includes(value[0])) return {"case" : true}
      if(!lower.includes(value[1])) return {"case" : true}
      break
    default :
      return {"case": true}
    }
    return null
  }

  goBack() {
    this.router.goBack()
  }

  debugExport() {
    this.dialog.open(ModelTradJsonComponent,{data: this.data[this.lang] ? this.data[this.lang].export() : {},height : "80%",width : "80%"})
  }

  saveall() {
    this.api.saveTrads(this.package,(this.entitype === "menu" ? "menu." : "") + this.model,this.data)
  }

}

@Component({
  selector: 'app-model-trad-editor',
  template: "<pre [innerHtml]='datajson'><pre>"
})
class ModelTradJsonComponent implements OnInit {
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModelTradJsonComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:any,
  ) {}

  ngOnInit(): void {
      
  }

  get datajson() {
    return prettyPrintJson.toHtml(this.data)
  }
}
