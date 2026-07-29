import { TestBed } from '@angular/core/testing';

import { PointsAccountService } from './points-account-service';

describe('PointsAccountService', () => {
  let service: PointsAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PointsAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
