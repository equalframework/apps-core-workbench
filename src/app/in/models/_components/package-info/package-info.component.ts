import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isEqual, cloneDeep, indexOf } from 'lodash';
import { FieldClassArray } from '../../_object/FieldClassArray';
import { FieldClass } from '../../_object/FieldClass';

@Component({
    selector: 'app-package-info',
    templateUrl: './package-info.component.html',
    styleUrls: ['./package-info.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PackageInfoComponent implements OnInit {

    @Input() current_package:string;
    @Input() package_list:string[];
    init_package:string[];


    constructor(
        private snackBar: MatSnackBar
    ) { }

    async ngOnInit() {
    }

    public ngOnChanges() {
    }
}
