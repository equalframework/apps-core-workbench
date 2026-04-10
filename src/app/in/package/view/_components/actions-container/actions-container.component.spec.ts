import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsContainerComponent } from './actions-container.component';
import { ViewAction } from '../../_objects/View';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('ActionsContainerComponent', () => {
  let component: ActionsContainerComponent;
  let fixture: ComponentFixture<ActionsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsContainerComponent ]
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
});
