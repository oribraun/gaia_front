import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Config} from "./config";

// declare var STATIC_URL: any;
declare var USER: any;
declare var TOKEN: any;
declare var HOST: any;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    title = 'frontend';
    constructor(
        private config: Config
    ) {}

    ngOnInit(): void {
        // setTimeout is because we need to wait for all components subscriptions to config changes
        setTimeout(() => {
            this.setupCredsFromServer()
        })
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
            this.config.server_host = HOST;
        }
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

}
