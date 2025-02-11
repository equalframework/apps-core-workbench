import { TestBed } from '@angular/core/testing';

import { WorkbenchV1Service } from './workbench-v1.service';

describe('WorkbenchV1Service', () => {
  let service: WorkbenchV1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkbenchV1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
