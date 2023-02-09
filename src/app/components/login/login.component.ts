import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {ActivatedRoute, Router} from "@angular/router";

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
            const response: any = await this.apiService.login(this.email,this.email,this.password).toPromise();
            this.setupUser(response);
            this.router.navigate(['/'])
        } catch (error) {
            console.error(error);
        }
    }

    async register() {
        try {
            const response = await this.apiService.register(this.email, this.username, this.password).toPromise();
            // console.log(response);
            this.setupUser(response);
            this.router.navigate(['/'])
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
        this.config.csrf_token = this.getCookie('csrftoken');
    }

    getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts: any = value.split(`; ${name}=`);
        if (parts && parts.length === 2) {
            return parts.pop().split(';').shift();
        } else {
            return '';
        }
    }

}
