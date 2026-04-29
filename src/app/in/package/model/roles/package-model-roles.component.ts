import { ButtonStateService } from './../../../_services/button-state.service';
import { KeyValue, Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { Component, OnDestroy, OnInit, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { takeUntil, map, take, shareReplay, finalize, tap, catchError } from 'rxjs/operators';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { RoleItem, RoleManager, Roles } from 'src/app/in/_models/roles.model';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { cloneDeep } from 'lodash';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Component({
    selector: 'app-roles',
    templateUrl: './package-model-roles.component.html',
    styleUrls: ['./package-model-roles.component.scss']
  })
  export class PackageModelRolesComponent implements OnInit, OnDestroy {
    readonly roles$ = new BehaviorSubject<Roles>({});
    readonly availableRoles$ = this.roles$.pipe(map(roles => Object.keys(roles)));
    packageName = '';
    modelName = '';
    loading = false;
    selectedRole?: RoleItem;
    private readonly destroy$ = new Subject<void>();
    public isSaving = false;
    private backgroundPreloadStarted = false;

    constructor(
      private workbenchService: WorkbenchService,
      private route: ActivatedRoute,
      private location: Location,
      private matDialog: MatDialog,
      private notificationService: NotificationService,
      public buttonStateService: ButtonStateService,
      private routerMemory: RouterMemory,
      private jsonValidationService: JsonValidationService,
      private provider: EqualComponentsProviderService,
      private injector: Injector,
    ) {}

    ngOnInit(): void {
      this.handleRouteParams();
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

    goBack(): void {
      this.location.back();
    }

    selectRole(role: RoleItem): void {
      this.selectedRole = role;
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    save(): void {
        this.disableButtonsAndShowNotification();
        this.export().pipe(take(1)).subscribe({
          next: exportedActions => this.saveExportedActions(exportedActions),
          error: () => this.handleError(),
        });
    }


    customButtonBehavior(event: string): void {
      if (event === 'Show JSON') {
        this.export().pipe(take(1)).subscribe(exportedData => {
          this.matDialog.open(JsonViewerComponent, {
            data: exportedData,
            width: '70vw',
            height: '80vh'
          });
        });
      }
    }

    export(): Observable<any> {
      return this.roles$.pipe(
        take(1),
        map(roles => new RoleManager(roles).export())
      );
    }

    addRole(newItem: RoleItem): void {
      const roles = this.roles$.value;
      const updatedRoles = {
        ...roles,
        [newItem.key]: { description: '', rights: [], implied_by: [] }
      };
      this.roles$.next(updatedRoles);
    }

    deleteRole(role: RoleItem): void {
      const roles = { ...this.roles$.value };
      delete roles[role.key];
      this.roles$.next(roles);
      this.selectedRole = undefined;
    }

    refreshRoles(): void {
      this.loadRoles();
    }

    cancel(): void {
      this.loadRoles();
      this.selectedRole = undefined;
    }

    private handleRouteParams(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
          this.packageName = this.route.parent ? this.route.parent?.snapshot.paramMap.get('package_name') : params['package_name'];
          this.modelName = this.route.parent ? this.route.parent?.snapshot.paramMap.get('class_name') : params['class_name'];
          this.loadRoles();
          void this.fetchBackgroundData();
        });
    }

    private loadRoles(): void {
        this.loading = true;
        this.buttonStateService.disableButtons();

        this.workbenchService.getRoles(this.packageName, this.modelName).pipe(
          take(1),
          tap(roles => this.roles$.next(roles)),
          catchError(() => {
            this.notificationService.showError('Failed to load roles');
            return of([]);
          }),
          finalize(() => {
            this.loading = false;
            this.buttonStateService.enableButtons();
          })
        ).subscribe();
      }


    private disableButtonsAndShowNotification(): void {
        this.buttonStateService.disableButtons();
        this.notificationService.showInfo('Saving...');
    }

    private async saveExportedActions(exportedActions: any): Promise<void> {
      const jsonData = JSON.stringify(exportedActions);
      let modelPayloadForValidation: any;

      try {
        modelPayloadForValidation = await this.buildModelPayloadWithRoles(exportedActions);
      } catch (error) {
        this.notificationService.showError('Error while fetching model schema for roles validation.');
        return;
      }

      this.jsonValidationService.validateAndSave(
        this.jsonValidationService.validateBySchemaType(modelPayloadForValidation, 'urn:equal:json-schema:core:model', this.packageName),
        () => this.workbenchService.saveRoles(this.packageName, this.modelName, jsonData),
        (saving) => this.isSaving = saving
      );
    }

    private async buildModelPayloadWithRoles(rolesPayload: any): Promise<any> {
      const entity = `${this.packageName}\\${this.modelName}`;
      const latestModelSchema = await this.workbenchService.getSchema(entity).toPromise();
      const modelPayload = cloneDeep(latestModelSchema || {});
      modelPayload.roles = rolesPayload;
      return modelPayload;
    }

    private handleSaveResponse(result: any): void {
        if (result.success) {
            this.notificationService.showSuccess(result.message);
        } else {
            this.notificationService.showError(result.message);
        }
    }

    private handleError(): void {
        this.notificationService.showError('Error when saving');
    }

  }

