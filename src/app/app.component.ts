import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Config} from "./config";
import {User} from "./entities/user";
import {ActivatedRoute, Params} from "@angular/router";

// declare var STATIC_URL: any;
declare var USER: any;
declare var TOKEN: any;
declare var HOST: any;
declare var SCHEME: any;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    title = 'frontend';
    user!: User;
    constructor(
        private config: Config,
        private route: ActivatedRoute
    ) {
        setTimeout(() => {
            this.setupCredsFromServer();
        })
        this.setupCredsFromServer();
        this.closeOnGmailCallback();
    }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        // setTimeout is because we need to wait for all components subscriptions to config changes
        // setTimeout(() => {
        //     this.setupCredsFromServer()
        // })
    }

    setupCredsFromServer() {
        // if (typeof STATIC_URL !== 'undefined' && STATIC_URL !== "{% static 'client/' %}") {
        //   this.config.staticServerPath = STATIC_URL;
        // }
        if (typeof USER !== 'undefined' && USER !== 'AnonymousUser' && USER !== '{{ user | safe }}') {
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
        if (this.config.getCookie('csrftoken')) {
            this.config.csrf_token = this.config.getCookie('csrftoken');
        }
        if (this.config.getCookie('token', true)) {
            this.config.token = this.config.getCookie('token', true);
        }
        if (this.config.getCookie('user', true)) {
            this.config.user = JSON.parse(this.config.getCookie('user', true));
        }

    }

    closeOnGmailCallback() {
        this.route.queryParams
            .subscribe((params: Params) => {
                    const gmail_callback = params['gmail_callback'] === 'true'
                    if (gmail_callback) {
                        window.close()
                    }
                }
            );
    }

}
