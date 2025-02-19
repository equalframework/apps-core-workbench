import { Location } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { InitDataFile } from './_models/init-data';
import { cloneDeep } from 'lodash';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
        private api: EmbeddedApiService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private snack: MatSnackBar,
        private location: Location
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
            this.dataScheme = await this.api.getInitData(this.package_name, this.data_type);
            for (const key in this.dataScheme) {
                if (this.dataScheme.hasOwnProperty(key)) {
                    try {
                        const initFile = new InitDataFile(this.api, key, cloneDeep(this.dataScheme[key]));
                        this.fileList.push(initFile);
                    } catch (error) {
                        console.error(`Error processing data for key "${key}":`, error);
                        this.error = true;
                        return;
                    }
                }
            }
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
            const result = await this.api.updateInitData(
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
