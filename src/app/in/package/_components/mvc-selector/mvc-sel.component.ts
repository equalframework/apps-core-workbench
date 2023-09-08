import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isEqual, cloneDeep, indexOf } from 'lodash';
import { WorkbenchService } from '../../_service/package.service';

@Component({
    selector: 'app-mvc-selector',
    templateUrl: './mvc-sel.component.html',
    styleUrls: ['./mvc-sel.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class MvcSelectorComponent implements OnInit {
    ngOnInit(): void {
        
    }
}
