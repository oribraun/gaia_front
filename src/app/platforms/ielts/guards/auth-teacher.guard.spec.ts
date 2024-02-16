import { TestBed } from '@angular/core/testing';
import {Config} from "../../main/config";
import {AuthTeacherGuard} from "./auth-teacher.guard";



describe('AuthGaialabsCompanyGuard', () => {
  let guard: AuthTeacherGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [Config]
    });
    guard = TestBed.inject(AuthTeacherGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
