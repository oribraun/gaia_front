import { TestBed } from '@angular/core/testing';

import { AuthGaialabsCompanyGuard } from './auth-gaialabs-company.guard';
import {Config} from "../config";

describe('AuthGaialabsCompanyGuard', () => {
  let guard: AuthGaialabsCompanyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [Config]
    });
    guard = TestBed.inject(AuthGaialabsCompanyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
