import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { InitDataEntityInstance, InitDataEntitySection, InitDataFile } from '../../_models/init-data';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { cloneDeep, isObject } from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { InitPopupEditorComponent } from '../init-popup-editor/init-popup-editor.component';
//import { SortValue } from '@material/data-table';
import { EntityDialogComponent } from '../entity-dialog/entity-dialog.component';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';
import { LangPopupComponent } from '../lang-popup/lang-popup.component';
import { ImporterComponent } from '../importer/importer.component';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-init-sidepane',
  templateUrl: './init-sidepane.component.html',
  styleUrls: ['./init-sidepane.component.scss']
})
export class InitSidepaneComponent implements OnInit, OnChanges {

    @Input() file:InitDataFile;

    public entity_index:number = 0;

    public obk = Object.keys;

    public viewField : any[];

    public page:PageEvent = new PageEvent();

    public modelList:string[] = [];
    public sorted:any[];
    public current_sort:Sort = {active : "", direction : 'asc'};

    constructor(
            private workbenchService:WorkbenchService,
            private dialog:MatDialog) { }

    public async ngOnInit() {
        this.modelList = await this.workbenchService.collectClasses(true).toPromise()
    }

    public get fullWidth(): number {
        let res = 0;
        this.viewField.forEach((item:any)=> res += item.width);
        return res;
    }

    public async ngOnChanges() {
        try {
            this.entity_index = Math.min(0,this.obk(this.file.entities).length-1)
        } catch {
            this.entity_index = -1
        }

        await this.refresh()
    }

    public async refresh() {
        this.entity_index;
        if(this.entity_index >= 0) {
            const key = this.obk(this.file.entities)[this.entity_index]
            const view = await this.workbenchService.getView(
                    this.file.entities[key].name,
                    "list.default"
                ).toPromise();
            this.viewField = view.layout?.items?.filter((item:any) => item.value !== 'id' && item.type === 'field')
            console.log(this.viewField)
            this.sorted = this.file.entities[key].items.slice();
        }
        this.page = new PageEvent();
        this.page.pageSize = 10;
        this.page.pageIndex = 0;
        this.current_sort =  {active : "", direction : 'asc'};
    }

    public sortData(sort:Sort,array:any[]) {
    this.current_sort = sort
    if (!sort.active || sort.direction === '') {
        this.sorted = array.slice()
        return;
    }
    this.sorted = array.sort((a:any, b:any) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
        case 'id':
            return (a.id < b.id ? 1  : -1)*(isAsc ? 1 : -1)
        default :
            const as:string = a.otherfield['en'][sort.active].toString()
            const bs:string = b.otherfield['en'][sort.active].toString()
            const comp = as.localeCompare(bs) 
            return isAsc ? comp : -comp
        }
    });
    }

    public get pageContent() {
    if(this.sorted && this.page) {
        return this.sorted.slice(
        this.page.pageSize*this.page.pageIndex,
        Math.min(this.page.pageSize*(this.page.pageIndex+1),this.sorted.length)
        )
    }
    return this.sorted
    }

    public editItem(parent:InitDataEntitySection,index:number) {
    const d = this.dialog.open(InitPopupEditorComponent,{data:{data:cloneDeep(parent.items[this.getRealIndex(index)]),fields:parent.AllField}, width:"70%", height:"80%"})
    d.afterClosed().subscribe((data?:InitDataEntityInstance) => {
        if(data) {
        parent.items[index] = data
        }
        this.sortData(this.current_sort,parent.items)
    })

    }

    public selectAll(state:boolean) {
    this.pageContent.forEach(item => item.selected = state)
    }

    public getRealIndex(index:number) {
        return index + this.page.pageIndex*this.page.pageSize
    }

    public get selected():InitDataEntityInstance[] {
        let res:InitDataEntityInstance[] = [];
        const ntity = this.obk(this.file.entities)[this.entity_index];
        for(let instance of this.file.entities[ntity].items) {
            if(instance.selected){
               res.push(instance);
            }
        }
        return res;
    }

    public deleteSelection() {
        let rs:InitDataEntityInstance[] = [];
        const ntity = this.obk(this.file.entities)[this.entity_index];
        for(let instance of this.file.entities[ntity].items) {
            if(instance.selected){
                continue;
            }
            rs.push(instance);
        }
        this.file.entities[ntity].items = rs;
        this.sortData(this.current_sort,this.file.entities[ntity].items);
    }

    public toggleIdSelection() {
        this.selected.forEach(item => item.id_strict = !item.id_strict);
    }

    public createItem() {
        const ntity = this.obk(this.file.entities)[this.entity_index];
        this.file.entities[ntity].addItems('en',[{}]);
        this.sortData(this.current_sort,this.file.entities[ntity].items);
        this.editItem(this.file.entities[ntity],this.file.entities[ntity].items.length-1);
    }

    public onTabChange(evt:MatTabChangeEvent) {
        //this.ngOnChanges()
        this.refresh();
    }

    public openCreateSection() {
        const d = this.dialog.open(EntityDialogComponent,{data:{model:this.modelList, model_taken:Object.keys(this.file.entities)}})
        d.afterClosed().subscribe(data => {
            if(data && !this.file.entities[data]) {
                this.file.entities[data] = new InitDataEntitySection(this.workbenchService,{name:data,lang:'en',data:[]});
                this.entity_index = Math.min(Math.max(this.entity_index,0),this.obk(this.file.entities).length-1);
                //@ts-expect-error
                this.refresh({index : Math.max(this.file.entities.length-1,this.entity_index)});
            }
        });
    }

    public deleteSection(name:string) {
        let rs:{[id:string]:InitDataEntitySection} = {};
        for(let instance in this.file.entities) {
            if(instance === name){
                continue;
            }
            rs[instance] = this.file.entities[instance];
        }
        this.file.entities = rs;
        this.entity_index = Math.min(this.entity_index,this.obk(this.file.entities).length-1);
    }

    public openLangEditor() {
        const ntity = this.obk(this.file.entities)[this.entity_index];
        this.dialog.open(LangPopupComponent,{data:this.file.entities[ntity],width: "50vw",height:"60vh"});
    }

    public ImportFromDB() {
        const ntity = this.obk(this.file.entities)[this.entity_index];
        const d = this.dialog.open(ImporterComponent,{data:{entity:ntity,vf:this.viewField},width:"70%", height:"80%"});
        d.afterClosed().subscribe((data:InitDataEntityInstance[]) => {
            for(let item of data) {
                item.selected = false;
                this.file.entities[ntity].items.push(item);
            }
            this.refresh();
        });
    }
}
