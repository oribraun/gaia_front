import {Component, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {ActivatedRoute, ParamMap, Params, Router} from "@angular/router";
import {AlertService} from "../../../main/services/alert.service";
import {HelperService} from "../../../main/services/helper.service";
import {GeneralService} from "../../services/general/general.service";
import {TranslateService} from "@ngx-translate/core";
import {User} from "../../../shared/entities/user";
import {Kit, KitItem, KitTest} from "../../entities/kit";

@Component({
    selector: 'app-kit-dashboard',
    templateUrl: './kit-dashboard.component.html',
    styleUrl: './kit-dashboard.component.less'
})
export class KitDashboardComponent implements OnInit {
    currentLang: string = "";
    imageSrc: string = '';
    user!: User;

    gettingKitDashboard = false;

    kitId: number;

    prep_progress = 20;
    tests: KitTest[] = [];
    kit: Kit;

    constructor(
        private config: Config,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private helperService: HelperService,
        private translate: TranslateService
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    ngOnInit(): void {
        this.getUser();
        const parentParmMap = this.route.parent?.paramMap;
        if (parentParmMap) {
            parentParmMap.subscribe((params: ParamMap) => {
                const id = params.get('id');
                if (id) {
                    this.kitId = parseInt(id);
                    this.getKitDashboard();
                }
            });
        }
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

    getKitDashboard() {
        this.gettingKitDashboard = true;
        this.apiService.getKitDashboard({id: this.kitId}).subscribe({
            next: (response: any) => {
                this.gettingKitDashboard = false;
                if (response.err) {
                    console.log('getKitDashboard error', response.errMessage);
                } else {
                    this.prep_progress = response.prep_progress;
                    if (response.tests) {
                        this.tests = response.tests.map((o: any) => new KitTest(o));
                    }
                    this.kit = new Kit(response.kit);
                }
            },
            error: (err: any) => {
                console.log('getKitDashboard error', err);
                this.gettingKitDashboard = false;
            }
        });
    }
}
