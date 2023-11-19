import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
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
        const request = next.handle(req);
        request.subscribe({
            next: (response: any) => {
                // console.log('MyHttpInterceptor response1', response)
                // console.log('MyHttpInterceptor response1 body', response.body)
                // console.log('MyHttpInterceptor response1 err', response.body.err)
                // console.log('MyHttpInterceptor response1 errMessage', response.body.errMessage)
                if (response.body && response.body.err && response.body.errMessage === 'Unauthorized platform') { // user has no platform

                }
                if (response.body && response.body.err && response.body.errMessage === 'Unauthorized') { // user not logged in
                    // user platfrom is wrong or user cookie expired
                    const queryParams: any = {}
                    queryParams['authType'] = 'login';
                    // this.router.navigate(['/'], { queryParams: queryParams})

                }
            },
            error: (error: any) => {
                // console.log('MyHttpInterceptor error', error)
                if (error instanceof HttpErrorResponse && (error as HttpErrorResponse).status === 401) {
                    // console.log('MyHttpInterceptor 401')
                    const queryParams: any = {}
                    queryParams['authType'] = 'login';
                    this.config.resetCookies();
                    this.config.resetUserCreds();
                    this.router.navigate(['/'], { queryParams: queryParams})
                }
            }
        });
        return request
    }
}
