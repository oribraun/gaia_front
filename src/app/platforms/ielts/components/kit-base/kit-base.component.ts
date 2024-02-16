import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router, RouterOutlet} from "@angular/router";
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {HelperService} from "../../../main/services/helper.service";
import {TranslateService} from "@ngx-translate/core";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {User} from "../../../shared/entities/user";
import {Kit} from "../../entities/kit";

@Component({
    selector: 'app-kit-base',
    templateUrl: './kit-base.component.html',
    styleUrl: './kit-base.component.less',
    animations: [
        trigger('openClose', [
            state('open', style({
                height: '*',
                opacity: 1
            })),
            state('closed', style({
                height: '0',
                opacity: 0
            })),
            transition('* => closed', [
                animate('.3s')
            ]),
            transition('* => open', [
                animate('.3s')
            ])
        ])
    ]
})
export class KitBaseComponent implements OnInit {

    user!: User;
    currentLang: string = "";

    kitId: number;

    gettingKits = false;

    kit: Kit = new Kit({
        description: 'sample kit',
        direction: 'ltr',
        last_lesson_id: 1,
        parts: []
    });

    partsState: any = {};

    constructor(
        private config: Config,
        private router: Router,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private helperService: HelperService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.getUser();
        this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id');
            if (id) {
                this.kitId = parseInt(id);
                this.getKit();
            }
        });
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

    getKit() {
        this.gettingKits = true;
        this.apiService.getKit({id: this.kitId}).subscribe({
            next: (response: any) => {
                this.gettingKits = false;
                if (response.err) {
                    console.log('getKits error', response.errMessage);
                    if (response.errMessage.indexOf('does not exist') > -1) {
                        this.router.navigate([`/ielts/home`]);
                    }
                } else {
                    this.kit = new Kit(response.kit);
                }
            },
            error: (err: any) => {
                console.log('getKits error', err);
                this.gettingKits = false;
            }
        });
    }

    openCloseParts(index: number) {
        this.partsState[index] = this.partsState[index] === false;
    }
}
