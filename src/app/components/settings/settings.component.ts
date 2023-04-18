import { Component, OnInit } from '@angular/core';
import {User} from "../../entities/user";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {lastValueFrom} from "rxjs";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {

    user!: User;
    company: any;
    errMessage = ''
    successMessage = ''
    constructor(
        private config: Config,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        this.getCompanySettings()
    }

    async getCompanySettings() {
        const response: any = await lastValueFrom(this.apiService.getCompany({}));
        if (!response.err) {
            if (!response.data) {
                this.errMessage = 'Company do not exist';
            } else {
                this.company = response.data;
            }
        } else {
            this.errMessage = response.errMessage;
        }
    }

    async saveCompanySettings() {
        this.resetMessages();
        const obj = {
            id: this.company.id,
            open_ai_key: this.company.open_ai_key
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
