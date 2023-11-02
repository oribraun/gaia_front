import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, IsActiveMatchOptions, Router} from "@angular/router";
import {User} from "../../entities/user";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {HelperService} from "../../services/helper.service";
import {environment} from "../../../environments/environment";
import {lastValueFrom} from "rxjs";
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';


declare var $: any;
declare var google: any;
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
    }
    routerLinkActiveOptionsWithChildrens: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "subset",
        queryParams: 'subset',
        matrixParams: 'subset'
    }

    platforms: any[] = [];
    selectedPlatform = '';

    user!: User;
    user_on_boarding_finished = false;
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

    googleClient: any;

    imageSrc: string;

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
        this.initOnBoarding();
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            this.helperService.applyTooltip();
        });
        this.helperService.applyTooltip();

        this.route.queryParams.subscribe((params) => {
            const type = params['authType']
            if (type && this.formTypeOptions.indexOf(type) > -1) {
                this.formType = type;
                console.log('this.formType', this.formType)
                this.showLoginModel();
            }
        })
        this.setUpGoogle();
    }

    initOnBoarding() {
        if (this.user.id) {
            this.selectedPlatform = this.user.last_logged_platform;
            this.getUserOnBoarding();
        }
    }

    getUserOnBoarding(redirect=false) {
        this.apiService.getUserOnBoarding(this.user.last_logged_platform, {}).subscribe({
            next: async (response: any) => {
                if (!response.err) {
                    const on_boarding_object = response.on_boarding_object;
                    this.user_on_boarding_finished = on_boarding_object && on_boarding_object.on_boarding_details && on_boarding_object.on_boarding_details.finished;
                    if (this.user_on_boarding_finished) {
                        this.helperService.applyTooltip();
                    }
                    setTimeout(() => {
                        this.config.user_on_boarding = on_boarding_object?.on_boarding_details
                    })
                    if (redirect) {
                        this.redirectUser();
                    }
                } else {
                    console.log('getUserOnBoarding errMessage', response.errMessage)
                }
            },
            error: (error) => {
                console.log('getUserOnBoarding error', error)
            },
        })
    }

    getPlatforms() {
        this.apiService.getPlatforms({}).subscribe({
            next: async (response: any) => {
                if (!response.err) {
                    this.platforms = response.platforms;
                } else {
                    console.log('getPlatforms errMessage', response.errMessage)
                }
            },
            error: (error) => {
                console.log('getPlatforms error', error)
            },
        })
    }

    changePlatform(event: any) {
        this.selectedPlatform = event.target.value;
        this.changeUserPlatform();
    }

    async changeUserPlatform() {
        if (this.user.id) {
            try {
                this.errMessage = '';
                const response: any = await lastValueFrom(this.apiService.changeUserPlatform(this.selectedPlatform));
                if (!response.err) {
                    this.setUpUserLoggedPlatformCookies(this.selectedPlatform);
                    this.reloadSystemAndRedirect();
                } else {
                    console.log('changeUserPlatform errMessage', response.errMessage)
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
                    console.log('google error', err)
                }
            })
        };
    }

    renderGoogleButton() {
        google.accounts!.id.renderButton(
            document!.getElementById('googleButton')!,
            { theme: 'outline', size: 'large', width: 200 }
        )
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
        console.log('tokenResponse', tokenResponse)
        const user: any = await this.getUserProfileData(tokenResponse.access_token)
        console.log('user', user)
        let user_details = {
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
        }
        const userPeople = await this.getUserPeopleInfo(user_details.id, tokenResponse.access_token)
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
            let request = new XMLHttpRequest();
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

        return {gender: gender, birthday: birthday}
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
            const response: any = await lastValueFrom(this.apiService.login(this.email,this.password, this.selectedPlatform));
            const data = response.data;
            if (!response.err) {
                this.hideLoginModel();
                this.setupUser(data);
                this.user.last_logged_platform = this.selectedPlatform
                this.getUserOnBoarding(true);
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
                platform: this.selectedPlatform
            }));
            const data = response.data;
            if (!response.err) {
                this.hideLoginModel();
                this.setupUser(data);
                this.redirectUser();
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
                this.redirectUser();
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

    setUpUserOnly(user: any) {
        this.user = new User(user);
        this.config.user = user;
        this.setCookiesAfterLogin(user);
    }

    redirectUser() {
        let returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (!returnUrl) {
            console.log('this.user.last_logged_platform', this.user.last_logged_platform)
            console.log('this.user_on_boarding_finished', this.user_on_boarding_finished)
            if (this.user_on_boarding_finished) {
                returnUrl = '/' + this.user.last_logged_platform + '/dashboard'
            } else {
                returnUrl = '/onBoarding'
            }
        }
        console.log('returnUrl', returnUrl)
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

    setUpUserLoggedPlatformCookies(logged_platform: any) {
        const clientRunningOnServerHost = this.config.server_host === window.location.origin + '/';
        if (!clientRunningOnServerHost) {
            // only when running localhost 4200
            let user = this.config.getCookie('user', true)
            if(user) {
                user = JSON.parse(user)
                user.last_logged_platform = logged_platform;
                const user_exp = this.config.getCookie('user-exp', true)
                const d = new Date(user_exp)
                this.config.setCookie('user', JSON.stringify(user), d, true);
                this.config.user = user;
            }
        }
    }

    reloadSystemAndRedirect() {
        window.location.reload();
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
