import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InitSidepaneComponent } from './init-sidepane.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';

describe('InitSidepaneComponent', () => {
  let component: InitSidepaneComponent;
  let fixture: ComponentFixture<InitSidepaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitSidepaneComponent ],
      imports: [ TranslateModule.forRoot(), HttpClientTestingModule ],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: OverlayModule, useValue: {} }
      ]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitSidepaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
