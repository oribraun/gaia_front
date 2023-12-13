import { TestBed } from '@angular/core/testing';

import { AuthIeltsPlatformGuard } from './auth-ielts-platform.guard';
import {Config} from "../config";

describe('AuthIeltsPlatformGuard', () => {
  let guard: AuthIeltsPlatformGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [Config]
    });
    guard = TestBed.inject(AuthIeltsPlatformGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
