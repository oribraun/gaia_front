/**
 * Created by ori on 4/27/2017.
 */

import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import {Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private _subject:Subject<any> = new Subject<any>();
    private _keepAfterNavigationChange:boolean = false;
    private _router:Router;
    constructor(router: Router) {
        this._router = router;
        // clear alert message on route change
        this._router.events.subscribe((event:any) => {
            if (event instanceof NavigationStart) {
                if (this._keepAfterNavigationChange) {
                    // only keep for a single location change
                    this._keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this._subject.next("");
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false, timeout = 3000) {
        this._keepAfterNavigationChange = keepAfterNavigationChange;
        this._subject.next({ type: 'success', text: message, timeout: timeout });
    }

    info(message: string, keepAfterNavigationChange = false, timeout = 3000) {
        this._keepAfterNavigationChange = keepAfterNavigationChange;
        this._subject.next({ type: 'info', text: message, timeout: timeout });
    }

    error(message: string, keepAfterNavigationChange = false, timeout = 3000) {
        this._keepAfterNavigationChange = keepAfterNavigationChange;
        this._subject.next({ type: 'error', text: message, timeout: timeout });
    }
    clearError():void {
        this._subject.next("");
    }

    getMessage(): Observable<any> {
        return this._subject.asObservable();
    }
}
