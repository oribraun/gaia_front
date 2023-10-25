import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

    auth2: any;
    @ViewChild('googleLogin', { static: false }) googleLogin!: ElementRef;

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private helperService: HelperService,
        private route: ActivatedRoute,
        private ref: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.user = this.config.user;
        console.log('this.user', this.user)
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            console.log('this.user2', this.user)
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
        this.googleAuthSDK();
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

    async loginSocial(user_details: any) {
        if(this.callInProgress) {
            return;
        }
        this.resetMessages();
        try {
            this.callInProgress = true;
            this.errMessage = '';
            const response: any = await lastValueFrom(this.apiService.loginSocial({user_details: user_details}));
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
            this.ref.detectChanges();
        } catch (error) {
            console.error(error);
            this.callInProgress = false;
            this.ref.detectChanges();
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
            const response: any = await lastValueFrom(this.apiService.register(this.email, this.username, this.password));
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

    async signupSocial(user_details: any) {
        if(this.callInProgress) {
            return;
        }
        this.resetMessages();
        try {
            this.callInProgress = true;
            this.errMessage = '';
            const response: any = await lastValueFrom(this.apiService.registerSocial({user_details: user_details}));
            if (!response.err) {
                const data = response.data;
                console.log('data', data)
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
                if (Array.isArray(response.errMessage)) {
                    this.errMessage = response.errMessage.join('</br>');
                } else {
                    this.errMessage = response.errMessage;
                }
            }
            this.callInProgress = false;
            this.ref.detectChanges();
        } catch (error) {
            console.error(error);
            this.callInProgress = false;
            this.ref.detectChanges();
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

    googleAuthSDK() {
        (<any>window)['googleSDKLoaded'] = () => {
            (<any>window)['gapi'].load('auth2', () => {
                this.auth2 = (<any>window)['gapi'].auth2.init({
                    client_id: '10392832492-cvpba6i0s3sgontq9gqfb3fgfqf391l8.apps.googleusercontent.com',
                    plugin_name:'login',
                    cookiepolicy: 'single_host_origin',
                    scope: 'profile email https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.birthday.read'
                });
                // this.callLogin();
                this.setupGoogleAuthClickHandler();
            });
        }

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement('script');
            js.id = id;
            js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
            fjs?.parentNode?.insertBefore(js, fjs);
        }(document, 'script', 'google-jssdk'));
    }

    setupGoogleAuthClickHandler() {
        setTimeout(() => {
            const attachClickHandlerExist = this.googleLogin.nativeElement.classList.contains('attachClickHandler');
            if (!attachClickHandlerExist) {
                this.googleLogin.nativeElement.classList.add('attachClickHandler')
                this.auth2.attachClickHandler(this.googleLogin.nativeElement, {},
                    async (googleAuthUser: any) => {

                        let profile = googleAuthUser.getBasicProfile();
                        let authResult = googleAuthUser.getAuthResponse();
                        let user_details = {
                            type: 'google',
                            id: profile.getId(),
                            name: profile.getName().trim(),
                            first_name: profile.getGivenName().trim(),
                            last_name: profile.getFamilyName().trim(),
                            image_url: profile.getImageUrl(),
                            email: profile.getEmail(),
                            // id_token: authResult.id_token,
                            access_token: authResult.access_token,
                            gender: null,
                            birthday: null
                        }
                        try {
                            const response = await fetch(
                                `https://people.googleapis.com/v1/people/${profile.getId()}?personFields=birthdays,genders&access_token=${authResult.access_token}`
                            )
                            let {birthdays, genders} = await response.json();
                            // console.log('birthdays', birthdays)
                            // console.log('genders', genders)
                            let gender = null;
                            let birthday: any = null;
                            try {
                                gender = genders[genders.length - 1].value
                            } catch (e) {
                            }
                            try {
                                for (let b of birthdays) {
                                    if (b.date.year && b.date.month && b.date.day) {
                                        birthday = new Date(b.date.year, b.date.month, b.date.day).toLocaleDateString('en-GB');
                                        break;
                                    }
                                }
                            } catch (e) {
                            }
                            user_details.gender = gender;
                            user_details.birthday = birthday;
                        } catch (e) {}
                        if (this.formType === 'login') {
                            this.loginSocial(user_details);
                        } else if (this.formType === 'signup') {
                            this.signupSocial(user_details);
                        }

                    }, (error: any) => {
                        // user exist window maybe
                        console.log(JSON.stringify(error, undefined, 2));
                    });
            }
        })
    }

    resetMessages() {
        this.errMessage = '';
        this.successMessage = ''
        this.showVerify = false;
    }

    setupUser(response: any) {
        this.user = new User(response.user);
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
            this.showLoginModel();
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
