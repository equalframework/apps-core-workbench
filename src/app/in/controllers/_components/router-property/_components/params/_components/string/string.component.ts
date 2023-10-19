import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-string',
    templateUrl: './string.component.html',
    styleUrls: ['./string.component.scss']
})
export class StringComponent implements OnInit {

    @Input() value: any;
    @Input() required: boolean;
    @Input() selection:any;
    @Input() corrected_selection:{[id:string]:string};
    @Output() valueChange = new EventEmitter<string>();
    public myControl = new FormControl('');
    public inputValue = '';
    public filteredSelection: Observable<string[]>;
    public isDesired: boolean;

    constructor() { }

    ngOnInit(): void {
        //this.initialization();
    }

    public ngOnChanges() {
        this.initialization();
    }

    public initialization() {
        this.value ? this.inputValue = this.value : this.inputValue = '';
        if (this.selection) {
            this.turnSelectionIntoDict()
            if(!this.required && !this.corrected_selection[""]) {
                this.corrected_selection[""] = "";
            }
            this.filteredSelection = this.myControl.valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value || '')),
            );
            this.myControl.setValue(this.getKeyByValue(this.corrected_selection,this.value));
        }
    }

    private getKeyByValue(object:{[id:string]:string}, value:string) {
        for (let prop in object) {
            if (object.hasOwnProperty(prop)) {
                if (object[prop] === value)
                    return prop;
            }
        }
        return ""
    }

    public turnSelectionIntoDict() {
        if(this.selection === undefined) return
        let temp:{[id:string]:string} = {}
        if(!this.selection[0]) {
            for(let key in this.selection) {
                temp[this.selection[key]] = key
            }
            this.corrected_selection = temp
        } 
        else {
            for(let key in this.selection) {
                temp[this.selection[key]] = this.selection[key]
            }
            this.corrected_selection = temp
        }
        
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        let tofilter = Object.keys(this.corrected_selection)
        return tofilter.filter((value: string) => value.toLowerCase().includes(filterValue));
    }

    public updateValue(value: any) {
        if(!this.corrected_selection) {
            this.valueChange.emit(value);
        }
        if(this.corrected_selection[value] != '') {
            this.valueChange.emit(this.corrected_selection[value]);
        } else {
            this.valueChange.emit(undefined);
        }
    }

    public onSelectDefault(value: any) {
        if(!this.corrected_selection) {
            this.valueChange.emit(value);
        }
        if(this.corrected_selection[value] != '') {
            this.valueChange.emit(this.corrected_selection[value]);
        } else {
            this.valueChange.emit(undefined);
        }
    }
}
