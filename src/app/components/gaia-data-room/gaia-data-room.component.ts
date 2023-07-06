import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {User} from "../../entities/user";
import {Config} from "../../config";
import {lastValueFrom} from "rxjs";
import {Router} from "@angular/router";

@Component({
    selector: 'app-gaia-data-room',
    templateUrl: './gaia-data-room.component.html',
    styleUrls: ['./gaia-data-room.component.less']
})
export class GaiaDataRoomComponent implements OnInit, OnDestroy {

    user!: User;
    userEmails = []
    userEmailHeaders: string[] = []
    errMessage = ''
    checkClosedInterval: any = null;
    constructor(
        private router: Router,
        private config: Config,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.getUser();
        // const csrftoken_exp = this.config.getCookie('user-exp', true)
        // const d = new Date(csrftoken_exp)
        // console.log('csrftoken_exp', csrftoken_exp)
        // console.log('d', d)
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            // console.log('this.user GaiaDataRoomComponent', this.user)
        });
    }

    async getUserEmails() {
        if (!this.checkCookies()) {
            return;
        }
        this.userEmails = [];
        this.clearErrMessage()
        const response: any = await lastValueFrom(this.apiService.getUserEmails({}));
        // console.log('response', response)
        if (!response.err) {
            this.userEmails = response.data
            if (this.userEmails && this.userEmails.length) {
                const first_item = this.userEmails[0];
                const headers = [];
                for (let key in first_item) {
                    headers.push(key)
                }
                this.userEmailHeaders = headers;
            }
        } else {
            this.errMessage = response.errMessage
            if (this.errMessage === 'user not authenticated') {
                this.saveUserGmailAuth(false)
                this.getUserAuthUrl()
            }
        }

    }

    async getUserAuthUrl() {
        if (!this.checkCookies()) {
            return;
        }
        this.clearErrMessage()
        const response: any = await lastValueFrom(this.apiService.getUserAuthUrl({}));
        // console.log('response', response)
        // window.open(response.auth_url, "", "width=500,height=700");
        this.popupWindowCenter(response.auth_url, "Gmail Auth", 500, 700)

    }

    popupWindowCenter(url: string, title: string, w: number, h: number) {
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2);
        const popup = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
        if (popup) {
            clearInterval(this.checkClosedInterval);
            this.checkClosedInterval = setInterval(async () => {
                if (popup.closed) {
                    // Popup is closed
                    clearInterval(this.checkClosedInterval);
                    // console.log('Popup closed');
                    const response: any = await lastValueFrom(this.apiService.checkUserAuth({}))
                    if (!response.err) {
                        this.saveUserGmailAuth(response.gmail_auth)
                    }
                }
            }, 500);
        }
    }

    clearErrMessage() {
        this.errMessage = ''
    }

    checkCookies() {
        const new_user = this.config.getCookie('user', true)
        // console.log('user', user)
        const csrftoken_exp = this.config.getCookie('user-exp', true)
        const token = this.config.getCookie('token', true)
        console.log('new_user',new_user)
        console.log('csrftoken_exp',csrftoken_exp)
        console.log('token',token)
        if (!csrftoken_exp || !token || !new_user) {
            this.config.resetCookies(false);
            this.config.resetUserCreds();
            this.router.navigate(['/login'])
            return false;
        }
        return true;
    }

    saveUserGmailAuth(gmail_auth: boolean) {
        const new_user = this.config.getCookie('user', true)
        // console.log('user', user)
        const csrftoken_exp = this.config.getCookie('user-exp', true)
        const token = this.config.getCookie('token', true)
        if (!csrftoken_exp || !token || !new_user) {
            this.config.resetCookies(false);
            this.config.resetUserCreds();
            this.router.navigate(['/login'])
        }
        const user = JSON.parse(new_user);
        user.gmail_auth = gmail_auth;
        // console.log('csrftoken_exp', csrftoken_exp)
        const d = new Date(csrftoken_exp)
        // console.log('user GaiaDataRoomComponent', user)
        this.config.setCookie('user', JSON.stringify(user), d, true);
        this.config.user = user;
    }

    ngOnDestroy(): void {
        if (this.checkClosedInterval) {
            clearInterval(this.checkClosedInterval);
        }
    }



}
