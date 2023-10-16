import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouteInfoComponent } from './route-info.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedLibModule } from 'sb-shared-lib';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('RouteInfoComponent', () => {
  let component: RouteInfoComponent;
  let fixture: ComponentFixture<RouteInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule,SharedLibModule],
      declarations: [ RouteInfoComponent ],
      providers : [TranslateFakeLoader]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteInfoComponent);
    component = fixture.componentInstance; 
    component.route_info = {
      "methods" : {
        "GET": {
          "description": "Redirects to eQual welcome screen.",
          "operation": "?show=core_discord"
        },
      },
      "info": {
        "package" : "core",
        "file" : "file"
      }
    }

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
