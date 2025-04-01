import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, map, take, shareReplay } from 'rxjs/operators';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { RoleItem, RoleManager, Roles, RolesSend } from 'src/app/in/_models/roles.model';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-policy',
  templateUrl: './package-model-roles.component.html',
  styleUrls: ['./package-model-roles.component.scss']
})
export class PackageModelRoles implements OnInit, OnDestroy {
    roles$ = new BehaviorSubject<Roles>({});
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedRole: RoleItem | undefined;
    private destroy$ = new Subject<void>();
    availableRoles: string[] = [];

    constructor(
      private workbenchService: WorkbenchService,
      private route: ActivatedRoute,
      private location: Location,
      private matDialog: MatDialog
    ) {}

    ngOnInit(): void {
      this.loading = true;

      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
        this.package_name = params['package_name'];
        this.model_name = params['class_name'];
        this.loading = false;
        this.loadRoles();
      });

      console.log("Package and model:", this.package_name + "\\" + this.model_name);
    }

    /**
     * Loads roles from the API and updates the BehaviorSubject.
     */
    private loadRoles(): void {
        this.loading=true;
      this.workbenchService.getRoles(this.package_name, this.model_name).pipe(
        take(1),
        shareReplay(1)
      ).subscribe(roles => {
        this.roles$.next(roles);
        this.availableRoles = Object.keys(roles);
        this.loading=false;
      });
    }

    goBack(): void {
      this.location.back();
    }

    onselectRole(role: RoleItem): void {
      this.selectedRole = role;
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    /**
     * Saves the current roles to the API.
     */
    save(): void {
      this.export().pipe(take(1)).subscribe(exportedActions => {
        const jsonData = JSON.stringify(exportedActions);
        this.workbenchService.saveRoles(this.package_name, this.model_name, jsonData);
      });
    }

    /**
     * Opens a JSON viewer dialog with the exported roles.
     * @param evt The event string (e.g., "Show JSON").
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
     * Exports roles using RoleManager.
     * @returns An observable containing the formatted roles.
     */
    public export(): Observable<any> {
        return this.roles$.pipe(
            take(1),
            map(roles => new RoleManager(roles).export())
        );
    }

    /**
     * Adds a new role to the BehaviorSubject.
     * @param newItem The role item to add.
     */
    addRole(newItem: RoleItem): void {
        this.roles$.pipe(take(1)).subscribe(roles => {
            const updatedRoles = { ...roles, [newItem.key]: {'description':'','rights':[],'implied_by':[]} };
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
      this.loading = true;
     this.loadRoles()
    }


}
