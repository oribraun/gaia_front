import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom} from "rxjs";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
    formType = 'login';
    formTypeOptions = ['login', 'register', 'forgot'];
    email: string = '';
    password: string = '';
    username: string = '';
    baseApi = 'http://localhost:8000/api/auth/';
    user: any = {};
    loginErr = '';

    constructor(
        private http: HttpClient,
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((paramMap) => {
            const type = paramMap.get('type')
            if (type && this.formTypeOptions.indexOf(type) > -1) {
                this.formType = type;
            }
        })
    }

    async login() {
        try {
            this.loginErr = '';
            const response: any = await lastValueFrom(this.apiService.login(this.email,this.password));
            if (!response.err) {
                const data = response.data;
                this.setupUser(data);
                this.router.navigate([''])
            } else {
                this.loginErr = response.errMessage;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async register() {
        try {
            this.loginErr = '';
            const response: any = await this.apiService.register(this.email, this.username, this.password).toPromise();
            console.log('response', response);
            if (!response.err) {
                const data = response.data;
                this.setupUser(data);
                this.router.navigate(['/'])
            } else {
                if (Array.isArray(response.errMessage)) {
                     this.loginErr = response.errMessage.join('</br>');
                } else {
                    this.loginErr = response.errMessage;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async forgot() {
        try {
            const response: any = await this.apiService.forgotPassword(this.email).toPromise();
            if (!response.err) {
                console.log('email sent successfully, please check your email')
            }
        } catch (error) {
            console.error(error);
        }
    }

    setupUser(response: any) {
        this.user = response;
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
        if (!token || !clientRunningOnServerHost) { // meaning it's not served by django server
            const csrftoken_exp = response.csrftoken_exp
            const user = response.user
            const d = new Date(csrftoken_exp)
            this.config.setCookie('user', JSON.stringify(user), d, true);
            this.config.user = JSON.parse(this.config.getCookie('user', true));
        }
    }

}
