import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ViewService } from '../_services/view.service';
import { View } from './_objects/View';

@Component({
  selector: 'app-vieweditor',
  templateUrl: './vieweditor.component.html',
  styleUrls: ['./vieweditor.component.scss']
})
export class VieweditorComponent implements OnInit {

  view_id:string;
  entity:string;
  view_scheme:any;
  obk = Object.keys;
  view_obj:View
  name:string|null
  class_scheme:any
  fields:string[]

  constructor(
    private router:RouterMemory,
    private activatedroute:ActivatedRoute,
    private api:ViewService
  ) { }

  async ngOnInit() {
    this.name = this.activatedroute.snapshot.paramMap.get("view_name")
    if(this.name) {
      let tempsplit = this.name.split(":")
      this.entity = tempsplit[0]
      this.view_id = tempsplit[1]
      this.view_scheme = await this.api.getView(this.entity,this.view_id)
      this.view_obj = new View(this.view_scheme,tempsplit[1].split(".")[0])
      console.log(this.view_obj)
      this.class_scheme = await this.api.getSchema(this.entity)
      this.fields = this.obk(this.class_scheme['fields'])
      console.log(this.fields)
    }
  }

  addItemLayout() {
    this.view_obj.layout.newViewItem()
  }

  addFilter() {
    this.view_obj.addFilter()
  }

  deleteItemLayout(index:number) {
    this.view_obj.layout.deleteItem(index)
  }

  deleteFilter(index:number) {
    this.view_obj.deleteFilter(index)
  } 

  logit() {
    console.log(this.view_obj)
  }
  
  addGroup() {
    //TODO
  }

  addSection(groupindex:number) {
    //TODO
  }
}
