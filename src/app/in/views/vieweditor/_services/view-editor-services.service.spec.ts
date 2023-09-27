import { TestBed } from '@angular/core/testing';

import { ViewEditorServicesService } from './view-editor-services.service';

describe('ViewEditorServicesService', () => {
  let service: ViewEditorServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewEditorServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
