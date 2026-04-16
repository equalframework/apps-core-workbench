import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuTradEditorComponent } from './menu-trad-editor.component';
import { ActivatedRoute } from '@angular/router';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { QueryParamActivatorRegistry } from 'src/app/_services/query-param-activator.registry';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';

describe('MenuTradEditorComponent', () => {
  let component: MenuTradEditorComponent;
  let fixture: ComponentFixture<MenuTradEditorComponent>;

  const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
  const workbenchServiceSpy = jasmine.createSpyObj('WorkbenchService', ['getMenuTrad']);
  const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showError', 'showSuccess']);
  const jsonValidationServiceSpy = jasmine.createSpyObj('JsonValidationService', ['validate']);
  const equalComponentsProviderServiceSpy = jasmine.createSpyObj('EqualComponentsProviderService', ['areEqual']);
  const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
  const locationSpy = jasmine.createSpyObj('Location', ['back']);
  const queryParamActivatorRegistrySpy = jasmine.createSpyObj('QueryParamActivatorRegistry', ['register']);
  const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
  const queryParamNavigatorSpy = jasmine.createSpyObj('QueryParamNavigatorService', ['handleQueryParams']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuTradEditorComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: WorkbenchService, useValue: workbenchServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: JsonValidationService, useValue: jsonValidationServiceSpy },
        { provide: EqualComponentsProviderService, useValue: equalComponentsProviderServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: Location, useValue: locationSpy },
        { provide: QueryParamActivatorRegistry, useValue: queryParamActivatorRegistrySpy },
        { provide: QueryParamNavigatorService, useValue: queryParamNavigatorSpy }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTradEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
