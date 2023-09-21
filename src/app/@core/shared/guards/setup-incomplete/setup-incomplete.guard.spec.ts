import { TestBed } from '@angular/core/testing';

import { SetupIncompleteGuard } from './setup-incomplete.guard';

describe('SetupIncompleteGuard', () => {
  let guard: SetupIncompleteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SetupIncompleteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
