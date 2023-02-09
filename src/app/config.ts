import {Subject} from "rxjs";

export class Config {
  private _user: any = '';
  private _token: string = '';
  private _csrf_token: string = '';
  private _user_subject: Subject<any> = new Subject<any>();
  private _token_subject: Subject<string> = new Subject<string>();
  private _csrf_token_subject: Subject<string> = new Subject<string>();

    get user(): any {
        return this._user;
    }

    set user(value: any) {
        this._user = value;
        this._user_subject.next(this.user);
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

    resetUserCreds() {
        this.user = '';
        this.token = '';
    }
}
