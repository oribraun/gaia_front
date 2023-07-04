import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {User} from "../../entities/user";
import {Config} from "../../config";
import {lastValueFrom} from "rxjs";

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
            }
        }

    }

    async getUserAuthUrl() {
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
            // popup.onunload = () => {
            //     console.log('window closed')
            // };
        }
        return popup
    }

    clearErrMessage() {
        this.errMessage = ''
    }

    saveUserGmailAuth(gmail_auth: boolean) {
        const new_user = this.config.getCookie('user', true)
        const user = JSON.parse(new_user);
        user.gmail_auth = gmail_auth;
        // console.log('user', user)
        // console.log('u', u)
        const csrftoken_exp = this.config.getCookie('user-exp', true)
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
