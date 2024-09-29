import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSectionComponent } from './edit-section.component';
import { ViewSection } from '../../../../_objects/View';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('EditSectionComponent', () => {
  let component: EditSectionComponent;
  let fixture: ComponentFixture<EditSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSectionComponent);
    component = fixture.componentInstance;
    component.data = {section: new ViewSection(), entity:"core\\User"}
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
});
