import { Component, Inject, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';

@Component({
  selector: 'app-file-saver',
  templateUrl: './file-saver.component.html',
  styleUrls: ['./file-saver.component.scss']
})
export class FileSaverComponent implements OnInit {
  constructor(
    @Optional() public dialogRef: MatDialogRef<FileSaverComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:{path:string},
    private api:EmbeddedApiService
  ) {}

  list:{[id:string]:string[]} =  {}

  filtered_list:string[] = []

  control = new FormControl("")

  async ngOnInit() {
    this.list = await this.api.getUMLList("erd")
    this._filter(this.data.path)
    this.control.valueChanges.subscribe((data)=>{
      this._filter(data)
    })
    this.control.addValidators(FileSaverComponent.casefunc(Object.keys(this.list)))
    this.control.setValue(this.data.path)
  }

  static casefunc(list:string[]) {
    return (control:AbstractControl):ValidationErrors|null => {
      const data:string = control.value

      const split = data.split("::")

      if(split.length !== 2) {
        return {case:true}
      }

      if(split[1].length <= 0 || split[1].startsWith(".")) {
        return {case:true}
      }

      if(!list.includes(split[0])) {
        return {case:true}
      }

      return null
    }
  }

  private _filter(value:string) {
    let temp = []
    for(let pkg in this.list) {
      for(let item of this.list[pkg]) {
        temp.push(pkg+"::"+item)
      }
    }
    this.filtered_list = temp.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
  }
}

