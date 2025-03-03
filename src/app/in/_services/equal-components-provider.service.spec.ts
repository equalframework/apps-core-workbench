import { TestBed } from '@angular/core/testing';

import { EqualComponentsProviderService } from './equal-components-provider.service';

describe('EqualComponentsProviderService', () => {
  let service: EqualComponentsProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EqualComponentsProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
