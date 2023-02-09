import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    serverBase = 'http://localhost:8000/';
    baseApi = 'api/auth/';
    constructor(
        private http: HttpClient
    ) { }

    login(email: string, username: string, password: string) {
        return this.http.post(this.serverBase + this.baseApi + 'login', {
                email: email,
                username: email,
                password: password
            }
        )
    }
    register(email: string, username: string, password: string) {
        return this.http.post(this.serverBase + this.baseApi + 'register', {
                email: email,
                username: username,
                password: password
            }
        )
    }

    forgotPassword(email: string) {
        return this.http.post(this.serverBase + this.baseApi + 'forgot', {
                email: email
            }
        )
    }

    logout() {
        return this.http.post(this.serverBase + this.baseApi + 'logout', {}
        )
    }
}
