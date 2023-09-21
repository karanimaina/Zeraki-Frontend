import { TestBed } from '@angular/core/testing';

import { JointAccountService } from './joint-account.service';

describe('JointAccountService', () => {
  let service: JointAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JointAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
