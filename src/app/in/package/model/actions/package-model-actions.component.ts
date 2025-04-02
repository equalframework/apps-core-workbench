import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { Action, ActionItem, ActionManager, Actions } from 'src/app/in/_models/actions.model';
import { PolicyItem, PolicyResponse } from 'src/app/in/_models/policy.model';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-policy',
  templateUrl: './package-model-actions.component.html',
  styleUrls: ['./package-model-actions.component.scss']
})
export class PackageModelActions implements OnInit, OnDestroy {
    actions$ = new BehaviorSubject<Actions>({});
    availablePolicies$ = new BehaviorSubject<string[]>([]);
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedAction: ActionItem | undefined;
    private destroy$ = new Subject<void>();
    loadingState = {
        actions: false,
        policies: false
    };

    constructor(
      private workbenchService: WorkbenchService,
      private route: ActivatedRoute,
      private location: Location,
      private matDialog: MatDialog,
      private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
      this.loading = true;
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
        this.package_name = params['package_name'];
        this.model_name = params['class_name'];
        this.loading = false;
        this.loadActions();
        this.loadPolicies();
      });

      console.log("Package and model:", this.package_name + "\\" + this.model_name);
    }

    /**
     * Loads the actions from the API and updates the BehaviorSubject.
     */
    private loadActions(): void {
        this.loadingState.actions = true;
      this.workbenchService.getActions(this.package_name, this.model_name).pipe(
        take(1)
      ).subscribe(actions => {
        this.actions$.next(actions);
        this.loadingState.actions = false;
      });
    }

    /**
     * Loads the available policies from the API and updates the BehaviorSubject.
     */
    private loadPolicies(): void {
        this.loadingState.policies = true;
        this.workbenchService.getPolicies(this.package_name, this.model_name).pipe(
            take(1),
            map((response: PolicyResponse) => Object.keys(response))
        ).subscribe(policies => {
            this.availablePolicies$.next(policies);
            this.loadingState.policies = false;
        });
    }

    goBack(): void {
        this.location.back();
    }

    onselectAction(action: ActionItem): void {
        this.selectedAction = action;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Saves the current actions by sending them to the API.
     */
    save(): void {
        this.export().pipe(take(1)).subscribe(exportedActions => {
            const jsonData = JSON.stringify(exportedActions);
            this.workbenchService.saveActions(this.package_name, this.model_name, jsonData).pipe(take(1)).subscribe(
                (result) => {
                    result.success ? this.notificationService.showSuccess(result.message) : this.notificationService.showError(result.message);
                }
            );
        });
    }

    /**
     * Adds a new action to the current state.
     * @param newItem The item to be added.
     */
    addAction(newItem: ActionItem): void {
        this.actions$.pipe(take(1)).subscribe(actions => {
            const updatedActions = { ...actions, [newItem.key]: {'description':'','policies':[],'function':''} };
            this.actions$.next(updatedActions);
        });
    }

    /**
     * Deletes an action from the current state.
     * @param action The action to be deleted.
     */
    ondeleteAction(action: ActionItem): void {
        this.actions$.pipe(take(1)).subscribe(actions => {
            const updatedActions = { ...actions };
            delete updatedActions[action.key];
            this.actions$.next(updatedActions);
            this.selectedAction = undefined;
        });
    }

    /**
     * Displays the actions as JSON.
     * @param evt The triggering event.
     */
    public customButtonBehavior(evt: string): void {
        if (evt === "Show JSON") {
            this.export().pipe(take(1)).subscribe(exportedData => {
                this.matDialog.open(JsonViewerComponent, {
                    data: exportedData,
                    width: "70vw",
                    height: "80vh"
                });
            });
        }
    }

    /**
     * Exports the actions to the required format.
     * @returns An observable containing the exported actions.
     */
    public export(): Observable<Actions> {
        return this.actions$.pipe(
            take(1),
            map(actions => new ActionManager(actions).export())
        );
    }

    /**
     * Refreshes the list of actions by reloading them from the API.
     */
    refreshAction(): void {
      this.loadingState.actions = true;
      this.workbenchService.getActions(this.package_name, this.model_name).pipe(take(1)).subscribe(actions => {
          this.actions$.next(actions);
          this.loadingState.actions = false;
      });
    }

    /**
     * Refreshes the list of available policies by reloading them from the API.
     */
    refreshPolicies(): void {
      this.loadingState.policies = true;
      this.workbenchService.getPolicies(this.package_name, this.model_name).pipe(take(1)).subscribe(response => {
          const policies = Object.keys(response);
          this.availablePolicies$.next(policies);
          this.loadingState.policies = false;
      });
    }

    /**
     * Cancel all the changes on reloading
     */
    cancel(){
        this.loadActions();
        this.loadPolicies();
    }
}
