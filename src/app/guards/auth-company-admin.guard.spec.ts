import { TestBed } from '@angular/core/testing';

import { AuthCompanyAdminGuard } from './auth-company-admin.guard';

describe('AuthCompanyAdminGuard', () => {
  let guard: AuthCompanyAdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthCompanyAdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
