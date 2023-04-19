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
    baseApiUser = 'api/us/';
    baseApiCompany = 'api/co/';
    baseApiCompanyAdmin = 'api/coa/';
    baseApiCompanyToken = 'api/ct/';
    baseApiAdmin = 'api/adm/';
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
    resendVerifyEmail(email: string) {
        return this.http.post(this.serverBase + this.baseApiAuth + 'resend_verify_email', {
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
        return this.http.post(this.serverBase + this.baseApiUser + 'prompt_optimizer', {
                prompt: prompt
            },
            this.httpOptions
        )
    }
    upload(formData: FormData) {
        return this.http.post(this.serverBase + this.baseApiUser + 'upload', formData,
            this.httpOptions
        )
    }

    analyze(filePath: string) {
        return this.http.post(this.serverBase + this.baseApiUser + 'analyze', {'file_path': filePath},
            this.httpOptions
        )
    }

    privacyModel(prompt: string) {
        return this.http.post(this.serverBase + this.baseApiUser + 'privacy-model', {'prompt': prompt},
            this.httpOptions
        )
    }

    collectUserPrompt(prompt: string) {
        return this.http.post(this.serverBase + this.baseApiUser + 'collect-user-prompt', {'prompt': prompt},
            this.httpOptions
        )
    }
    getAnswer(prompt: string) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-answer', {'prompt': prompt},
            this.httpOptions
        )
    }
    getAnswerStreaming(prompt: string) {
        const httpOptions = {...this.httpOptions}
        httpOptions['responseType'] = 'text';
        httpOptions['observe'] = 'events';
        httpOptions['reportProgress'] = true;
        return this.http.post(this.serverBase + this.baseApiUser + 'get-answer', {'prompt': prompt},
            httpOptions
        )
    }
    getAnswerCohereStreaming(prompt: string) {
        const httpOptions = {...this.httpOptions}
        httpOptions['responseType'] = 'text';
        httpOptions['observe'] = 'events';
        httpOptions['reportProgress'] = true;
        return this.http.post(this.serverBase + this.baseApiUser + 'get-answer-c', {'prompt': prompt},
            httpOptions
        )
    }
    compareVendors(prompt: string) {
        return this.http.post(this.serverBase + this.baseApiUser + 'compare-vendors', {'prompt': prompt},
            this.httpOptions
        )
    }
    getSettings(key: string) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-settings', {key: key},
            this.httpOptions
        )
    }
    setSettings(key: string, data: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'set-settings', {key: key, data: data},
            this.httpOptions
        )
    }
    getPluginDashboard(obj: any = {}) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-plugin-dashboard', obj,
            this.httpOptions
        )
    }
    getUserPrompts(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-user-prompts', obj,
            this.httpOptions
        )
    }
    getUserPrivacyModelPrompts(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-user-privacy-model-prompts', obj,
            this.httpOptions
        )
    }
    getCompanyUsers(obj: any) {
        // company_users_offset
        // company_users_limit
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'get-users', obj,
            this.httpOptions
        )
    }
    getCompanyUserInfo(obj: any) {
        // user_email = request.data['user_email']
        // user_prompts_offset = request.data['user_prompts_offset']
        // user_prompts_limit = request.data['user_prompts_limit']
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'get-user-info', obj,
            this.httpOptions
        )
    }
    getCompanyUserPrompts(obj: any) {
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'get-user-prompts', obj,
            this.httpOptions
        )
    }
    getCompanyUserPrivacyModelPrompts(obj: any) {
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'get-user-privacy-model-prompts', obj,
            this.httpOptions
        )
    }
    getDashboard(obj: any = {}) {
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'get-dashboard', obj,
            this.httpOptions
        )
    }
    getCompanyPrompts(obj: any = {}) {
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'get-company-prompts', obj,
            this.httpOptions
        )
    }
    getCompany(obj: any) {
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'get-company', obj,
            this.httpOptions
        )
    }
    setCompany(obj: any) {
        return this.http.post(this.serverBase + this.baseApiCompanyAdmin + 'set-company', obj,
            this.httpOptions
        )
    }
    getSmartRouter(prompt: string, stream: boolean, gaia_token = '') {
        const httpOptions = {...this.httpOptions}
        httpOptions['responseType'] = 'text';
        httpOptions['observe'] = 'events';
        httpOptions['reportProgress'] = true;
        httpOptions.headers['GAIA-AI-TOKEN'] = gaia_token ? '' : '';
        return this.http.post(this.serverBase + this.baseApiCompanyToken + 'smart-router', {'prompt': prompt, stream: stream},
            httpOptions
        )
    }
    getAdminCompanyInfo(obj: any) {
        return this.http.post(this.serverBase + this.baseApiAdmin + 'get-company-info', obj,
            this.httpOptions
        )
    }
    getAdminCompanies(obj: any) {
        return this.http.post(this.serverBase + this.baseApiAdmin + 'get-companies', obj,
            this.httpOptions
        )
    }
}
