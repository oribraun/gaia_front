import { Component, OnInit } from '@angular/core';
import {IsActiveMatchOptions, Router} from "@angular/router";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {User} from "../../entities/user";

declare var $: any;
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent implements OnInit {

    routerLinkActiveOptions: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "exact",
        queryParams: 'subset',
        matrixParams: 'subset'
    }
    routerLinkActiveOptionsWithChildrens: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "subset",
        queryParams: 'subset',
        matrixParams: 'subset'
    }
    user!: User;
    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            this.applyTooltip()
        });
        this.applyTooltip()
    }

    applyTooltip() {
        $(function () {
            $('[data-toggle="tooltip"]').tooltip({
                trigger : 'hover'
            })
        })
    }

    async logout(e: Event) {
        e.preventDefault();
        const response = await this.apiService.logout().toPromise();
        this.config.resetCookies();
        this.config.resetUserCreds();
        this.router.navigate(['/'])
    }

}
