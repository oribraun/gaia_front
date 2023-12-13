import { TestBed } from '@angular/core/testing';

import { UserOnboardingGuard } from './on-boarding.guard';
import {Config} from "../../main/config";

describe('UserOnboardingGuard', () => {
  let guard: UserOnboardingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [Config]
    });
    guard = TestBed.inject(UserOnboardingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
