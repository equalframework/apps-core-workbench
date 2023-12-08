import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InitDataEntitySection } from '../../_objects/init-data';
import { FormControl } from '@angular/forms';
import { ModelTradEditorComponent } from 'src/app/in/model-trad-editor/model-trad-editor.component';

@Component({
  selector: 'app-lang-popup',
  templateUrl: './lang-popup.component.html',
  styleUrls: ['./lang-popup.component.scss']
})
export class LangPopupComponent implements OnInit {


  langControl = new FormControl("",{validators : ModelTradEditorComponent.lang_case})
  editLangControl = new FormControl("",{validators : ModelTradEditorComponent.lang_case})

  state:{[lang:string]:boolean} = {}

  constructor(
    @Optional() public ref:MatDialogRef<LangPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:InitDataEntitySection
  ) { }

  ngOnInit(): void {
  }

  addLang() {
    if(this.langControl.valid) {
      this.data.addLang(this.langControl.value)
      this.langControl.setValue("")
      this.langControl.reset()
    }
  }

  rename(from:string) {
    if(this.editLangControl.valid && from !== this.editLangControl.value)
    this.data.RenameLang(from,this.editLangControl.value)
    this.state[from] = false
    this.state[this.editLangControl.value] = false
  }

  del(lang:string) {
    this.data.removeLang(lang)
  }
}

