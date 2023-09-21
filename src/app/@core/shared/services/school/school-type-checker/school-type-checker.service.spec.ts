import { TestBed } from '@angular/core/testing';

import { SchoolTypeCheckerService } from './school-type-checker.service';

describe('SchoolTypeCheckerService', () => {
  let service: SchoolTypeCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchoolTypeCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
