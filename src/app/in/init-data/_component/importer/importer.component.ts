import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InitPopupEditorComponent } from '../init-popup-editor/init-popup-editor.component';
import { InitDataEntityInstance } from '../../_objects/init-data';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-importer',
  templateUrl: './importer.component.html',
  styleUrls: ['./importer.component.scss']
})
export class ImporterComponent implements OnInit {

  ItemList:InitDataEntityInstance[] = []
  sorted:InitDataEntityInstance[] = []

  current_sort:Sort = {active : "", direction : 'asc'}

  ready:boolean = false

  constructor(
    @Optional() public ref: MatDialogRef<InitPopupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { entity: string, vf:any[] },
    private api: EmbeddedApiService
  ) { }

  async ngOnInit() {
    const model = await this.api.getSchema(this.data.entity)
    const instances = await this.api.getAllInstanceFrom(this.data.entity,Object.keys(model.fields))
    console.log(instances)
    for(let instance of instances) {
      instance.modified = null
      instance.modifier = null
      instance.creator = null
      instance.created = null
      if(instance.deleted) continue
      this.ItemList.push(InitDataEntityInstance.ImportFromRealData(instance,model.fields))
    }
    console.log(this.ItemList)
    this.page.pageSize = 10
    this.page.pageIndex = 0
    this.ready = true
    this.sortData(this.current_sort,this.ItemList)
  }

  get selectedCount() {
    let count:number = 0
    this.ItemList.forEach(item => item.selected ? count++ : null)
    return count
  }

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
        let aS:string,bs:string
        try {
          aS = a.otherfield['en'][sort.active].toString()
        } catch {
          return -1
        }
        try {
          bs = b.otherfield['en'][sort.active].toString()
        } catch {
          return 1
        }
        const comp = aS.localeCompare(bs) 
        return isAsc ? comp : -comp
      }
    });
  }

  page:PageEvent = new PageEvent()

  get pageContent() {
    if(this.sorted && this.page) {
      return this.sorted.slice(
        this.page.pageSize*this.page.pageIndex,
        Math.min(this.page.pageSize*(this.page.pageIndex+1),this.sorted.length)
      )
    }
    return this.sorted
  }

  get fullWidth():number {
    let res = 0
    this.data.vf.forEach((item:any)=> res += item.width)
    return res
  }


  selectAll(state:boolean) {
    this.pageContent.forEach(item => item.selected = state)
  }

  close() {
    this.ref.close([])
  }

  import() {
    let res:InitDataEntityInstance[] = []
    this.ItemList.forEach(item => item.selected ? res.push(item) : null)
    this.ref.close(res)
  }

}
