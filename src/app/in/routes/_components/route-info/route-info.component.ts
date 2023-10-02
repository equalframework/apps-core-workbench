import { EventEmitter, Component, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EnvService } from 'sb-shared-lib';
import { WorkbenchService } from 'src/app/in/package/_service/package.service';

@Component({
  selector: 'app-route-info',
  templateUrl: './route-info.component.html',
  styleUrls: ['./route-info.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class RouteInfoComponent implements OnInit, OnChanges {

  @Input() current_route: string;
  @Input() route_info: any
  @Output() redirect = new EventEmitter<string>()
  backend_url:string = ""
  obk = Object.keys

  constructor(
    private env: EnvService,
    public dialog: MatDialog,
    public api: WorkbenchService
  ) { }

  async ngOnInit(){
    this.backend_url = (await this.env.getEnv())['backend_url']
  }

  ngOnChanges() {
    console.log(this.route_info)
  }

  sendTo(value:string) {
    let x = value.split('=')[1].split("&")[0]
    this.redirect.emit(x)
  }
}
