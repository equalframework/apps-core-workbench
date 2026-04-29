import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { Component, OnDestroy, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, map, take, takeUntil, tap } from 'rxjs/operators';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { Action, ActionItem, ActionManager, Actions } from 'src/app/in/_models/actions.model';
import { PolicyItem, PolicyResponse } from 'src/app/in/_models/policy.model';
import { ButtonStateService } from 'src/app/in/_services/button-state.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { cloneDeep } from 'lodash';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Component({
  selector: 'app-package-model-actions',
  templateUrl: './package-model-actions.component.html',
  styleUrls: ['./package-model-actions.component.scss']
})
export class PackageModelActionsComponent implements OnInit, OnDestroy {
    actions$ = new BehaviorSubject<Actions>({});
    availablePolicies$ = new BehaviorSubject<string[]>([]);
    packageName = '';
    modelName = '';
    loading = false;
    selectedAction: ActionItem | undefined;
    public isSaving = false;
    private destroy$ = new Subject<void>();
    loadingState = {
        actions: false,
        policies: false
    };
    private backgroundPreloadStarted = false;

    constructor(
      private workbenchService: WorkbenchService,
      private route: ActivatedRoute,
      private location: Location,
      private matDialog: MatDialog,
      private notificationService: NotificationService,
      public buttonStateService: ButtonStateService,
      private jsonValidationService: JsonValidationService,
      private provider: EqualComponentsProviderService,
      private injector: Injector,
    ) {}

    ngOnInit(): void {
      this.loading = true;
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
        this.packageName = params.package_name;
        this.modelName = params.class_name;
        this.loading = false;
        this.loadActions();
        this.loadPolicies();
        void this.fetchBackgroundData();
      });

    }

    private async fetchBackgroundData(): Promise<void> {
        if (this.backgroundPreloadStarted) {
            return;
        }

        this.backgroundPreloadStarted = true;

        try {
            // Lazy-resolve provider so its constructor-triggered preload starts only in phase 3.
            if (!this.provider) {
                this.provider = this.injector.get(EqualComponentsProviderService);
            }
        } catch (err) {
            console.error('Error during background data fetching', err);

        }
    }

    /**
     * Loads the actions from the API and updates the BehaviorSubject.
     */
    private loadActions(): void {
        this.loadingState.actions = true;
        this.buttonStateService.disableButtons();

        this.workbenchService.getActions(this.packageName, this.modelName).pipe(
          take(1),
          tap(actions => this.actions$.next(actions)),
          catchError(() => {
            this.notificationService.showError('Failed to load actions');
            return of([]);
          }),
          finalize(() => {
            this.loadingState.actions = false;
            this.buttonStateService.enableButtons();
          })
        ).subscribe();
      }


    /**
     * Loads the available policies from the API and updates the BehaviorSubject.
     */
    private loadPolicies(): void {
        this.loadingState.policies = true;
        this.workbenchService.getPolicies(this.packageName, this.modelName).pipe(
          take(1),
          map((response: PolicyResponse) => Object.keys(response)),
          tap(policies => this.availablePolicies$.next(policies)),
          catchError(() => {
            this.notificationService.showError('Failed to load policies');
            return of([]);
          }),
          finalize(() => {
            this.loadingState.policies = false;
          })
        ).subscribe();
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
      this.export().pipe(take(1)).subscribe(exportedActions => this.saveExportedActions(exportedActions));
    }

    private async saveExportedActions(exportedActions: Actions): Promise<void> {
      const jsonData = JSON.stringify(exportedActions);
      let modelPayloadForValidation: any;

      try {
        modelPayloadForValidation = await this.buildModelPayloadWithActions(exportedActions);
      } catch (error) {
        this.notificationService.showError('Error while fetching model schema for actions validation.');
        return;
      }

      this.jsonValidationService.validateAndSave(
        this.jsonValidationService.validateBySchemaType(modelPayloadForValidation, 'urn:equal:json-schema:core:model', this.packageName),
        () => this.workbenchService.saveActions(this.packageName, this.modelName, jsonData),
        (saving) => this.isSaving = saving
      );
    }

    private async buildModelPayloadWithActions(actionsPayload: Actions): Promise<any> {
      const entity = `${this.packageName}\\${this.modelName}`;
      const latestModelSchema = await this.workbenchService.getSchema(entity).toPromise();
      const modelPayload = cloneDeep(latestModelSchema || {});
      modelPayload.actions = actionsPayload;
      return modelPayload;
    }

    /**
     * Adds a new action to the current state.
     * @param newItem The item to be added.
     */
    addAction(newItem: ActionItem): void {
        this.actions$.pipe(take(1)).subscribe(actions => {
            const updatedActions = { ...actions, [newItem.key]: {description: '', policies: [], function: ''} };
            this.actions$.next(updatedActions);
        });
    }

    /**
     * Deletes an action from the current state.
     * @param action The action to be deleted.
     */
    onDeleteAction(action: ActionItem): void {
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
        this.loadActions();
    }

    /**
     * Refreshes the list of available policies by reloading them from the API.
     */
    refreshPolicies(): void {
        this.loadPolicies();
    }

    /**
     * Cancel all the changes on reloading
     */
    cancel(): void{
        this.loadActions();
        this.loadPolicies();
        this.selectedAction = undefined;
    }
}
