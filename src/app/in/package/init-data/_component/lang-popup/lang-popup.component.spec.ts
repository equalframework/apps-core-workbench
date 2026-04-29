import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InitDataEntitySection } from '../../_models/init-data';
import { LangPopupComponent } from './lang-popup.component';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

describe('LangPopupComponent', () => {
  let component: LangPopupComponent;
  let fixture: ComponentFixture<LangPopupComponent>;

  beforeEach(async () => {
    const mockWorkbenchService = jasmine.createSpyObj('WorkbenchService', ['getSchema']);
    mockWorkbenchService.getSchema.and.returnValue({
      pipe: jasmine.createSpy('pipe').and.returnValue({
        subscribe: jasmine.createSpy('subscribe').and.callFake(({next}) => {
          next();
        })
      })
    });

    const mockData = {
      allUsedLangs: ['en', 'de'],
      addLang: jasmine.createSpy('addLang'),
      RenameLang: jasmine.createSpy('RenameLang'),
      removeLang: jasmine.createSpy('removeLang')
    };

    await TestBed.configureTestingModule({
      declarations: [ LangPopupComponent ],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: WorkbenchService, useValue: mockWorkbenchService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LangPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
