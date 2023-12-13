import { TestBed } from '@angular/core/testing';

import { AuthChildrenPlatformGuard } from './auth-children-platform.guard';
import {Config} from "../config";

describe('AuthChildrenPlatformGuard', () => {
  let guard: AuthChildrenPlatformGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [Config]
    });
    guard = TestBed.inject(AuthChildrenPlatformGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
