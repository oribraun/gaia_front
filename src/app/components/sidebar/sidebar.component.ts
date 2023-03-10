import { Component, OnInit } from '@angular/core';
import {IsActiveMatchOptions, Router} from "@angular/router";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";

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
    user: any;
    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
    ) { }

    ngOnInit(): void {
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
        this.config.resetUserCreds();
        this.router.navigate(['/'])
    }

}
