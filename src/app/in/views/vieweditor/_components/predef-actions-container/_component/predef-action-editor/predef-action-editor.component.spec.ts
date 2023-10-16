import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreDefActionEditorComponent } from './predef-action-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { ViewPreDefAction } from '../../../../_objects/View';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('PreDefActionEditorComponent', () => {
  let component: PreDefActionEditorComponent;
  let fixture: ComponentFixture<PreDefActionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreDefActionEditorComponent,MatAutocomplete ],
      imports: [MatDialogModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreDefActionEditorComponent);
    component = fixture.componentInstance;
    component.controllers = []
    component.obj = new ViewPreDefAction()
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
