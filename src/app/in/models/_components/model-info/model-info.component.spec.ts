import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ModelInfoComponent } from './model-info.component';
import { WorkbenchService } from '../../_service/models.service';
import { of } from 'rxjs';

describe('ModelInfoComponent', () => {
  let component: ModelInfoComponent;
  let fixture: ComponentFixture<ModelInfoComponent>;
  const data = {
    name: "User",
    description: "A User object holds information and contact details about a specific user account.",
    parent: "equal\\orm\\Model",
    root: "equal\\orm\\Model",
    table: "core_user",
    link: "",
    fields: {
      id: {
        type: "integer",
        readonly: true
      },
      creator: {
          type: "many2one",
          foreign_object: "core\\User",
          default: 1
      },
      created: {
          type: "datetime",
          default: "2023-10-16T09:14:27+00:00",
          readonly: true
      },
      modifier: {
          type: "many2one",
          foreign_object: "core\\User",
          default: 1
      },
      modified: {
          type: "datetime",
          default: "2023-10-16T09:14:27+00:00",
          readonly: true
      },
      deleted: {
          type: "boolean",
          default: false
      },
      state: {
          type: "string",
          selection: [
              "draft",
              "instance",
              "archive"
          ],
          default: "instance"
      },
      name: {
          type: "computed",
          result_type: "string",
          function: "calcName",
          store: true,
          instant: true,
          description: "Display name used to refer to the user.",
          help: "Depending on the configuration (@see `USER_ACCOUNT_DISPLAYNAME`), can be either the login, the first name, the fullname, or the nickname."
      },
      login: {
          type: "string",
          usage: "email",
          required: true,
          unique: true,
          dependencies: [
              "name"
          ]
      }
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelInfoComponent);
    component = fixture.componentInstance;
    component.class_scheme = data
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
