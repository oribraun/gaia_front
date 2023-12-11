import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Config} from "./config";
import {User} from "../shared-slides/entities/user";
import {ActivatedRoute, NavigationEnd, Params, Router} from "@angular/router";
import {WebSocketService} from "./services/web-sockets/web-socket.service";
import {HelperService} from "./services/helper.service";
import {environment} from "../../../environments/environment";

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
    constructor(
        private config: Config,
        private webSocketService: WebSocketService,
        private helperService: HelperService,
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
        // TODO remove after demo
        if (this.user.id && window.location.pathname === '/') {
            this.redirectUser();
        }
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            this.updateUserCookie();
        });
        this.getCurrentRoute();
        // setTimeout is because we need to wait for all components subscriptions to config changes
        setTimeout(() => {
            this.setupCredsFromServer();
        });

        let redirectUser = false;
        this.route.queryParams.subscribe((params) => {
            if (params['redirectUser']) {
                redirectUser = params['redirectUser'];
            }
            if (redirectUser) {
                this.redirectUser();
            }
        });
    }

    redirectUser() {
        const returnUrl = this.helperService.getUserReturnUrl(this.user);
        this.router.navigateByUrl(returnUrl);
    }

    setupCredsFromServer() {
        // if (typeof STATIC_URL !== 'undefined' && STATIC_URL !== "{% static 'client/' %}") {
        //   this.config.staticServerPath = STATIC_URL;
        // }
        let gotUserFromServer = false;
        if (typeof USER !== 'undefined' && USER !== 'AnonymousUser' && USER !== '{{ user | safe }}') {
            gotUserFromServer = true;
            this.config.user = JSON.parse(USER);
        } else {
            this.config.user_subject.next('');
        }
        // console.log('csrf_token', TOKEN)
        // if (typeof TOKEN !== 'undefined' && TOKEN !== '{{ csrf_token }}') {
        //     this.config.csrf_token = TOKEN;
        // }
        if (typeof HOST !== 'undefined' && HOST !== '{{ request.get_host }}') {
            this.config.server_host = SCHEME + '://' + HOST + '/';
        }
        // console.log('this.config.getCookie(\'csrftoken\')', this.config.getCookie('csrftoken'))
        const csrftoken = this.config.getCookie('csrftoken');
        if (csrftoken) {
            this.config.csrf_token = csrftoken;
        }
        const token = this.config.getCookie('token', true);
        if (token) {
            this.config.token = token;
        }
        const user = this.config.getCookie('user', true);
        const user_exp = this.config.getCookie('user_exp', true);
        if (user && !gotUserFromServer) {
            this.config.user = JSON.parse(user);
        }
        if (!csrftoken || !token || !user || !user_exp) {
            this.config.resetCookies(false);
            this.config.resetUserCreds();
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
            }
        });
    }

}
