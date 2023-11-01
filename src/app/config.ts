import {Subject} from "rxjs";
import * as CryptoJS from 'crypto-js';
import {User} from "./entities/user";

const key = "My Secret Passphrase";

export class Config {
    private _user: User = new User();
    private _user_on_boarding: any = null
    private _server_host: string = '';
    private _token: string = '';
    private _csrf_token: string = '';
    private _server_host_subject: Subject<any> = new Subject<any>();
    private _user_subject: Subject<any> = new Subject<any>();
    private _user_on_boarding_subject: Subject<any> = new Subject<any>();
    private _token_subject: Subject<string> = new Subject<string>();
    private _csrf_token_subject: Subject<string> = new Subject<string>();
    private _staticImagePath = '';

    get user(): User {
        return this._user;
    }

    set user(value: any) {
        this._user = new User(value);
        this._user_subject.next(this.user);
    }

    get user_on_boarding(): any {
        return this._user_on_boarding;
    }

    set user_on_boarding(value: any) {
        this._user_on_boarding = value;
        this.user_on_boarding_subject.next(this.user_on_boarding);
    }

    get user_on_boarding_subject(): Subject<any> {
        return this._user_on_boarding_subject;
    }

    set user_on_boarding_subject(value: Subject<any>) {
        this._user_on_boarding_subject = value;
    }

    get server_host(): string {
        return this._server_host;
    }

    set server_host(value: string) {
        this._server_host = value;
        this.server_host_subject.next(this.server_host)
    }
    get token(): string {
        return this._token;
    }

    set token(value: string) {
        this._token = value;
        this._token_subject.next(this.token);
    }

    get csrf_token(): string {
        return this._csrf_token;
    }

    set csrf_token(value: string) {
        this._csrf_token = value;
        this._csrf_token_subject.next(this.csrf_token)
    }


    get user_subject(): Subject<any> {
        return this._user_subject;
    }

    set user_subject(value: Subject<any>) {
        this._user_subject = value;
    }

    get server_host_subject(): Subject<any> {
        return this._server_host_subject;
    }

    set server_host_subject(value: Subject<any>) {
        this._server_host_subject = value;
    }

    get token_subject(): Subject<any> {
        return this._token_subject;
    }

    set token_subject(value: Subject<any>) {
        this._token_subject = value;
    }

    get csrf_token_subject(): Subject<any> {
        return this._csrf_token_subject;
    }

    set csrf_token_subject(value: Subject<any>) {
        this._csrf_token_subject = value;
    }


    get staticImagePath(): string {
        return this._staticImagePath;
    }

    set staticImagePath(value: string) {
        this._staticImagePath = value;
    }

    resetUserCreds() {
        this.user = new User();
        this.token = '';
    }

    getCookie(name: string, decrypt = false) {
        const value = `${document.cookie}`;
        // console.log('value', value)
        const parts: any = value.split(`; `);
        // console.log('parts', parts)
        const str_search = name + '=';
        const found = parts.find((v: any) => (v.startsWith(str_search)));
        // console.log(name, found)
        if (found) {
            let val = found.replace(str_search, '')
            if (decrypt) {
                try {
                    val = this.Decrypt(val, key);
                } catch (err) {
                    val = '';
                }
            }
            return val;
        } else {
            return '';
        }
    }

    setCookie(name: string, val: string, exp: Date, encrypt=false) {
        let final_val = val;
        if (encrypt && val) {
            try {
                final_val = this.Encrypt(val, key).toString()
            } catch (err) {
                final_val = val;
            }
        }
        var c_value = final_val + "; expires=" + exp.toUTCString();
        document.cookie = name + "=" + c_value;
    }

    Encrypt(word: string, key = 'share') {
        let encJson = CryptoJS.AES.encrypt(JSON.stringify(word), key).toString()
        let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson))
        return encData
    }

    Decrypt(word: string, key = 'share') {
        let decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8)
        let bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8)
        return JSON.parse(bytes)
    }

    resetCookies(clean_csrftoken=true) {
        const exp = new Date()
        exp.setDate(exp.getDate()-5);
        this.setCookie('user', '', exp);
        this.setCookie('user-exp', '', exp);
        this.setCookie('token', '', exp);
        if (clean_csrftoken) {
            this.setCookie('csrftoken', '', exp);
        }
    }
}
