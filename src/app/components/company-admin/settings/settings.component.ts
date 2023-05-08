import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../../entities/user";
import {Config} from "../../../config";
import {ApiService} from "../../../services/api.service";
import {lastValueFrom} from "rxjs";
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {

    user!: User;
    company: any;
    errMessage = '';
    successMessage = '';
    howToImplement = '';
    // @Input() company: any;
    constructor(
        private config: Config,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        console.log('company', this.company)
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        // this.getCompanySettings()
    }

    getCompanyFromParent() {

    }

    async getCompanySettings() {
        const response: any = await lastValueFrom(this.apiService.getCompany({}));
        if (!response.err) {
            if (!response.data) {
                this.errMessage = 'Company do not exist';
            } else {
                this.company = response.data;
                this.setHowToImplement();
            }
        } else {
            this.errMessage = response.errMessage;
        }
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
url = '${environment.serverUrl}api/ct/smart-router'
postData(url, data, token)

# get conversation history:
token = '${this.company.api_token}'
data = {conversation_id: 'some_conversation_id'}
url = '${environment.serverUrl}api/ct/get-conversation-history'
postData(url, data, token)
`;
    }

    async saveCompanySettings() {
        this.resetMessages();
        const obj = {
            id: this.company.id,
            open_ai_key: this.company.open_ai_key,
            open_ai_model: this.company.open_ai_model,
            pre_prompt: this.company.pre_prompt
        }
        const response: any = await lastValueFrom(this.apiService.setCompany(obj));
        if (!response.err) {
            this.successMessage = 'successfully saved!';
        } else {
            this.errMessage = response.errMessage;
        }
    }

    resetMessages() {
        this.errMessage = '';
        this.successMessage = '';
    }

}
