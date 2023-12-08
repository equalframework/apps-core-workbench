import { Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { FormControl } from '@angular/forms';
import { InitDataFile } from '../../_objects/init-data';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

@Component({
  selector: 'app-param-list',
  templateUrl: './param-list.component.html',
  styleUrls: ['./param-list.component.scss']
})
export class ParamListComponent implements OnInit, OnChanges {

  @Input() list: InitDataFile[]
  @Input() selectedIndex: number

  @Output() select = new EventEmitter<number>()
  @Output() CRUD = new EventEmitter<string>()

  public filteredList: InitDataFile[]

  public searchInput: string

  public filterControl = new FormControl("")
  public incremeter = 0

  public createControl = new FormControl("")

  constructor(
    private api:EmbbedApiService
  ) {

  }

  ngOnInit(): void {
    console.log("=============")
    this.filteredList = this.list.sort((p1, p2) => p1.name.localeCompare(p2.name));
    console.log(this.filteredList)
    this.filterControl.valueChanges.subscribe(data => {
      console.log("RTIO")
      this.filteredList = this._filter(data)
    })
  }

  ngOnChanges(): void {
    console.log("----")
    console.log(this.list)
    this.filteredList = this._filter(this.filterControl.value)
  }


  private _filter(value: string): InitDataFile[] {
    const filterValue = value.toLowerCase();
    return this.list.filter(option => option.name.toLowerCase().includes(filterValue.toLowerCase())).sort((p1, p2) => p1.name.localeCompare(p2.name));
  }

  onClickItem(index: number) {
    this.select.emit(index)
  }

  createItem() {
    const name:string = this.createControl.value
    this.list.push(
      new InitDataFile(
        this.api,
        name ? 
          (name.endsWith(".json") ? name : name+".json") 
          : 
          "new_" + (this.incremeter++) + ".json"
      )
    ) 
    this.CRUD.emit("Creation of a new param")
    this.createControl.setValue("")
    this.filteredList = this._filter(this.filterControl.value)
  }

  deleteItem(index: number) {
    let d = this.list.splice(index, 1)
    this.CRUD.emit("deletion of " + d[0].name)
    this.onClickItem(-1)
    this.filteredList = this._filter(this.filterControl.value)
  }

}
