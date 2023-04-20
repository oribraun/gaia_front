import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {Config} from "../config";

@Injectable({
    providedIn: 'root'
})
export class AuthCompanyAdminGuard implements CanActivate {

    constructor(
        private config: Config,
        private router: Router
    ) {
    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        // this.config.user_subject.subscribe((user) => {
        //     if (this.config.user) {
        //         return true;
        //     } else {
        //         this.router.navigate([''])
        //         return false;
        //     }
        // })
        // return true
        const user = this.config.user;
        if (user && user.company_admin) {
            return true;
        } else {
            this.router.navigate([user.id ? '/' : '/login'], { queryParams: { returnUrl: state.url }})
            return false;
        }
    }

}
