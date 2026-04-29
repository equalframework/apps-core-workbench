import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ActionsContainerComponent } from './actions-container.component';
import { ViewAction } from '../../_objects/View';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

@Component({
  selector: 'app-action-editor',
  template: ''
})
class ActionEditorStubComponent {
  @Input() obj!: ViewAction;
  @Input() controllers!: string[];
  @Input() groups!: string[];
  @Input() packageName!: string;
  @Input() entity!: string;
  @Input() actionIndex!: number;
  @Output() delete = new EventEmitter<void>();
}

describe('ActionsContainerComponent', () => {
  let component: ActionsContainerComponent;
  let fixture: ComponentFixture<ActionsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsContainerComponent, ActionEditorStubComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsContainerComponent);
    component = fixture.componentInstance;
    component.acts = [new ViewAction()];
    fixture.detectChanges();
  });

  beforeAll(() => {
    // Deactivate teardown for these tests because of a problem with
    // the primeNg dialog.
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting(),
        {teardown: {destroyAfterEach: false}}
      );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show info label when there are no actions', () => {
    component.acts = [];
    fixture.detectChanges();

    const info = fixture.debugElement.query(By.css('.info'));
    expect(info).toBeTruthy();
    expect(info.nativeElement.textContent).toContain('No custom actions bound.');
  });

  it('should hide info label when actions exist', () => {
    component.acts = [new ViewAction()];
    fixture.detectChanges();

    const info = fixture.debugElement.query(By.css('.info'));
    expect(info).toBeFalsy();
  });

  it('should delete action from list', () => {
    const action = new ViewAction();
    component.acts = [action];
    component.del(action);
    expect(component.acts.length).toBe(0);
  });

  it('should not fail deleting action not in list', () => {
    component.acts = [];
    component.del(new ViewAction());
    expect(component.acts.length).toBe(0);
  });

  it('should create a new action', () => {
    component.acts = [];
    component.domainLabels = false;
    component.create();
    expect(component.acts.length).toBe(1);
  });

  it('should create a domainable action when domain labels are enabled', () => {
    component.acts = [];
    component.domainLabels = true;

    component.create();

    expect(component.acts.length).toBe(1);
    expect(component.acts[0]._domainable).toBeTrue();
  });

  it('should create a new action when add button is clicked', () => {
    component.acts = [];
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('.addItem'));
    addButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.acts.length).toBe(1);
  });

  it('should render one action editor for each action', () => {
    component.acts = [new ViewAction(), new ViewAction()];
    fixture.detectChanges();

    const editors = fixture.debugElement.queryAll(By.directive(ActionEditorStubComponent));
    expect(editors.length).toBe(2);
  });

  it('should pass action index and inputs to each action editor', () => {
    const first = new ViewAction();
    const second = new ViewAction();
    component.acts = [first, second];
    component.controllers = ['ctrl'];
    component.groups = ['users'];
    component.packageName = 'demo';
    component.entity = 'model.entity';
    fixture.detectChanges();

    const editors = fixture.debugElement.queryAll(By.directive(ActionEditorStubComponent));
    const firstEditor = editors[0].componentInstance as ActionEditorStubComponent;
    const secondEditor = editors[1].componentInstance as ActionEditorStubComponent;

    expect(firstEditor.obj).toBe(first);
    expect(firstEditor.controllers).toEqual(['ctrl']);
    expect(firstEditor.groups).toEqual(['users']);
    expect(firstEditor.packageName).toBe('demo');
    expect(firstEditor.entity).toBe('model.entity');
    expect(firstEditor.actionIndex).toBe(0);
    expect(secondEditor.actionIndex).toBe(1);
  });

  it('should remove action when action editor emits delete', () => {
    const first = new ViewAction();
    const second = new ViewAction();
    component.acts = [first, second];
    fixture.detectChanges();

    const editors = fixture.debugElement.queryAll(By.directive(ActionEditorStubComponent));
    const firstEditor = editors[0].componentInstance as ActionEditorStubComponent;
    firstEditor.delete.emit();
    fixture.detectChanges();

    expect(component.acts).toEqual([second]);
  });
});
