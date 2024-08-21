import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'editor-access',
  templateUrl: './editor-access.component.html',
  styleUrls: ['./editor-access.component.scss']
})
export class EditorAccessComponent implements OnInit {

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
    console.log(this.obj['groups'])
    let index = this.obj['groups'].indexOf(group)
    console.log(index)
    this.obj['groups'].splice(index,1)
  }

}
