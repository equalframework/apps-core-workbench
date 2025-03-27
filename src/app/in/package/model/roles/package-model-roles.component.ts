import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil,map } from 'rxjs/operators';
import { RoleItem, Roles } from 'src/app/in/_models/roles.model';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


@Component({
  selector: 'app-policy',
  templateUrl: './package-model-roles.component.html',
  styleUrls: ['./package-model-roles.component.scss']
})
export class PackageModelRoles implements OnInit, OnDestroy {
    roles$: Observable<Roles>;
    package_name: string = '';
    model_name: string = '';
    loading = false;
    selectedRole: RoleItem | undefined;
    private destroy$ = new Subject<void>();
    availableRoles: string[]

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
      this.roles$ = this.workbenchService.getRoles(this.package_name, this.model_name);
      this.getRolesFromApi(this.package_name, this.model_name).subscribe((data)=> this.availableRoles=data);
    }

    goBack() {
      this.location.back();
    }

    onselectRole(role: RoleItem) {
      this.selectedRole = role;
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    getRolesFromApi(package_name: string, model_name: string): Observable<string[]> {
        return this.workbenchService.getRoles(package_name, model_name).pipe(
          map((response: Roles) => {
            return Object.keys(response);
          })
        );
      }
save(){

}

public customButtonBehavior(evt: string) {
      }

  }

