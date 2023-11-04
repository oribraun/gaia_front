import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {Config} from "../config";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard  {

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
        if (this.config.user && this.config.user.id) {
            return true;
        } else {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }})
            return false;
        }
    }

}
