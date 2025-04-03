import { ButtonStateService } from './../../../_services/button-state.service';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, map, take, shareReplay, finalize } from 'rxjs/operators';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { RoleItem, RoleManager, Roles } from 'src/app/in/_models/roles.model';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-policy',
  templateUrl: './package-model-roles.component.html',
  styleUrls: ['./package-model-roles.component.scss']
})
export class PackageModelRoles implements OnInit, OnDestroy {
    roles$ = new BehaviorSubject<Roles>({});
    availableRoles$ = this.roles$.pipe(map(roles => Object.keys(roles)));
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedRole: RoleItem | undefined;
    private destroy$ = new Subject<void>();

    constructor(
      private workbenchService: WorkbenchService,
      private route: ActivatedRoute,
      private location: Location,
      private matDialog: MatDialog,
      private notificationService: NotificationService,
      public buttonStateService:ButtonStateService
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            this.package_name = params['package_name'];
            this.model_name = params['class_name'];
            this.loadRoles();
        });
    }

    private loadRoles(): void {
        this.loading = true;
        this.buttonStateService.disableButtons()
        this.workbenchService.getRoles(this.package_name, this.model_name).pipe(
            take(1),
            shareReplay(1)
        ).subscribe(roles => {
            this.roles$.next(roles);
            this.loading = false;
            this.buttonStateService.enableButtons()

        });
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
        this.buttonStateService.disableButtons();
        this.notificationService.showInfo("Saving...");
        this.export().pipe(take(1)).subscribe(exportedActions => {
          const jsonData = JSON.stringify(exportedActions);
          this.workbenchService.saveRoles(this.package_name, this.model_name, jsonData).pipe(
            take(1),
            finalize(() => this.buttonStateService.enableButtons())
          ).subscribe(
            (result) => {
              if (result.success) {
                this.notificationService.showSuccess(result.message);
              } else {
                this.notificationService.showError(result.message);
              }
            },
            (error) => {
              this.notificationService.showError("Error when saving");
            }
          );
        });
      }
    customButtonBehavior(event: string): void {
        if (event === "Show JSON") {
            this.export().pipe(take(1)).subscribe(exportedData => {
                this.matDialog.open(JsonViewerComponent, {
                    data: exportedData,
                    width: "70vw",
                    height: "80vh"
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
        this.roles$.pipe(take(1)).subscribe(roles => {
            const updatedRoles = { ...roles, [newItem.key]: { description: '', rights: [], implied_by: [] } };
            this.roles$.next(updatedRoles);

        });
    }

    deleteRole(role: RoleItem): void {
        this.roles$.pipe(take(1)).subscribe(roles => {
            const updatedRoles = { ...roles };
            delete updatedRoles[role.key];
            this.roles$.next(updatedRoles);
            this.selectedRole = undefined;
        });
    }

    refreshRoles(): void {
        this.loadRoles();
    }

    cancel(): void {
        this.loadRoles();
        this.selectedRole = undefined;
    }
}
