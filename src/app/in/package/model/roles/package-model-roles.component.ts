import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Action, ActionItem, Actions } from 'src/app/in/_models/actions.model';
import { PolicyItem, PolicyResponse } from 'src/app/in/_models/policy.model';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


@Component({
  selector: 'app-policy',
  templateUrl: './package-model-roles.component.html',
  styleUrls: ['./package-model-roles.component.scss']
})
export class PackageModelRoles implements OnInit, OnDestroy {
    actions$: Observable<Actions>;
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedAction: ActionItem | undefined;
    private destroy$ = new Subject<void>();

    constructor(
      private workbenchService: WorkbenchService,
      private route: ActivatedRoute,
      private location: Location
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



  }

