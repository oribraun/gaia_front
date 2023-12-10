import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {Config} from "../../../main/config";

@Injectable({
    providedIn: 'root'
})
export class UserOnboardingGuard  {

    constructor(
        private config: Config,
        private router: Router
    ) {
    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return new Promise((resolve, reject) => {
            console.log('this.config.user_on_boarding canActivate', this.config.user_on_boarding);
            if (this.config.user_on_boarding) {
                if (this.config.user_on_boarding.finished) {
                    resolve(true);
                } else {
                    this.router.navigate(['/onBoarding']);
                }
            }
            this.config.user_on_boarding_subject.subscribe(() => {
                if (this.config.user_on_boarding && this.config.user_on_boarding.finished) {
                    resolve(true);
                }
                if (!this.config.user_on_boarding || !this.config.user_on_boarding.finished) {
                    this.router.navigate(['/onBoarding']);
                }
            });
        });
    }

}
