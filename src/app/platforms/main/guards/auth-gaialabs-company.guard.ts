import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {Config} from "../config";

@Injectable({
    providedIn: 'root'
})
export class AuthGaialabsCompanyGuard  {

    constructor(
        private config: Config,
        private router: Router
    ) {
    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const user = this.config.user;
        if (user && user.gaia_admin) {
            return true;
        } else {
            const queryParams: any = {}
            if (!user.id) {
                queryParams['returnUrl'] = state.url;
                queryParams['authType'] = 'login';
            }
            this.router.navigate([user.id ? '/' : '/'], { queryParams: queryParams})
            return false;
        }
    }

}
