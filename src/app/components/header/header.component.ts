import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, IsActiveMatchOptions, Router} from "@angular/router";
import {User} from "../../entities/user";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {HelperService} from "../../services/helper.service";
import {environment} from "../../../environments/environment";
import {lastValueFrom} from "rxjs";

declare var $: any;
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
    routerLinkActiveOptions: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "exact",
        queryParams: 'subset',
        matrixParams: 'subset'
    }
    routerLinkActiveOptionsWithChildrens: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "subset",
        queryParams: 'subset',
        matrixParams: 'subset'
    }
    user!: User;
    tooltipTimeout: any = null;

    logoUrl = environment.staticUrl + 'assets/images/Generative_Ai_Logo.png';

    formType = 'login';
    formTypeOptions = ['login', 'signup', 'forgot'];
    email: string = '';
    password: string = '';
    username: string = '';
    // user: any = {};
    errMessage = '';
    successMessage = '';
    showVerify = false;

    callInProgress = false;

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private helperService: HelperService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            this.helperService.applyTooltip()
        });
        this.helperService.applyTooltip()

        this.route.queryParams.subscribe((params) => {
            const type = params['authType']
            if (type && this.formTypeOptions.indexOf(type) > -1) {
                this.formType = type;
                console.log('this.formType', this.formType)
                this.showLoginModel();
            }
        })
    }

    async logout(e: Event) {
        e.preventDefault();
        const response = await this.apiService.logout().toPromise();
        this.config.resetCookies();
        this.config.resetUserCreds();
        this.router.navigate(['/'])
    }

    async login() {
        if(this.callInProgress) {
            return;
        }
        this.resetMessages();
        try {
            this.callInProgress = true;
            this.errMessage = '';
            const response: any = await lastValueFrom(this.apiService.login(this.email,this.password));
            const data = response.data;
            if (!response.err) {
                this.hideLoginModel();
                this.setupUser(data);
                let returnUrl = this.route.snapshot.queryParams['returnUrl'];
                if (!returnUrl) {
                    if (this.user.on_boarding_details && this.user.on_boarding_details.finished) {
                        returnUrl = '/dashboard'
                    } else {
                        returnUrl = '/onBoarding'
                    }
                }
                this.router.navigateByUrl(returnUrl);
            } else {
                this.errMessage = response.errMessage;
                if (data.verify) {
                    this.showVerify = true;
                }
            }
            this.callInProgress = false;
        } catch (error) {
            console.error(error);
            this.callInProgress = false;
        }
    }

    async signup() {
        if(this.callInProgress) {
            return;
        }
        this.resetMessages();
        try {
            this.callInProgress = true;
            this.errMessage = '';
            const response: any = await this.apiService.register(this.email, this.username, this.password).toPromise();
            if (!response.err) {
                const data = response.data;
                const success_message = data.message;
                this.successMessage = success_message;
            } else {
                if (Array.isArray(response.errMessage)) {
                    this.errMessage = response.errMessage.join('</br>');
                } else {
                    this.errMessage = response.errMessage;
                }
            }
            this.callInProgress = false;
        } catch (error) {
            console.error(error);
        }
    }

    async forgot() {
        if(this.callInProgress) {
            return;
        }
        this.resetMessages();
        try {
            this.callInProgress = true;
            const response: any = await lastValueFrom(this.apiService.forgotPassword(this.email));
            if (!response.err) {
                // console.log('email sent successfully, please check your email')
                this.successMessage = 'email sent successfully, please check your email';
            } else {
                this.errMessage = response.errMessage;
            }
            this.callInProgress = false;
        } catch (error) {
            console.error(error);
            this.callInProgress = false;
        }
    }

    async resendVerifyEmail(event: Event) {
        event.preventDefault();
        this.resetMessages();
        try {
            const response: any = await lastValueFrom(this.apiService.resendVerifyEmail(this.email));
            if (!response.err) {
                // console.log('email sent successfully, please check your email')
                this.successMessage = 'email sent successfully, please check your email';
            } else {
                this.errMessage = response.errMessage;
            }
            this.showVerify = false;
        } catch (error) {
            console.error(error);
        }
    }

    resetMessages() {
        this.errMessage = '';
        this.successMessage = ''
        this.showVerify = false;
    }

    setupUser(response: any) {
        this.user = new User(response);
        this.config.user = response.user;
        this.config.token = response.token;
        this.setCookiesAfterLogin(response);
        this.config.csrf_token = this.config.getCookie('csrftoken');
    }

    setCookiesAfterLogin(response: any) {
        // const csrftoken = this.config.getCookie('csrftoken')
        const clientRunningOnServerHost = this.config.server_host === window.location.origin + '/';
        // if (!csrftoken || !clientRunningOnServerHost) { // meaning it's not served by django server
        //     const csrftoken_exp = response.csrftoken_exp
        //     const csrftoken = response.csrftoken
        //     const d = new Date(csrftoken_exp)
        //     this.config.setCookie('csrftoken', csrftoken, d);
        // }
        const token = this.config.getCookie('token', true)
        if (!token || !clientRunningOnServerHost) { // meaning it's not served by django server
            const csrftoken_exp = response.csrftoken_exp
            const token = response.token
            const d = new Date(csrftoken_exp)
            this.config.setCookie('token', token, d, true);
            this.config.token = this.config.getCookie('token', true);
        }

        const user = this.config.getCookie('user', true)
        if (!user || !clientRunningOnServerHost) { // meaning it's not served by django server
            const csrftoken_exp = response.csrftoken_exp
            const user = response.user
            const d = new Date(csrftoken_exp)
            this.config.setCookie('user', JSON.stringify(user), d, true);
            this.config.setCookie('user-exp', csrftoken_exp, d, true);
            const new_user = this.config.getCookie('user', true)
            this.config.user = JSON.parse(new_user);
        } else {
            this.config.user = JSON.parse(user);
        }
    }

    setFormType(type: string) {
        if (type && this.formTypeOptions.indexOf(type) > -1) {
            this.formType = type;
        }
    }

    showLoginModel() {
        $('#loginModal').modal('show');
    }
    hideLoginModel() {
        const el = $('#loginModal');
        el.removeClass('show');
        el.modal('hide');
        $('.modal-backdrop').hide();
    }
}
