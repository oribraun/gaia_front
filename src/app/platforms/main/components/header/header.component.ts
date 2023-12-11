import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, IsActiveMatchOptions, NavigationEnd, Router} from "@angular/router";
import {User} from "../../../shared-slides/entities/user";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {HelperService} from "../../services/helper.service";
import {environment} from "../../../../../environments/environment";
import {lastValueFrom} from "rxjs";
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';


declare let $: any;
declare let google: any;
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit, AfterViewInit {
    routerLinkActiveOptions: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "exact",
        queryParams: 'subset',
        matrixParams: 'subset'
    };
    routerLinkActiveOptionsWithChildrens: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "subset",
        queryParams: 'subset',
        matrixParams: 'subset'
    };

    platforms: any[] = [];
    selectedPlatform: any = {name: '', display_name: ''};

    user!: User;
    user_on_boarding_finished = false;
    tooltipTimeout: any = null;

    logoUrl = environment.staticUrl + 'assets/images/Generative_Ai_Logo.png';

    formType = 'login';
    formTypeOptions = ['login', 'signup', 'forgot'];
    email: string = '';
    password: string = '';
    username: string = '';
    planId!: number;
    isPlansPage = false;
    // user: any = {};
    errMessage = '';
    successMessage = '';
    showVerify = false;

    callInProgress = false;

    auth2: any;

    googleClient: any;

    imageSrc: string;

    resetPassDetails = {
        old_password: '',
        new_password: '',
        confirm_password: '',
        successMessage: '',
        errMessage: ''
    };

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private helperService: HelperService,
        private route: ActivatedRoute,
        private ref: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    ngOnInit(): void {
        this.getPlatforms();
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            this.helperService.applyTooltip();
        });
        this.helperService.applyTooltip();

        this.route.queryParams.subscribe((params) => {
            const type = params['authType'];
            if (type && this.formTypeOptions.indexOf(type.toLowerCase()) > -1) {
                this.formType = type.toLowerCase();
                console.log('this.formType', this.formType);
                setTimeout(() => {
                    this.showLoginModel();
                });
            }
            const planId = params['planId'];
            if (planId) {
                this.planId = planId;
            }
        });
        this.setUpGoogle();

        this.config.user_on_boarding_subject.subscribe(() => {
            this.user_on_boarding_finished = this.config.user_on_boarding && this.config.user_on_boarding.finished;
        });
        this.checkIfPlansPage();
    }

    initOnBoarding(redirectUser = false) {
        if (this.user.id && this.user.last_logged_platform) {
            const currentPlatform = this.user.last_logged_platform;
            const map = this.platforms.map((o: any) => o.name);
            const index = map.indexOf(currentPlatform);
            if (index > -1) {
                this.selectedPlatform = this.platforms[index];
            }
            this.getUserOnBoarding(redirectUser);
            if (this.user.last_logged_platform === 'ielts') {
                this.getUserActivity();
            }
        }
    }

    getUserOnBoarding(redirectUser = false) {
        this.apiService.getUserOnBoarding(this.user.last_logged_platform, {}).subscribe({
            next: async (response: any) => {
                if (!response.err) {
                    const on_boarding_object = response.on_boarding_object;
                    this.user_on_boarding_finished = on_boarding_object && on_boarding_object.on_boarding_details && on_boarding_object.on_boarding_details.finished;
                    if (this.user_on_boarding_finished) {
                        this.helperService.applyTooltip();
                    }
                    setTimeout(() => {
                        this.config.user_on_boarding = on_boarding_object?.on_boarding_details;
                    });
                    if (redirectUser) {
                        this.redirectUser(this.user_on_boarding_finished);
                    }
                } else {
                    console.log('getUserOnBoarding errMessage', response.errMessage);
                }
            },
            error: (error) => {
                console.log('getUserOnBoarding error', error);
            }
        });
    }

    getUserActivity(redirectUser = false) {
        this.apiService.getUserActivity(this.user.last_logged_platform, {}).subscribe({
            next: async (response: any) => {
                if (!response.err) {
                    const user_activity = response.user_activity;
                    if (user_activity) {
                        this.user.last_lesson_id = user_activity.last_user_lesson;
                    }
                    console.log('user_activity', user_activity);
                } else {
                    console.log('getUserActivity errMessage', response.errMessage);
                }
            },
            error: (error) => {
                console.log('getUserActivity error', error);
            }
        });
    }

    getPlatforms() {
        this.apiService.getPlatforms({}).subscribe({
            next: async (response: any) => {
                if (!response.err) {
                    this.platforms = response.platforms;
                    if (this.platforms && this.platforms.length && !this.user.id) {
                        this.selectedPlatform = this.platforms[0];
                    }
                    this.initOnBoarding();
                } else {
                    console.log('getPlatforms errMessage', response.errMessage);
                }
            },
            error: (error) => {
                console.log('getPlatforms error', error);
            }
        });
    }

    changePlatformValue(platform: any, $event: any) {
        $event.preventDefault();
        this.selectedPlatform = platform;
        if (this.user.id) {
            this.changeUserPlatform();
        }
    }

    changePlatform(event: any) {
        const currentPlatform = event.target.value;
        const map = this.platforms.map((o: any) => o.name);
        const index = map.indexOf(currentPlatform);
        if (index > -1) {
            this.selectedPlatform = this.platforms[index];
        }
        if (this.user.id) {
            this.changeUserPlatform();
        }
    }

    async changeUserPlatform() {
        if (this.user.id) {
            try {
                this.errMessage = '';
                const response: any = await lastValueFrom(this.apiService.changeUserPlatform(this.selectedPlatform.name));
                if (!response.err) {
                    this.user.last_logged_platform = this.selectedPlatform.name;
                    this.config.user = this.user;
                    // this.setUpUserLoggedPlatformCookies(this.selectedPlatform.value);
                    // setTimeout(() => {
                    //     const returnUrl = this.helperService.getUserReturnUrl(this.user)
                    //     this.router.navigate([returnUrl])
                    // }, 300)
                    this.reloadSystemAndRedirect();
                } else {
                    console.log('changeUserPlatform errMessage', response.errMessage);
                }
            } catch (error) {
                console.error('changeUserPlatform', error);
            }
        }
    }

    setUpGoogle() {
        // @ts-ignore
        window.onGoogleLibraryLoad = () => {
            // google.accounts.id.initialize({
            //     // Ref: https://developers.google.com/identity/gsi/web/reference/js-reference#IdConfiguration
            //     client_id: '10392832492-cvpba6i0s3sgontq9gqfb3fgfqf391l8.apps.googleusercontent.com',
            //     callback: this.handleCredentialResponse.bind(this), // Whatever function you want to trigger...
            //     auto_select: true,
            //     cancel_on_tap_outside: false
            // });
            this.googleClient = google.accounts.oauth2.initTokenClient({
                client_id: '10392832492-cvpba6i0s3sgontq9gqfb3fgfqf391l8.apps.googleusercontent.com',
                scope: 'profile email https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.birthday.read',
                callback: (tokenResponse: any) => this.getGoogleUser(tokenResponse),
                error_callback: (err: any) => {
                    console.log('google error', err);
                }
            });
        };
    }

    renderGoogleButton() {
        google.accounts!.id.renderButton(
            document!.getElementById('googleButton')!,
            { theme: 'outline', size: 'large', width: 200 }
        );
    }

    autoReSignIn() {
        google.accounts.id.initialize({
            // Ref: https://developers.google.com/identity/gsi/web/reference/js-reference#IdConfiguration
            client_id: '10392832492-cvpba6i0s3sgontq9gqfb3fgfqf391l8.apps.googleusercontent.com',
            callback: this.handleCredentialResponse.bind(this), // Whatever function you want to trigger...
            auto_select: true,
            cancel_on_tap_outside: false
        });
        // OPTIONAL: In my case I want to redirect the user to an specific path.
        google.accounts.id.prompt((notification: PromptMomentNotification) => {
            console.log('Google prompt event triggered...');

            if (notification.getDismissedReason() === 'credential_returned') {
                this.ngZone.run(() => {
                    // this.router.navigate(['myapp/somewhere'], { replaceUrl: true });
                    console.log('Welcome back!');
                });
            }
        });
    }

    async getGoogleUser(tokenResponse: any) {
        console.log('tokenResponse', tokenResponse);
        const user: any = await this.getUserProfileData(tokenResponse.access_token);
        console.log('user', user);
        const user_details = {
            type: 'google',
            id: user.sub,
            name: user.name,
            first_name: user.given_name.trim(),
            last_name: user.family_name.trim(),
            image_url: user.picture,
            email: user.email,
            // id_token: authResult.id_token,
            access_token: tokenResponse.access_token,
            gender: null,
            birthday: null
        };
        const userPeople = await this.getUserPeopleInfo(user_details.id, tokenResponse.access_token);
        user_details.gender = userPeople.gender;
        user_details.birthday = userPeople.birthday;
        if (this.formType === 'login') {
            this.loginSocial(user_details);
        } else if (this.formType === 'signup') {
            this.signupSocial(user_details);
        }
    }

    getUserProfileData(accessToken: string) {
        return new Promise(function (resolve, reject) {
            const request = new XMLHttpRequest();
            const url = `https://www.googleapis.com/oauth2/v3/userinfo`;
            request.addEventListener("loadend", function () {
                const response = JSON.parse(this.responseText);
                if (this.status === 200) {
                    resolve(response);
                } else {
                    reject(response);
                }
            });
            request.open("GET", url, true);
            request.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            request.send();
        });
    }

    async getUserPeopleInfo(user_id: string, accessToken: string) {
        const response = await fetch(
            `https://people.googleapis.com/v1/people/${user_id}?personFields=birthdays,genders&access_token=${accessToken}`
        );
        const {birthdays, genders} = await response.json();
        // console.log('birthdays', birthdays)
        // console.log('genders', genders)
        let gender = null;
        let birthday: any = null;
        try {
            gender = genders[genders.length - 1].value;
        } catch (e) {
        }
        try {
            for (const b of birthdays) {
                if (b.date.year && b.date.month && b.date.day) {
                    birthday = new Date(b.date.year, b.date.month, b.date.day).toLocaleDateString('en-GB');
                    break;
                }
            }
        } catch (e) {
        }

        return {gender: gender, birthday: birthday};
    }

    handleCredentialResponse(response: CredentialResponse) {
// Decoding  JWT token...
        let googleUser: any | null = null;
        try {
            googleUser = JSON.parse(atob(response?.credential.split('.')[1]));
        } catch (e) {
            console.error('Error while trying to decode token', e);
        }
        console.log('googleUser', googleUser);
        // {
        //     "iss": "https://accounts.google.com",
        //     "azp": "10392832492-cvpba6i0s3sgontq9gqfb3fgfqf391l8.apps.googleusercontent.com",
        //     "aud": "10392832492-cvpba6i0s3sgontq9gqfb3fgfqf391l8.apps.googleusercontent.com",
        //     "sub": "107590987755067476953",
        //     "hd": "gaialabs.ai",
        //     "email": "ori@gaialabs.ai",
        //     "email_verified": true,
        //     "nbf": 1698324722,
        //     "name": "Ori Braun",
        //     "given_name": "Ori ",
        //     "family_name": "Braun",
        //     "locale": "en",
        //     "iat": 1698325022,
        //     "exp": 1698328622,
        //     "jti": "1ded0241883fe008ab48b21653669a6bfd679379"
        // }
    }

    ngAfterViewInit(): void {
        // google.accounts.id.initialize({
        //     client_id: "",
        //     callback: (window as any)['handleCredentialResponse'] =
        //         (response: any) => this.ngZone.run(() => {
        //             console.log("this response holds the token for the logged in user information",response)
        //         })
        // });
        //
        // google.accounts.id.renderButton(
        //     document.getElementById("googleButton"),
        //     { type: "standard", text: "signin_with", theme: "outline",
        //         size: "medium", width: "250"}
        // )
    }



    async logout(e: Event) {
        e.preventDefault();
        const response = await this.apiService.logout().toPromise();
        this.config.resetCookies();
        this.config.resetUserCreds();
        this.router.navigate(['/']);
    }

    async login() {
        if(this.callInProgress) {
            return;
        }
        this.resetMessages();
        try {
            this.callInProgress = true;
            this.errMessage = '';
            const response: any = await lastValueFrom(this.apiService.login(this.email, this.password, this.selectedPlatform.name, this.planId));
            const data = response.data;
            if (!response.err) {
                this.hideLoginModel();
                this.setupUser(data);
                this.user.last_logged_platform = this.selectedPlatform.name;
                this.initOnBoarding(true);
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
            const response: any = await lastValueFrom(this.apiService.loginSocial({
                user_details: user_details,
                platform: this.selectedPlatform.name,
                planId: this.planId
            }));
            const data = response.data;
            if (!response.err) {
                this.hideLoginModel();
                this.setupUser(data);
                this.user.last_logged_platform = this.selectedPlatform.name;
                this.initOnBoarding(true);
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
            const response: any = await lastValueFrom(this.apiService.register(this.email, this.username, this.password, this.planId));
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
            const response: any = await lastValueFrom(this.apiService.registerSocial({user_details: user_details, planId: this.planId}));
            if (!response.err) {
                const data = response.data;
                console.log('data', data);
                this.hideLoginModel();
                this.setupUser(data);
                this.user.last_logged_platform = this.selectedPlatform.name;
                this.initOnBoarding(true);
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

    logInGoogle() {
        this.googleClient.requestAccessToken();
    }

    resetMessages() {
        this.errMessage = '';
        this.successMessage = '';
        this.showVerify = false;
    }

    setupUser(response: any) {
        this.user = new User(response.user);
        this.config.user = response.user;
        this.config.token = response.token;
        if (!environment.production) {
            this.setCookiesAfterLogin(response);
        }
        this.config.csrf_token = this.config.getCookie('csrftoken');
    }

    setUpUserOnly(user: any) {
        this.user = new User(user);
        this.config.user = user;
        if (!environment.production) {
            this.setCookiesAfterLogin(user);
        }
    }

    redirectUser(user_on_boarding_finished: boolean) {
        const returnUrl = this.helperService.getUserReturnUrl(this.user, user_on_boarding_finished);
        this.router.navigateByUrl(returnUrl);
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
        const token = this.config.getCookie('token', true);
        if (!token || !clientRunningOnServerHost) { // meaning it's not served by django server
            // const csrftoken_exp = response.csrftoken_exp
            const cookie_age = response.cookie_age;
            const token = response.token;
            const d = new Date();
            d.setSeconds(d.getSeconds() + cookie_age);
            this.config.setCookie('token', token, d, true);
            this.config.token = this.config.getCookie('token', true);
        }

        const user = this.config.getCookie('user', true);
        if (!user || !clientRunningOnServerHost) { // meaning it's not served by django server
            // const csrftoken_exp = response.csrftoken_exp
            const cookie_age = response.cookie_age;
            const user = response.user;
            const d = new Date();
            d.setSeconds(d.getSeconds() + cookie_age);
            this.config.setCookie('user', JSON.stringify(user), d, true);
            this.config.setCookie('user-exp', d.toISOString(), d, true);
            const new_user = this.config.getCookie('user', true);
            this.config.user = JSON.parse(new_user);
        } else {
            this.config.user = JSON.parse(user);
        }
    }

    setUpUserLoggedPlatformCookies(logged_platform: any) {
        // const clientRunningOnServerHost = this.config.server_host === window.location.origin + '/';
        // if (!clientRunningOnServerHost) {
        // only when running localhost 4200
        let user = this.config.getCookie('user', true);
        if(user) {
            user = JSON.parse(user);
            user.last_logged_platform = logged_platform;
            const user_exp = this.config.getCookie('user-exp', true);
            const d = new Date(user_exp);
            this.config.setCookie('user', JSON.stringify(user), d, true);
            this.config.user = user;
        }
        // }
    }

    reloadSystemAndRedirect() {
        const href = window.location.origin + '/' + this.selectedPlatform.name + '/redirect';
        window.location.href = href;
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

    goTo(page: string) {
        this.router.navigate(['/' + page]);
    }

    resetPassword() {
        this.showResetPasswordModel();

    }

    showResetPasswordModel() {
        $('#resetPasswordModal').modal('show');
    }

    hideResetPasswordModel() {
        const el = $('#resetPasswordModal');
        el.removeClass('show');
        el.modal('hide');
        $('.modal-backdrop').hide();
    }

    async changePassword() {
        if (this.callInProgress) {
            return;
        }
        if (!this.resetPassDetails.old_password) {
            this.resetPassDetails.errMessage = 'Please fill old password';
            return;
        }
        if (!this.resetPassDetails.new_password) {
            this.resetPassDetails.errMessage = 'Please fill new password';
            return;
        }
        if (!this.resetPassDetails.confirm_password) {
            this.resetPassDetails.errMessage = 'Please confirm new password';
            return;
        }
        if (this.resetPassDetails.confirm_password !== this.resetPassDetails.new_password) {
            this.resetPassDetails.errMessage = 'Passwords do not match';
            return;
        }
        try {
            this.callInProgress = true;
            const obj = {
                old_password: this.resetPassDetails.old_password,
                new_password: this.resetPassDetails.new_password,
                confirm_password: this.resetPassDetails.confirm_password
            };
            const response: any = await lastValueFrom(this.apiService.changeUserPassword(obj));
            if (!response.err) {
                // console.log('email sent successfully, please check your email')
                this.resetPassDetails.successMessage = response.message;
                setTimeout(() => {
                    this.hideResetPasswordModel();
                    this.resetPassDetails.successMessage = '';
                }, 3000);
                this.resetChangePassword();
            } else {
                if (typeof response.errMessage === 'string') {
                    this.resetPassDetails.errMessage = response.errMessage;
                } else if (Array.isArray(response.errMessage)) {
                    this.resetPassDetails.errMessage = response.errMessage.join('\n');
                }
            }
            this.callInProgress = false;
        } catch (error: any) {
            console.error(error);
            this.resetPassDetails.errMessage = error;
            this.callInProgress = false;
        }
    }

    resetChangePassword() {
        this.resetPassDetails.old_password = '';
        this.resetPassDetails.new_password = '';
        this.resetPassDetails.confirm_password = '';
        // this.resetPassDetails.successMessage = '';
        this.resetPassDetails.errMessage = '';
    }

    checkIfPlansPage() {
        this.router.events.subscribe((routerEvent) => {
            if(routerEvent instanceof NavigationEnd) {
                // Get your url
                const l = routerEvent.url.replace(/\?.*/, '').split('/');
                if (l[l.length - 1] === 'plans') {
                    this.isPlansPage = true;
                } else {
                    this.isPlansPage = false;
                }
            }
        });
    }
}
