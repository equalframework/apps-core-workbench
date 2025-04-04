import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, finalize, map, take, takeUntil, tap } from 'rxjs/operators';

import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { PolicyItem, PolicyManager, PolicyResponse } from 'src/app/in/_models/policy.model';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { ButtonStateService } from 'src/app/in/_services/button-state.service';
import { NotificationService } from 'src/app/in/_services/notification.service';

@Component({
  selector: 'app-policies',
  templateUrl: './package-model-policies.component.html',
  styleUrls: ['./package-model-policies.component.scss']
})
export class PackageModelPoliciesComponent implements OnInit, OnDestroy {
    policies$ = new BehaviorSubject<PolicyResponse>({});
    package_name = '';
    model_name = '';
    loading = false;
    selectedPolicy: PolicyItem | undefined;
    readonly destroy$ = new Subject<void>();

    constructor(
        private workbenchService: WorkbenchService,
        private route: ActivatedRoute,
        private location: Location,
        private matDialog: MatDialog,
        private notificationService: NotificationService,
        public buttonStateService: ButtonStateService
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => this.handleRouteParams(params));
    }

    private handleRouteParams(params: Params): void {
        this.package_name = params['package_name'];
        this.model_name = params['class_name'];
        this.loadPolicies();
        this.loading = false;
    }

    private loadPolicies(): void {
        this.loading = true;
        this.buttonStateService.disableButtons();
        this.workbenchService.getPolicies(this.package_name, this.model_name).pipe(
        take(1),
        tap(policies => this.policies$.next(policies)),
        catchError(error => {
            this.notificationService.showError('Failed to load policies : ', error);
            return of([]);
        }),
        finalize(() => {
            this.loading = false;
            this.buttonStateService.enableButtons();
        })
        ).subscribe();
    }



    goBack(): void {
        this.location.back();
    }

    onselectPolicy(policy: PolicyItem): void {
        this.selectedPolicy = policy;
        console.log('Policy:', this.selectedPolicy);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    addPolicy(newItem: PolicyItem): void {
        this.policies$.pipe(take(1)).subscribe(policies => {
        const updatedPolicies = { ...policies, [newItem.key]: { description: '', function: '' } };
        this.policies$.next(updatedPolicies);
        });
    }

    ondeletePolicy(policy: PolicyItem): void {
        this.policies$.pipe(take(1)).subscribe(policies => {
        const updatedPolicies = { ...policies };
        delete updatedPolicies[policy.key];
        this.policies$.next(updatedPolicies);
        this.selectedPolicy = undefined;
        });
    }

    customButtonBehavior(evt: string): void {
        if (evt === 'Show JSON') {
        this.export().pipe(take(1)).subscribe(exportedData => {
            this.matDialog.open(JsonViewerComponent, {
            data: exportedData,
            width: '70vw',
            height: '80vh'
            });
        });
        }
    }

    export(): Observable<PolicyResponse> {
        return this.policies$.pipe(
        take(1),
        map(policies => new PolicyManager(policies).export())
        );
    }

    refreshPolicies(): void {
        this.loading = true;
        this.workbenchService.getPolicies(this.package_name, this.model_name).pipe(
        take(1),
        catchError(error => {
            this.notificationService.showError('Failed to refresh policies');
            this.loading = false;
            return of({});
        })
        ).subscribe(policies => {
        this.policies$.next(policies);
        this.loading = false;
        });
    }

    save(): void {
        this.buttonStateService.disableButtons();
        this.notificationService.showInfo('Saving...');

        this.export().pipe(take(1)).subscribe(exportedActions => {
        const jsonData = JSON.stringify(exportedActions);

        this.workbenchService.savePolicies(this.package_name, this.model_name, jsonData).pipe(take(1)).subscribe(
            result => {
            this.buttonStateService.enableButtons();
            if (result.success) {
                this.notificationService.showSuccess(result.message);
            } else {
                this.notificationService.showError(result.message);
            }
            },
            () => {
            this.buttonStateService.enableButtons();
            this.notificationService.showError('Error when saving');
            }
        );
        });
    }

    cancel(): void {
        this.loadPolicies();
        this.selectedPolicy = undefined;
    }
}
