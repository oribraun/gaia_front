import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Config} from "./config";
import {User} from "../shared/entities/user";
import {ActivatedRoute, NavigationEnd, NavigationStart, Params, Router, RoutesRecognized} from "@angular/router";
import {WebSocketService} from "./services/web-sockets/web-socket.service";
import {HelperService} from "./services/helper.service";
import {environment} from "../../../environments/environment";
import {TranslateService} from "@ngx-translate/core";

// declare var STATIC_URL: any;
declare let USER: any;
declare let TOKEN: any;
declare let HOST: any;
declare let SCHEME: any;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    title = 'frontend';
    user!: User;

    currentRoute = '';

    availableLangs = ['en', 'he'];
    currentLang: string = "";
    previousUrl: string = "";
    constructor(
        private config: Config,
        private webSocketService: WebSocketService,
        private helperService: HelperService,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        setTimeout(() => {
            // this.setupCredsFromServer();
        });
        this.setupCredsFromServer();
        this.closeOnGmailCallback();

        if (environment.production) {
            this.config.staticImagePath = 'static/client/';
        }
    }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            if (!environment.production) {
                this.updateUserCookie();
            }
        });
        this.getCurrentRoute();
        // setTimeout is because we need to wait for all components subscriptions to config changes
        if (!environment.production) {
            this.setupCredsFromCookies();
        } else {
            this.setupCredsFromServer();
        }

        // let redirectUser = false;
        // let user_on_boarding_finished = false;
        // this.route.queryParams.subscribe((params) => {
        //     if (params['redirectUser']) {
        //         redirectUser = params['redirectUser'];
        //         user_on_boarding_finished = params['onBoardingFinished'];
        //     }
        //     if (redirectUser) {
        //         this.redirectUser(user_on_boarding_finished);
        //     }
        // });
        this.listenToGlobalChangeLang();
        this.currentLang = this.translate.getDefaultLang();
        const lang = this.helperService.getLangFromLocalStorage();
        if (lang) {
            this.currentLang = lang;
        }
    }

    changeGlobalLang(lang: string) {
        this.config.lang_change = lang;
    }

    listenToGlobalChangeLang() {
        this.config.lang_change.subscribe({
            next:(value: string) => {
                this.translate.use(value).subscribe({
                    next: () => {
                        this.currentLang = this.translate.currentLang;
                    }
                });
            }
        });
    }

    // redirectUser(user_on_boarding_finished: boolean) {
    //     const returnUrl = this.helperService.getUserReturnUrl(this.user, user_on_boarding_finished);
    //     this.router.navigateByUrl(returnUrl);
    // }

    setupCredsFromCookies() {
        console.log('setupCredsFromCookies');
        const csrftoken = this.config.getCookie('csrftoken');
        if (csrftoken) {
            this.config.csrf_token = csrftoken;
        }
        const token = this.config.getCookie('token', true);
        if (token) {
            this.config.token = token;
        }
        const user = this.config.getCookie('user', true);
        const user_exp = this.config.getCookie('user-exp', true);
        if (user) {
            this.config.user = JSON.parse(user);
        }
        if (!csrftoken || !token || !user || !user_exp) {
            this.config.resetCookies(false);
            this.config.resetUserCreds();
        }
    }
    setupCredsFromServer() {
        if (typeof USER !== 'undefined' && USER !== 'AnonymousUser' && USER !== '{{ user | safe }}') {
            this.config.user = JSON.parse(USER);
        } else {
            this.config.user_subject.next('');
        }
        if (typeof HOST !== 'undefined' && HOST !== '{{ request.get_host }}') {
            this.config.server_host = SCHEME + '://' + HOST + '/';
        }
    }

    updateUserCookie() {
        const clientRunningOnServerHost = this.config.server_host === window.location.origin + '/';
        if (!clientRunningOnServerHost) {
            const user = this.config.getCookie('user', true);
            if (this.user && user) {
                const user_exp = this.config.getCookie('user-exp', true);
                const d = new Date(user_exp);
                this.config.setCookie('user', JSON.stringify(this.user), d, true);
            }
        }
    }

    closeOnGmailCallback() {
        this.route.queryParams
            .subscribe((params: Params) => {
                    const gmail_callback = params['gmail_callback'] === 'true';
                    if (gmail_callback) {
                        // console.log('setting up unload event', window.opener)
                        // if (window.opener) {
                        //     window.opener.postMessage('popupClosed', window.location.origin);
                        // }
                        console.log('gmail_callback', gmail_callback);
                        this.webSocketService.connect(this.helperService.create_user_socket_uuidv5(this.user.email));
                        this.webSocketService.onConnect.subscribe((msg) => {
                            console.log('onConnect msg', msg);
                            this.webSocketService.sendMessage('auth-popup-closed', {'test': 'hi'});
                            window.close();
                        });
                        // window.addEventListener('unload', function() {
                        //     alert('sent message: popupClosed - ' + window.location.origin);
                        //     if (window.opener) {
                        //         window.opener.postMessage('popupClosed', window.location.origin);
                        //     }
                        // });
                    }
                }
            );
    }

    getCurrentRoute() {
        this.router.events.subscribe((routerEvent) => {
            if(routerEvent instanceof NavigationEnd) {
                // Get your url
                const l = routerEvent.url.split('/');
                if (l && l.length > 1) {
                    this.currentRoute = l[1];
                }
                // setTimeout(() =>{
                //     this.checkLang();
                // });
            }
        });
    }

    checkLang() {
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang');
        if (lang && this.availableLangs.indexOf(lang) > -1) {
            this.changeGlobalLang(lang);
        } else {
            this.config.lang_change = this.translate.getDefaultLang();
        }
    }

}
