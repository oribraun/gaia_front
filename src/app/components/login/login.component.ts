import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
    formType = 'login'
    email: string = '';
    password: string = '';
    username: string = '';
    baseApi = 'http://localhost:8000/api/auth/';
    user: any = {};

    constructor(
        private http: HttpClient,
        private config: Config,
        private apiService: ApiService,
        private router: Router
    ) {
    }

    ngOnInit(): void {

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
            console.log(response);
            this.setupUser(response);
            this.router.navigate(['/'])
        } catch (error) {
            console.error(error);
        }
    }

    async forgot() {
        try {
            const response = await this.apiService.forgotPassword(this.email).toPromise();
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

    setupUser(response: any) {
        this.user = response;
        this.config.user = response.user;
        this.config.token = response.token;
    }

}
