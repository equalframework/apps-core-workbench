import { TestBed } from '@angular/core/testing';

import { ViewEditorServicesService } from './view-editor-services.service';
import { SharedLibModule } from 'sb-shared-lib';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewEditorServicesService', () => {
  let service: ViewEditorServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports : [SharedLibModule],
      providers : [TranslateFakeLoader]
    });
    service = TestBed.inject(ViewEditorServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
