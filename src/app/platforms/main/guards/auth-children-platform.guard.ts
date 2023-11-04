import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {Config} from "../config";

@Injectable({
    providedIn: 'root'
})
export class AuthChildrenPlatformGuard  {

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
        console.log('user.last_logged_platform childrens', user.last_logged_platform)
        if (user && user.last_logged_platform === 'childrens') {
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
