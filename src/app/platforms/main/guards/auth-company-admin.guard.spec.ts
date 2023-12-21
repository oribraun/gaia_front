import { TestBed } from '@angular/core/testing';

import { AuthCompanyAdminGuard } from './auth-company-admin.guard';
import {Config} from "../config";

describe('AuthCompanyAdminGuard', () => {
  let guard: AuthCompanyAdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [Config]
    });
    guard = TestBed.inject(AuthCompanyAdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
