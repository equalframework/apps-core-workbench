import { NotificationService } from './../../_services/notification.service';
import { Location } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InitDataFile } from './_models/init-data';
import { cloneDeep } from 'lodash';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkbenchService } from '../../_services/workbench.service';

@Component({
    selector: 'app-init-data',
    templateUrl: './init-data.component.html',
    styleUrls: ['./init-data.component.scss']
})
export class InitDataComponent implements OnInit, OnDestroy {

    // Subject for unsubscribing when the component is destroyed
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    // Pour itérer sur les clés d'un objet dans le template
    public objectKeys = Object.keys;

    public package_name: string = '';

    // 'init' | 'demo'
    public data_type: string = 'init';

    public dataScheme: any;

    public fileList: InitDataFile[] = [];

    public error: boolean = false;
    public loading: boolean = true;

    public selected_file_index: number = 0;

    constructor(
        private workbenchService: WorkbenchService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private snack: MatSnackBar,
        private location: Location,
        private notificationService:NotificationService
    ) {}

    async ngOnInit(): Promise<void> {
        this.initializeComponent();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Initializes the component by subscribing to route parameters and loading initial data.
     */
    public async initializeComponent(): Promise<void> {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
            this.package_name = params['package_name'];
            this.data_type = params['type'];
            await this.loadInitialData();
        });
    }

    /**
     * Loads the initial data for the package based on the data type (init or demo).
     */
    private async loadInitialData(): Promise<void> {
        try {
            this.loading = true;
            this.fileList = [];

            this.dataScheme = await this.workbenchService.getInitData(this.package_name, this.data_type);

            for (const key in this.dataScheme) {
                if (this.dataScheme.hasOwnProperty(key)) {
                    try {
                        const initFile = new InitDataFile(this.workbenchService, key, Object.assign(this.dataScheme[key]));
                        this.fileList.push(initFile);
                    } catch (error) {
                        console.error(`Error processing data for key "${key}":`, error);
                        this.error = true;
                        return;
                    }
                }
            }
            this.fileList= [...this.fileList]

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.error = true;
        } finally {
            this.loading = false;
        }
    }


    /**
     * Exports the current initialization data.
     */
    public exportData(): { [id: string]: any } {
        const exportResult: { [id: string]: any } = {};
        for (const file of this.fileList) {
            exportResult[file.name] = file.export();
        }
        return exportResult;
    }

    /**
     * Opens a dialog displaying the JSON representation of the exported data.
     */
    public showJsonDialog(): void {
        this.dialog.open(JsonViewerDialog, {
            data: this.exportData(),
            width: '70vw',
            height: '80vh'
        });
    }

    /**
     * Saves the current initialization data.
     */
    public async saveData(): Promise<void> {
        try {
            const result = await this.workbenchService.updateInitData(
                this.package_name,
                this.data_type,
                JSON.stringify(this.exportData())
            );
            if (result) {
                this.snack.open('Saved successfully', 'INFO');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            this.snack.open('Error saving data', 'ERROR');
        }
    }

    /**
     * Navigates back to the previous location.
     */
    public goBack(): void {
        this.location.back();
    }

    async cancel() {
        this.notificationService.showInfo("Canceling...");

        try {
            await this.loadInitialData();
            this.notificationService.showSuccess("Canceled");
        } catch (error) {
            this.notificationService.showError("Error occurred while canceling.");
        } finally {
            this.loading = false;
        }
    }

}

@Component({
    selector: 'json-viewer-dialog',
    template: `<pre [innerHtml]="formattedJson"></pre>`
})
export class JsonViewerDialog implements OnInit {
    constructor(
        @Optional() public dialogRef: MatDialogRef<JsonViewerDialog>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}

    ngOnInit(): void {}

    /**
     * Returns a formatted JSON string for display.
     */
    get formattedJson(): string {
        return prettyPrintJson.toHtml(this.data);
    }
}
