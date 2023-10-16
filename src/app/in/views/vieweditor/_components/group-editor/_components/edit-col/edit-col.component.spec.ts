import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { EditColComponent } from './edit-col.component';
import { ViewColumn } from '../../../../_objects/View';

describe('EditColComponent', () => {
  let component: EditColComponent;
  let fixture: ComponentFixture<EditColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditColComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditColComponent);
    component = fixture.componentInstance;
    component.data = {col:new ViewColumn(),entity:"core\\User"}
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