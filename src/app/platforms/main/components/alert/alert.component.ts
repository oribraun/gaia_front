/**
 * Created by ori on 4/27/2017.
 */

import { Component, OnInit } from '@angular/core';
import {AlertService} from "../../services/alert.service";


@Component({
    // moduleId: module.id,
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.less']
})

export class AlertComponent {
    public message: any;
    public messageTimeout: any;
    private alertService: AlertService;

    constructor(alertService: AlertService) {
        this.alertService = alertService;
    }

    ngOnInit() {
        this.alertService.getMessage().subscribe(message => {
            this.message = message;
            clearTimeout(this.messageTimeout);
            this.messageTimeout = setTimeout(() => {
                this.clear()
            }, 3000);
        });
    }

    clear() {
        this.message = "";
    }
}
