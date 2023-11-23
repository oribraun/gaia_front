import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse
} from '@angular/common/http';

import {catchError, Observable, tap, throwError} from 'rxjs';
import {Router} from "@angular/router";
import {Config} from "../config";

/** Pass untouched request through to the next request handler. */
@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private config: Config,
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('req', req)
        return next.handle(req).pipe(
            tap({
                next: (event: any) => {
                    if (event instanceof HttpResponse) {
                        // console.log('MyHttpInterceptor Response:', event);
                        // console.log('MyHttpInterceptor response body', event.body)
                        // console.log('MyHttpInterceptor response err', event.body.err)
                        // console.log('MyHttpInterceptor response errMessage', event.body.errMessage)
                        const body = event.body;
                        if (body && body.err && body.errMessage === 'Unauthorized platform') { // user has no platform

                        }
                        if (body && body.err && body.errMessage === 'Unauthorized') { // user not logged in
                            // user platfrom is wrong or user cookie expired
                            const queryParams: any = {}
                            queryParams['authType'] = 'login';
                            // this.router.navigate(['/'], { queryParams: queryParams})
                        }
                    }
                },
                error: (error: any) => {
                    if (error instanceof HttpErrorResponse) {
                        console.error('MyHttpInterceptor HTTP error:', error);
                    }
                }
            }),
            catchError((error: any) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    this.redirectToLogin(true);
                }
                return throwError(error);
            })
        )
    }

    redirectToLogin(resetConf=false) {
        const queryParams: any = {}
        queryParams['authType'] = 'login';
        if (resetConf) {
            this.config.resetCookies();
            this.config.resetUserCreds();
        }
        this.router.navigate(['/'], { queryParams: queryParams})
    }
}
