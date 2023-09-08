import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isEqual, cloneDeep, indexOf } from 'lodash';
import { WorkbenchService } from '../../_service/package.service';

@Component({
    selector: 'app-package-info',
    templateUrl: './package-info.component.html',
    styleUrls: ['./package-info.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PackageInfoComponent implements OnInit {

    @Input() current_package:string;
    @Input() package_init_list:string[];
    @Output() onModelClick = new EventEmitter<void>();
    public current_initialised = false

    constructor(
        private snackBar: MatSnackBar,
        private api: WorkbenchService
    ) { }

    async ngOnInit() {
        this.current_initialised = this.package_init_list.indexOf(this.current_package) >= 0
    }

    public async ngOnChanges() {
        this.current_initialised = this.package_init_list.indexOf(this.current_package) >= 0
    }

    public modelOnClick() {
        console.log("catch!")
        this.onModelClick.emit()
    }
}
