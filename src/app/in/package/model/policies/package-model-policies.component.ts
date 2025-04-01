import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { PolicyItem, PolicyManager, PolicyResponse } from 'src/app/in/_models/policy.model';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-policy',
  templateUrl: './package-model-policies.component.html',
  styleUrls: ['./package-model-policies.component.scss']
})
export class PackageModelPolicies implements OnInit, OnDestroy {
    policies$ = new BehaviorSubject<PolicyResponse>({});
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedPolicy: PolicyItem | undefined;
    private destroy$ = new Subject<void>();

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
        this.loadPolicies();
      });

      console.log("Package and model:", this.package_name + "\\" + this.model_name);
    }

    /**
     * Loads the policies from the API and updates the BehaviorSubject.
     */
    private loadPolicies(): void {
      this.workbenchService.getPolicies(this.package_name, this.model_name).pipe(
        take(1)
      ).subscribe(policies => {
        this.policies$.next(policies);
      });
    }

    goBack(): void {
      this.location.back();
    }

    onselectPolicy(policy: PolicyItem): void {
      this.selectedPolicy = policy;
      console.log("Policy : ", this.selectedPolicy);
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    /**
     * Adds a new policy.
     * @param newItem The item to be added.
     */
    addPolicy(newItem: PolicyItem): void {
        this.policies$.pipe(take(1)).subscribe(policies => {
            const updatedPolicies = { ...policies, [newItem.key]: {'description':'', 'function':''} };
            this.policies$.next(updatedPolicies);
        });
    }

    /**
     * Deletes a policy.
     * @param policy The policy to be deleted.
     */
    ondeletePolicy(policy: PolicyItem): void {
      this.policies$.pipe(take(1)).subscribe(policies => {
          const updatedPolicies = { ...policies };
          delete updatedPolicies[policy.key];
          this.policies$.next(updatedPolicies);
          this.selectedPolicy = undefined;
      });
    }

    /**
     * Displays the policies as JSON.
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
     * Exports the policies.
     * @returns An observable containing the exported policies.
     */
    public export(): Observable<PolicyResponse> {
        return this.policies$.pipe(
            take(1),
            map(policies => new PolicyManager(policies).export())
        );
    }

    /**
     * Refreshes the list of policies by reloading them from the API.
     */
    refreshPolicies(): void {
      this.loading = true;
      this.workbenchService.getPolicies(this.package_name, this.model_name).pipe(take(1)).subscribe(policies => {
          this.policies$.next(policies);
          this.loading = false;
      });
    }

    /**
     * Saves the current policies by sending them to the API.
     */
    save(): void {
      this.export().pipe(take(1)).subscribe(exportedActions => {
          const jsonData = JSON.stringify(exportedActions);
          this.workbenchService.savePolicies(this.package_name, this.model_name, jsonData);
      });
    }
}
