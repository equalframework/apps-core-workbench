import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { Action, ActionItem, ActionManager, Actions } from 'src/app/in/_models/actions.model';
import { PolicyItem, PolicyResponse } from 'src/app/in/_models/policy.model';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


@Component({
  selector: 'app-policy',
  templateUrl: './package-model-actions.component.html',
  styleUrls: ['./package-model-actions.component.scss']
})
export class PackageModelActions implements OnInit, OnDestroy {
    actions$: Observable<Actions>;
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedAction: ActionItem | undefined;
    private destroy$ = new Subject<void>();
    availablePolicies$: Observable<string[]>;
    loadingState = {
        actions: false,
        policies: false
    };
    constructor(
      private workbenchService: WorkbenchService,
      private route: ActivatedRoute,
      private location: Location,
    private matDialog:MatDialog
    ) {}

    ngOnInit(): void {
      this.loading = true;
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
        this.package_name = params['package_name'];
        this.model_name = params['class_name'];
        this.loading = false;
      });
      console.log("package and model : ", this.package_name + "\\" + this.model_name);
      this.actions$ = this.workbenchService.getActions(this.package_name, this.model_name);
      this.availablePolicies$ = this.getPoliciesFromApi(this.package_name, this.model_name);

    }

    goBack() {
      this.location.back();
    }

    onselectAction(action: ActionItem) {
      //this.selectedPolicyIndex = index;
      //console.log("this.selectedPOlicyIndex", this.selectedPolicyIndex)
      this.selectedAction = action;
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    save() {
        console.log("saved");

        this.export().pipe(take(1)).subscribe(exportedActions => {
            const jsonData = JSON.stringify(exportedActions);
            this.workbenchService.saveActions(this.package_name, this.model_name, jsonData);
        });
    }
    addAction(newItem: ActionItem) {
        this.actions$.pipe(take(1)).subscribe(actions => {
          const updatedActions = { ...actions, [newItem.key]: { description: '', policies: [], function: '' } };
          this.actions$ = of(updatedActions);
        });
      }


    public customButtonBehavior(evt: string) {
        switch (evt) {
          case "Show JSON":
            this.export().subscribe(exportedData => {
              this.matDialog.open(JsonViewerComponent, {
                data: exportedData,
                width: "70vw",
                height: "80vh"
              });
            });
            break;
        }
      }

    public export(): Observable<Actions> {
        return this.actions$.pipe(
            take(1),
            map(actions => {
            const actionManager = new ActionManager(actions)
            return actionManager.export()
            })
        );
    }

    getPoliciesFromApi(package_name: string, model_name: string): Observable<string[]> {
        return this.workbenchService.getPolicies(package_name, model_name).pipe(
        map((response: PolicyResponse) => {
            return Object.keys(response);
        })
        );
    }

    ondeleteAction(action: ActionItem): void {
        this.actions$.pipe(take(1)).subscribe(actions => {
        const updatedActions = { ...actions };
        delete updatedActions[action.key];
        this.actions$ = of(updatedActions);
        this.selectedAction = undefined;
        });
    }

    refreshAction(){
        this.loadingState.actions = true;
        this.actions$ = this.workbenchService.getActions(this.package_name, this.model_name);
        this.actions$.pipe(take(1)).subscribe(() => {
            this.loadingState.actions = false;
        });
    }

    refreshPolicies(){
        this.loadingState.policies=true;
        this.availablePolicies$ = this.getPoliciesFromApi(this.package_name, this.model_name);
        this.availablePolicies$.pipe(take(1)).subscribe(() => {
            this.loadingState.policies = false;
        });
    }




}

