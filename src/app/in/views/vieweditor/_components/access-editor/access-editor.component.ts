import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-access-editor',
  templateUrl: './access-editor.component.html',
  styleUrls: ['./access-editor.component.scss']
})
export class AccessEditorComponent implements OnInit {

  @Input() obj:any
  @Input() groups:string[] = []

  public input:string = ""

  filteredGroups: string[]

  constructor() { }

  ngOnInit(): void {
    console.log(this.obj)
    this.tap2("")
  }

  addgroup() {
    let index = this.obj['groups'].indexOf(this.input)
    if(index === -1 && this.input.trimStart() !== "") {
      this.obj["groups"].push(this.input)
    }
    this.input = ""
    console.log(this.obj)
  }

  tap2(new_value:string) {
    this.filteredGroups = this.groups.filter((val:string) => (val.toLowerCase().includes(this.input)))
  }

  delete_element(group:string) {
    let index = this.obj.access['groups'].indexOf(group)
    this.obj.access['groups'].splice(index,1)
  }

}
