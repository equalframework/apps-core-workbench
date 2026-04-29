import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverlayModule } from '@angular/cdk/overlay';
import { FileSaverComponent } from './file-saver.component';

describe('FileSaverComponent', () => {
  let component: FileSaverComponent;
  let fixture: ComponentFixture<FileSaverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileSaverComponent ],
      imports: [ HttpClientTestingModule, TranslateModule.forRoot(), OverlayModule ],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: { fileName: 'test.txt', fileContent: 'Test content' } },
        MatSnackBar
      ]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSaverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
