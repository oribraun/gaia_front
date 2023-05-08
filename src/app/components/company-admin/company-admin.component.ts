import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {IsActiveMatchOptions} from "@angular/router";
import {User} from "../../entities/user";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {lastValueFrom} from "rxjs";
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-company-admin',
    templateUrl: './company-admin.component.html',
    styleUrls: ['./company-admin.component.less']
})
export class CompanyAdminComponent implements OnInit {

    @ViewChild('header') header: ElementRef | undefined;
    @ViewChild('main') main: ElementRef | undefined;

    routerLinkActiveOptions: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "exact",
        queryParams: 'subset',
        matrixParams: 'subset'
    }

    user!: User;
    company: any;
    errMessage = '';
    successMessage = '';
    howToImplement = '';
    currentComponent: any;
    constructor(
        private config: Config,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        setTimeout(() => {
            this.setMainPos();
        })
        this.getCompanySettings()
    }

    async getCompanySettings() {
        const response: any = await lastValueFrom(this.apiService.getCompany({}));
        if (!response.err) {
            if (!response.data) {
                this.errMessage = 'Company do not exist';
            } else {
                this.company = response.data;
                this.setHowToImplement()
                if (this.currentComponent) {
                    this.currentComponent.company = this.company;
                    this.currentComponent.howToImplement = this.howToImplement;
                }
            }
        } else {
            this.errMessage = response.errMessage;
        }
    }

    onOutletLoaded(component: any) {
        // component.company = this.company;
        this.currentComponent = component;
        this.currentComponent.company = this.company;
        this.currentComponent.howToImplement = this.howToImplement;
        // if (component instanceof MyComponent1) {
        //     component.someInput = 123;
        //   } else if (component instanceof MyComponent2) {
        //     component.anotherInput = 456;
        //   }
    }

    setHowToImplement() {
        this.howToImplement = `function postData(url = '', data = {}, token = '') {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    })
    .then(response => response.json());
}

# send question:
token = '${this.company.api_token}'
data = {prompt: 'Hi', stream: false, conversation_id: 'some_conversation_id'}
url = '${environment.serverUrl}api/ct/chatbot'
postData(url, data, token)

# get conversation history:
token = '${this.company.api_token}'
data = {conversation_id: 'some_conversation_id'}
url = '${environment.serverUrl}api/ct/get-conversation-history'
postData(url, data, token)
`;
    }

    setMainPos() {
        if (this.header) {
            const height = this.header.nativeElement.clientHeight;
            if (this.main) {
                this.main.nativeElement.style.top = height + 'px';
            }
        }
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.setMainPos();
    }

}
