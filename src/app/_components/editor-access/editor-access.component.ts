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
    this.tap2("")
  }

  addgroup() {
    let index = this.obj['groups'].indexOf(this.input)
    if(index === -1 && this.input.trimStart() !== "") {
      this.obj["groups"].push(this.input)
    }
    this.input = ""
  }

  tap2(new_value:string) {
    this.filteredGroups = this.groups.filter((val:string) => (val.toLowerCase().includes(this.input)))
  }

  delete_element(group:string) {
    let index = this.obj['groups'].indexOf(group)
    this.obj['groups'].splice(index,1)
  }

}
