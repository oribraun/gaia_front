import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {Config} from "../config";

@Injectable({
    providedIn: 'root'
})
export class AuthGaialabsCompanyGuard implements CanActivate {

    constructor(
        private config: Config,
        private router: Router
    ) {
    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const user = this.config.user;
        if (user && user.company_name && user.company_name === 'gaialabs') {
            return true;
        } else {
            const queryParams: any = {}
            if (!user.id) {
                queryParams['returnUrl'] = state.url
            }
            this.router.navigate([user.id ? '/' : '/login'], { queryParams: queryParams})
            return false;
        }
    }

}
