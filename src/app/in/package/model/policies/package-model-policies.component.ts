import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PolicyItem, PolicyResponse } from 'src/app/in/_models/policy.model';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


@Component({
  selector: 'app-policy',
  templateUrl: './package-model-policies.component.html',
  styleUrls: ['./package-model-policies.component.scss']
})
export class PackageModelPolicies implements OnInit, OnDestroy {
    policies$: Observable<PolicyResponse>;
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedPolicy: PolicyItem | undefined;
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
      this.policies$ = this.workbenchService.getPolicies(this.package_name, this.model_name);
    }

    goBack() {
      this.location.back();
    }

    onselectPolicy(policy: PolicyItem) {
      //this.selectedPolicyIndex = index;
      //console.log("this.selectedPOlicyIndex", this.selectedPolicyIndex)
      this.selectedPolicy = policy;
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    addPolicy(newItem: PolicyItem) {
        this.policies$.pipe(take(1)).subscribe(policies => {
          const updatedPolicies = { ...policies, [newItem.key]: { description: '', function: '' } };
          this.policies$ = of(updatedPolicies);
        });
      }

  }

