import { TestBed } from '@angular/core/testing';

import { AuthBasicGuard } from './auth_basic.guard';

describe('Auth.BasicGuard', () => {
  let guard: AuthBasicGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthBasicGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
