import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { InitDataEntityInstance, InitDataEntitySection, InitDataFile } from '../../_objects/init-data';
import { Sort } from '@angular/material/sort';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';
import compareAsc from 'date-fns/compareAsc';
import { MatPaginatorDefaultOptions, PageEvent } from '@angular/material/paginator';
import { cloneDeep, isObject } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { InitPopupEditorComponent } from '../init-popup-editor/init-popup-editor.component';
//import { SortValue } from '@material/data-table';
import { EntityDialogComponent } from '../entity-dialog/entity-dialog.component';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';
import { LangPopupComponent } from '../lang-popup/lang-popup.component';
import { ImporterComponent } from '../importer/importer.component';

@Component({
  selector: 'app-init-sidepane',
  templateUrl: './init-sidepane.component.html',
  styleUrls: ['./init-sidepane.component.scss']
})
export class InitSidepaneComponent implements OnInit,OnChanges {

  entity_index:number = 0

  obk = Object.keys

  viewField : any[]

  page:PageEvent = new PageEvent()

  @Input() file:InitDataFile

  modelList:string[] = []

  constructor(
    private api:EmbbedApiService,
    private dialog:MatDialog,
  ) { }

  async ngOnInit() {
    this.modelList = await this.api.listAllModels()
  }

  get fullWidth():number {
    let res = 0
    this.viewField.forEach((item:any)=> res += item.width)
    return res
  }

  async ngOnChanges() {
    try {
      this.entity_index = Math.min(0,this.obk(this.file.entities).length-1)
    } catch {
      this.entity_index = -1
    }
    
    await this.refrsh()
  }

  async refrsh() {
    this.entity_index
    if(this.entity_index >= 0) {
      const key = this.obk(this.file.entities)[this.entity_index]
      this.viewField = (await this.api.getView(
        this.file.entities[key].name,
        "list.default"
      )).layout.items.filter((item:any) => item.value !== 'id' && item.type === 'field')
      console.log(this.viewField)
      this.sorted = this.file.entities[key].items.slice()
    }
    this.page = new PageEvent()
    this.page.pageSize = 10
    this.page.pageIndex = 0
    this.current_sort =  {active : "", direction : 'asc'}
  }

  sorted:any[]

  current_sort:Sort = {active : "", direction : 'asc'}

  sortData(sort:Sort,array:any[]) {
    this.current_sort = sort
    if (!sort.active || sort.direction === '') {
      this.sorted = array.slice()
      return;
    }
    this.sorted = array.sort((a:any, b:any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return (a.id < b.id ? 1  : -1)*(isAsc ? 1 : -1)
        default :
          const as:string = a.otherfield['en'][sort.active].toString()
          const bs:string = b.otherfield['en'][sort.active].toString()
          const comp = as.localeCompare(bs) 
          return isAsc ? comp : -comp
      }
    });
  }

  get pageContent() {
    if(this.sorted && this.page) {
      return this.sorted.slice(
        this.page.pageSize*this.page.pageIndex,
        Math.min(this.page.pageSize*(this.page.pageIndex+1),this.sorted.length)
      )
    }
    return this.sorted
  }

  editItem(parent:InitDataEntitySection,index:number) {
    const d = this.dialog.open(InitPopupEditorComponent,{data:{data:cloneDeep(parent.items[this.getRealIndex(index)]),fields:parent.AllField}, width:"70%", height:"80%"})
    d.afterClosed().subscribe((data?:InitDataEntityInstance) => {
      if(data) {
        parent.items[index] = data
      }
      this.sortData(this.current_sort,parent.items)
    })
    
  }

  selectAll(state:boolean) {
    this.pageContent.forEach(item => item.selected = state)
  }

  getRealIndex(index:number) {
    return index + this.page.pageIndex*this.page.pageSize
  }

  get selected():InitDataEntityInstance[] {
    let res:InitDataEntityInstance[] = []
    const ntity = this.obk(this.file.entities)[this.entity_index]
    for(let instance of this.file.entities[ntity].items) {
      if(instance.selected){
        res.push(instance)
      }
    } 
    return res
  }

  deleteSelection() {
    let rs:InitDataEntityInstance[] = []
    const ntity = this.obk(this.file.entities)[this.entity_index]
    for(let instance of this.file.entities[ntity].items) {
      if(instance.selected){
        continue
      }
      rs.push(instance)
    } 
    this.file.entities[ntity].items = rs
    this.sortData(this.current_sort,this.file.entities[ntity].items)
  }

  toggleIdSelection() {
    this.selected.forEach(item => item.id_strict = !item.id_strict)
  }

  createItem() {
    const ntity = this.obk(this.file.entities)[this.entity_index]
    this.file.entities[ntity].addItems('en',[{}])
    this.sortData(this.current_sort,this.file.entities[ntity].items)
    this.editItem(this.file.entities[ntity],this.file.entities[ntity].items.length-1)
  }

  refresh(evt:MatTabChangeEvent) {
    //this.ngOnChanges()
    this.refrsh()
  }

  openCreateSection() {
    const d = this.dialog.open(EntityDialogComponent,{data:{model:this.modelList, model_taken:Object.keys(this.file.entities)}})
    d.afterClosed().subscribe(data => {
      if(data && !this.file.entities[data]) {
        this.file.entities[data] = new InitDataEntitySection(this.api,{name:data,lang:'en',data:[]})
        this.entity_index = Math.min(Math.max(this.entity_index,0),this.obk(this.file.entities).length-1)
        //@ts-expect-error
        this.refresh({index : Math.max(this.file.entities.length-1,this.entity_index)})
      }
    })
  }
  deleteSection(name:string) {
    let rs:{[id:string]:InitDataEntitySection} = {}
    for(let instance in this.file.entities) {
      if(instance === name){
        continue
      }
      rs[instance] = this.file.entities[instance]
    } 
    this.file.entities = rs
    this.entity_index = Math.min(this.entity_index,this.obk(this.file.entities).length-1)
  }

  openLangEditor() {
    const ntity = this.obk(this.file.entities)[this.entity_index]
    this.dialog.open(LangPopupComponent,{data:this.file.entities[ntity],width: "50vw",height:"60vh"})
  }

  ImportFromDB() {
    const ntity = this.obk(this.file.entities)[this.entity_index]
    const d = this.dialog.open(ImporterComponent,{data:{entity:ntity,vf:this.viewField},width:"70%", height:"80%"})
    d.afterClosed().subscribe((data:InitDataEntityInstance[]) => {
      for(let item of data) {
        item.selected = false
        this.file.entities[ntity].items.push(item)
      }
      this.refrsh()
    })
    
  }
}
