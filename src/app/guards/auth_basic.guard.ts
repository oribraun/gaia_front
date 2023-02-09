import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthGuard} from "./auth.guard";
import {Config} from "../config";

@Injectable({
    providedIn: 'root'
})
export class AuthBasicGuard implements CanActivate {

    constructor(
        private config: Config
    ) {
    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return this.config.user && 'role' in this.config.user && this.config.user.role !== 'Trail';
    }

}
