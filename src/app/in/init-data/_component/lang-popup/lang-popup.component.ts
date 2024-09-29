import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InitDataEntitySection } from '../../_models/init-data';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-lang-popup',
  templateUrl: './lang-popup.component.html',
  styleUrls: ['./lang-popup.component.scss']
})
export class LangPopupComponent implements OnInit {


    langControl = new FormControl("",{validators : LangPopupComponent.lang_case})
    editLangControl = new FormControl("",{validators : LangPopupComponent.lang_case})

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

    static lang_case(control: AbstractControl): ValidationErrors | null {
        let value: string = control.value
        let lower = "abcdefghijkmlnopqrstuvwxyz"
        let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        switch(value.length){
        // Thanks to ts, fallthrought case are an error lol.
        // @ts-expect-error
        case 5:
            if(value[2] !== "_") return {"case" : true}
            if(!upper.includes(value[3])) return {"case" : true}
            if(!upper.includes(value[4])) return {"case" : true}
        case 2:
            if(!lower.includes(value[0])) return {"case" : true}
            if(!lower.includes(value[1])) return {"case" : true}
            break
        default :
            return {"case": true}
        }
        return null
    }
}

