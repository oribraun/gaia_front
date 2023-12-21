import { TestBed } from '@angular/core/testing';

import { AuthBasicGuard } from './auth_basic.guard';
import {Config} from "../config";

describe('Auth.BasicGuard', () => {
  let guard: AuthBasicGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [Config]
    });
    guard = TestBed.inject(AuthBasicGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
