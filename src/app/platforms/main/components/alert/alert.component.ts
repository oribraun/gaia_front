/**
 * Created by ori on 4/27/2017.
 */

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AlertService} from "../../services/alert.service";
import {animate, keyframes, state, style, transition, trigger, useAnimation} from "@angular/animations";
import {bounceIn, bounceOut} from "../../../shared/animations/bounce.animation";


@Component({
    // moduleId: module.id,
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.less'],
    animations: [
        trigger('openClose', [
            state('open', style({
                height: '*'
                // opacity: 1
            })),
            state('closed', style({
                height: '0'
                // opacity: 0
            })),
            transition('* => closed', [
                animate('.3s')
                // animate('.5s', keyframes([
                //     style({paddingTop: '0'}),
                //     style({paddingTop: '4%'}),
                //     style({paddingTop: '0'}),
                //     style({ height: '0'})
                // ]))
            ]),
            transition('* => open', [
                animate('.3s')
                // animate('.5s', keyframes([
                //     style({ height: '0'}),
                //     style({ height: '150px'}),
                //     style({ height: '*'}),
                // ]))
            ])
        ]),
        trigger('bounce', [
            transition(
                'void => *',
                useAnimation(bounceIn, {
                    params: { timing: 0.7 }
                })
            ),
            transition(
                '* => void',
                useAnimation(bounceOut, {
                    params: { timing: 0.6 }
                })
            )
        ])
    ]
})

export class AlertComponent implements OnInit, AfterViewInit {
    public message: any = {};
    public messageTimeout: any;
    public tempMessage: any = {};
    private alertService: AlertService;
    public animationDisabled = true;

    constructor(alertService: AlertService) {
        this.alertService = alertService;
    }

    ngOnInit() {
        this.alertService.getMessage().subscribe(message => {
            this.message = message;
            this.tempMessage = this.message;
            if (this.messageTimeout) {
                clearTimeout(this.messageTimeout);
            }
            if (this.message.timeout > -1) {
                this.messageTimeout = setTimeout(() => {
                    this.clear();
                }, this.message.timeout);
            }
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.animationDisabled = false;
        });
    }

    animationDone(event: any) {
        if (event.fromState === 'open') {
            // finished closing
            this.tempMessage = {};
        }
    }



    clear() {
        this.message = {};
    }
}
