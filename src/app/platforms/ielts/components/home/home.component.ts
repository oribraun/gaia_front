import {Component, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {User} from "../../../shared/entities/user";
import {HelperService} from "../../../main/services/helper.service";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {ApiService} from "../../../main/services/api.service";
import {KitItem} from "../../entities/kit";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent implements OnInit {

    user!: User;
    currentLang: string = "";

    gettingUserKits = false;

    kits: any = [
        // {id: 1, title: 'English January 2024', direction: 'ltr', status: 'last visited 2 month ago'},
        // {id: 2, title: 'English January 2023', direction: 'rtl',  status: 'last visited 2 month ago'}
    ];

    constructor(
        private config: Config,
        private router: Router,
        private apiService: ApiService,
        private helperService: HelperService,
        private translate: TranslateService
    ) {

    }

    ngOnInit(): void {
        this.getUser();
        this.getUserKits();
        this.listenToGlobalChangeLang();
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }

    listenToGlobalChangeLang() {
        this.currentLang = this.translate.getDefaultLang();
        const lang = this.helperService.getLangFromLocalStorage();
        if (lang) {
            this.changeLang(lang);
        }
        this.config.lang_change.subscribe({
            next:(value: string) => {
               this.changeLang(value);
            }
        });
    }

    changeLang(lang: string) {
        this.currentLang = lang;
        this.translate.use(this.currentLang);
    }

    gotToKit(kitId: number) {
        this.router.navigate([`/${this.user.last_logged_platform}/kit/${kitId}/dashboard`]);
    }

    getUserKits() {
        this.gettingUserKits = true;
        this.apiService.getUserKits({}).subscribe({
            next: (response: any) => {
                this.gettingUserKits = false;
                if (response.err) {
                    console.log('getUserKits error', response.errMessage);
                } else {
                    if (response.kits) {
                        this.kits = response.kits.map((o: any) => new KitItem(o));
                    }
                }
            },
            error: (err: any) => {
                console.log('getUserKits error', err);
                this.gettingUserKits = false;
            }
        });
    }
}
