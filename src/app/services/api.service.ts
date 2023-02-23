import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Config} from "../config";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // serverBase = 'http://localhost:8000/';
    serverBase = environment.serverUrl;
    baseApi = 'api/';
    baseApiAuth = 'api/auth/';
    headers: any = {}
    private httpOptionsWithCreds = {
        // headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        headers: new HttpHeaders({}),
        withCredentials: true // Whether this request should be sent with outgoing credentials
    };
    private httpOptionsWithoutCreds = {
        // headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        headers: new HttpHeaders({}),
        withCredentials: false // Whether this request should be sent with outgoing credentials
    };
    private httpOptions: any = {
        // headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        headers: {},
        withCredentials: true // Whether this request should be sent with outgoing credentials
    };
    constructor(
        private http: HttpClient,
        private config: Config
    ) {
        this.headers['GAIA-AI-TOKEN'] = 'user token test'
        this.config.csrf_token_subject.subscribe((csrf_token) => {
            // console.log('csrf_token', csrf_token)
            // if (environment.production) {
                this.httpOptions.headers['X-CSRFToken'] = csrf_token;
            // }
            // this.httpOptionsWithCreds.headers.set('X-CSRFToken', csrf_token)
        })
        this.config.token_subject.subscribe((token) => {
            if (!environment.production) {
                this.httpOptionsWithCreds.headers.delete('Authorization');
                this.httpOptionsWithoutCreds.headers.delete('Authorization');
                delete this.httpOptions.headers['Authorization'];
                if (token) {
                    this.httpOptionsWithCreds.headers.set('Authorization', 'Token ' + token)
                    this.httpOptionsWithoutCreds.headers.set('Authorization', 'Token ' + token)
                    this.httpOptions.headers['Authorization'] = 'Token ' + token;
                }
            }
        })
        // this.config.token_subject.subscribe((token) => {
            // delete this.headers['Authorization']
            // if (!environment.production) {
            // delete this.headers['X-CSRFToken']
            // if (token) {
            //     this.headers['X-CSRFToken'] = token;
            // }
            // if (token) {
            //     this.headers['Authorization'] = 'Token ' + token;
            // }
            // }
        // })
        this.config.server_host_subject.subscribe((host) => {
            this.serverBase = this.config.server_host;
        })
        if (this.config.server_host) {
            this.serverBase = this.config.server_host;
        }
    }

    login(email: string, password: string) {
        return this.http.post(this.serverBase + this.baseApiAuth + 'login', {
                email: email,
                password: password
            },
            this.httpOptions
        )
    }
    register(email: string, username: string, password: string) {
        return this.http.post(this.serverBase + this.baseApiAuth + 'register', {
                email: email,
                username: username,
                password: password
            },
            this.httpOptions
        )
    }

    forgotPassword(email: string) {
        return this.http.post(this.serverBase + this.baseApiAuth + 'forgot-pass', {
                email: email
            },
            this.httpOptions
        )
    }

    logout() {
        return this.http.post(this.serverBase + this.baseApiAuth + 'logout', {},
            this.httpOptions
        )
    }

    promptOptimizer(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'prompt_optimizer', {
                prompt: prompt
            },
            this.httpOptions
        )
    }
    upload(formData: FormData) {
        return this.http.post(this.serverBase + this.baseApi + 'upload', formData,
            this.httpOptions
        )
    }

    analyze(filePath: string) {
        return this.http.post(this.serverBase + this.baseApi + 'analyze', {'file_path': filePath},
            this.httpOptions
        )
    }

    privacyModel(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'privacy-model', {'prompt': prompt},
            this.httpOptions
        )
    }

    collectUserPrompt(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'collect-user-prompt', {'prompt': prompt},
            this.httpOptions
        )
    }
    getAnswer(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'get-answer', {'prompt': prompt},
            this.httpOptions
        )
    }
}
