import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ViewService } from './_services/view.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorComponent } from '../package/_components/mixed-creator/mixed-creator.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss'],
  encapsulation : ViewEncapsulation.Emulated
})
export class ViewsComponent implements OnInit {

  selected_package:string = "";
  views_for_selected_package:string[] = [];
  selected_view:string = "";

  type:string|null
  entity:string|null

  loading = true

  constructor(
    private api:ViewService,
    private activatedRoute:ActivatedRoute,
    private router:RouterMemory,
    private matDialog:MatDialog,
    private snackBar:MatSnackBar
  ) { }

  

  async ngOnInit() {
    await this.init()
  }

  async init() {
    this.loading = true
    this.type = this.activatedRoute.snapshot.paramMap.get('type')
    this.entity = this.activatedRoute.snapshot.paramMap.get('entity')
    this.views_for_selected_package = await this.getViewForSelectedPackage()
    let args = this.router.retrieveArgs()
    if(args && args["view"]) this.onclickViewSelect(args["view"])
    this.loading = false
  }

  public async getViewForSelectedPackage():Promise<string[]> {
    let x:string[]
    if (this.type && this.entity) {
      x = await this.api.getViews(this.type,this.entity)
      
      let res:string[] = []
      for(let item  of x) {
        if(item.includes(this.entity)) res.push(item)
      }
      return res
    }
    else return []
  }

  public getBack() {
    this.router.goBack()
  }

  public onclickViewSelect(event:string) {
    this.selected_view = event
  }

  public onupdateView(event:any) {}

  public async ondeleteView(event:string) {
    let sp = event.split(":")
    let res = await this.api.deleteView(sp[0],sp[1])
    this.init()
    if(!res) this.snackBar.open("Deleted")
    else this.snackBar.open(res)
  }

  public oncreateView() {
    console.log(this.entity)
    let d = this.matDialog.open(MixedCreatorComponent,{
      data : this.type === "package" ?
        {
          type:"view",
          package: this.entity,
          lock_type : true,
          lock_package: true
        }
        :
        {
          type:"view",
          package: this.entity?.split('\\')[0],
          model : this.entity?.split("\\").slice(1).join("\\"),
          lock_type : true,
          lock_package: true,
          lock_model : true
        },width : "40em",height: "26em"
    })
    d.afterClosed().subscribe(() => {
      this.init()
    });
  }

  goto() {
    this.router.navigate(["/views_edit",this.selected_view],{"view":this.selected_view})
  }
}
