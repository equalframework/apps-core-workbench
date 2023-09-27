import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewAction } from '../../_objects/View';
import { Observable } from 'rxjs';
import { ViewEditorServicesService } from '../../_services/view-editor-services.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupParamsComponent } from './_components/popup-params/popup-params.component';

@Component({
  selector: 'app-action-editor',
  templateUrl: './action-editor.component.html',
  styleUrls: ['./action-editor.component.scss']
})
export class ActionEditorComponent implements OnInit {

  @Input() obj:ViewAction
  @Input() controllers:string[]
  @Input() groups:string[] = []
  @Input() entity:string

  @Output() delete = new EventEmitter<void>()
  
  big_disp = false

  input = ""
  

  filteredOptions: string[]

  filteredGroups: string[]

  constructor(
    private matdialog:MatDialog
  ) {}

  ngOnInit(){
    this.filteredOptions = ['',...this.controllers]
  }

  deleteme() {
    this.delete.emit()
  }

  tap(new_value:string) {
    this.filteredOptions = ['',...this.controllers.filter((val) => (val.toLowerCase().includes(this.obj.controller)))]
  }

  tap2(new_value:string) {
    this.input = new_value
    this.filteredGroups = this.groups.filter((val) => (val.toLowerCase().includes(this.input)))
  }

  addgroup() {
    let index = this.obj.access['groups'].indexOf(this.input)
    if(index === -1 && this.input.trimStart() !== "") {
      this.obj.access["groups"].push(this.input)
    }
    this.input = ""
  }

  delete_element(group:string) {
    let index = this.obj.access['groups'].indexOf(group)
    this.obj.access['groups'].splice(index,1)
  }

  show_custom_params(){
    this.matdialog.open(PopupParamsComponent,{data:this.obj})
  }

  changeBigDispBy(bool:boolean) {
    if(bool){
      this.big_disp = true
    }
  }
}
