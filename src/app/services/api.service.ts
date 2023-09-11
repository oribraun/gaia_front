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
    version = 'v1/';
    baseApiOld = 'api/';
    baseApi = 'api/' + this.version;
    baseApiAuth = this.baseApi + 'auth/';
    baseApiUser = this.baseApi + 'us/';
    baseApiCompany = this.baseApi + 'co/';
    baseApiCompanyAdmin = this.baseApi + 'coa/';
    baseApiCompanyToken = this.baseApiOld + 'ct/';
    baseApiAdmin = this.baseApi + 'adm/';
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
    compareVendorsUpload(formData: FormData) {
        return this.http.post(this.serverBase + this.baseApiUser + 'compare-vendors-upload', formData,
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
    sendToChatbot(question: string, chatbot: string) {
        return this.http.post(this.serverBase + this.baseApiUser + 'chatbots', {question: question, chatbot: chatbot},
            this.httpOptions
        )
    }
    getUserEmails(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'gmail-use', obj,
            this.httpOptions
        )
    }
    getUserAuthUrl(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'gmail-auth', obj,
            this.httpOptions
        )
    }
    checkUserAuth(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'gmail-auth-check', obj,
            this.httpOptions
        )
    }
    getLessons(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-lessons', obj,
            this.httpOptions
        )
    }
    getPresentation(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-presentation', obj,
            this.httpOptions
        )
    }
    sendAnswer(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'save_class_page_answer', obj,
            this.httpOptions
        )
    }
    getPresentationReplay(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-presentation-reply', obj,
            this.httpOptions
        )
    }
    getHeartBeatReply(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-heartbeat-reply', obj,
            this.httpOptions
        )
    }
    getNewSlideReply(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-new-slide-reply', obj,
            this.httpOptions
        )
    }
    changeSlideReply(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'change-slide-reply', obj,
            this.httpOptions
        )
    }
    getNextSlide(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-next-slide', obj,
            this.httpOptions
        )
    }
    getPrevSlide(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'get-prev-slide', obj,
            this.httpOptions
        )
    }
    resetPresentation(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'reset-presentation', obj,
            this.httpOptions
        )
    }
    generateImage(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'generate-image', obj,
            this.httpOptions
        )
    }
    textToSpeech(obj: any) {
        return this.http.post(this.serverBase + this.baseApiUser + 'text-to-speech', obj,
            this.httpOptions
        )
    }    
    audioToText(obj: any) {
        const httpOptions = {...this.httpOptions}
        httpOptions['Content-Type'] = 'application/octet-stream';
        return this.http.post(this.serverBase + this.baseApiUser + 'audio_to_text', obj,
            httpOptions
        )
    }
    sendAnswerStream(obj: any) {
        const httpOptions = {...this.httpOptions}
        // httpOptions['responseType'] = 'arraybuffer' as 'json';
        // httpOptions['observe'] = 'response' as 'body';
        httpOptions['responseType'] = 'arraybuffer'; // Set the response type to arraybuffer
        httpOptions['observe'] = 'events';
        httpOptions['reportProgress'] = true;
        return this.http.post(this.serverBase + this.baseApiUser + 'stream_audio', obj,
            httpOptions,
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
    getConversationHistory(obj: any, api_token = '') {
        const httpOptions: any = {
            headers: {
                'GAIA-AI-TOKEN': api_token ? api_token : ''
            }
        }
        return this.http.post(this.serverBase + this.baseApiCompanyToken + 'get-conversation-history', obj,
            httpOptions
        )
    }
    getSmartRouter(prompt: string, conversation_id: string, stream: boolean, gaia_token = '') {
        const httpOptions = {...this.httpOptions}
        httpOptions['responseType'] = 'text';
        httpOptions['observe'] = 'events';
        httpOptions['reportProgress'] = true;
        httpOptions.headers['GAIA-AI-TOKEN'] = gaia_token ? gaia_token : '';
        return this.http.post(this.serverBase + this.baseApiCompanyToken + 'smart-router', {
                prompt: prompt,
                conversation_id: conversation_id,
                stream: stream
            },
            httpOptions
        )
    }
    sendToChatBot(prompt: string, conversation_id: string, stream: boolean, api_token = '') {
        const httpOptions: any = {
            // headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            headers: {
                'GAIA-AI-TOKEN': api_token ? api_token : ''
            },
            responseType: 'text',
            observe: 'events',
            reportProgress: true,
            // withCredentials: true // Whether this request should be sent with outgoing credentials
        }
        // httpOptions['responseType'] = 'text';
        // httpOptions['observe'] = 'events';
        // httpOptions['reportProgress'] = true;
        // httpOptions.headers['GAIA-AI-TOKEN'] = api_token ? api_token : '';
        const body: any = {
            prompt: prompt,
            conversation_id: conversation_id,
            stream: stream
        }
        return this.http.post(this.serverBase + this.baseApiCompanyToken + 'chatbot', body,
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
