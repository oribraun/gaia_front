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
        headers: new HttpHeaders(),
        withCredentials: true // Whether this request should be sent with outgoing credentials
    };
    private httpOptionsWithoutCreds = {
        // headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        headers: new HttpHeaders(),
        withCredentials: false // Whether this request should be sent with outgoing credentials
    };
    constructor(
        private http: HttpClient,
        private config: Config
    ) {
        this.headers['GAIA-AI-TOKEN'] = 'user token test'
        this.config.csrf_token_subject.subscribe((csrf_token) => {
            // this.headers['X-CSRFToken'] = csrf_token;
        })
        this.config.token_subject.subscribe((token) => {
            if (!environment.production) {
                this.httpOptionsWithCreds.headers.delete('Authorization');
                this.httpOptionsWithoutCreds.headers.delete('Authorization');
                if (token) {
                    this.httpOptionsWithCreds.headers.set('Authorization', 'Token ' + token)
                    this.httpOptionsWithoutCreds.headers.set('Authorization', 'Token ' + token)
                }
            }
        })
        this.config.token_subject.subscribe((token) => {
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
        })
    }

    login(email: string, password: string) {
        return this.http.post(this.serverBase + this.baseApiAuth + 'login', {
                email: email,
                password: password
            },
            this.httpOptionsWithCreds
        )
    }
    register(email: string, username: string, password: string) {
        return this.http.post(this.serverBase + this.baseApiAuth + 'register', {
                email: email,
                username: username,
                password: password
            },
            this.httpOptionsWithCreds
        )
    }

    forgotPassword(email: string) {
        return this.http.post(this.serverBase + this.baseApiAuth + 'forgot-pass', {
                email: email
            },
            this.httpOptionsWithCreds
        )
    }

    logout() {
        return this.http.post(this.serverBase + this.baseApiAuth + 'logout', {},
            this.httpOptionsWithCreds
        )
    }

    promptOptimizer(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'prompt_optimizer', {
                prompt: prompt
            },
            this.httpOptionsWithCreds
        )
    }
    upload(formData: FormData) {
        return this.http.post(this.serverBase + this.baseApi + 'upload', formData,
            this.httpOptionsWithCreds
        )
    }

    analyze(filePath: string) {
        return this.http.post(this.serverBase + this.baseApi + 'analyze', {'file_path': filePath},
            this.httpOptionsWithCreds
        )
    }

    privacyModel(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'privacy-model', {'prompt': prompt},
            this.httpOptionsWithCreds
        )
    }

    collectUserPrompt(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'collect-user-prompt', {'prompt': prompt},
            this.httpOptionsWithCreds
        )
    }
    getAnswer(prompt: string) {
        return this.http.post(this.serverBase + this.baseApi + 'get-answer', {'prompt': prompt},
            this.httpOptionsWithCreds
        )
    }
}
