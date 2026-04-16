import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionEditorComponent } from './action-editor.component';
import { ViewAction } from '../../_objects/View';
import { MatDialog } from '@angular/material/dialog';
import { PopupParamsComponent } from './_components/popup-params/popup-params.component';

describe('ActionEditorComponent', () => {
  let component: ActionEditorComponent;
  let fixture: ComponentFixture<ActionEditorComponent>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ActionEditorComponent],
      providers: [{ provide: MatDialog, useValue: matDialogSpy }]
    })
    .overrideTemplate(ActionEditorComponent, '')
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionEditorComponent);
    component = fixture.componentInstance;
    component.controllers = ['processOrder', 'cancelOrder', 'auditTrail'];
    component.obj = new ViewAction();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filtered options with empty and controller values', () => {
    component.ngOnInit();

    expect(component.filteredOptions).toEqual(['', 'processOrder', 'cancelOrder', 'auditTrail']);
  });

  it('should emit delete event when deleteMe is called', () => {
    spyOn(component.delete, 'emit');

    component.deleteMe();

    expect(component.delete.emit).toHaveBeenCalled();
  });

  it('should filter options based on controller value on tap', () => {
    component.obj.controller = 'order';

    component.tap('ignored-value');

    expect(component.filteredOptions).toEqual(['', 'processOrder', 'cancelOrder']);
  });

  it('should open custom params popup with current action data', () => {
    component.show_custom_params();

    expect(matDialogSpy.open).toHaveBeenCalledWith(PopupParamsComponent, { data: component.obj });
  });

  it('should set bigDisp to true when changeBigDispBy is called with true', () => {
    component.bigDisp = false;

    component.changeBigDispBy(true);

    expect(component.bigDisp).toBeTrue();
  });

  it('should not set bigDisp to false when changeBigDispBy is called with false', () => {
    component.bigDisp = true;

    component.changeBigDispBy(false);

    expect(component.bigDisp).toBeTrue();
  });
});
