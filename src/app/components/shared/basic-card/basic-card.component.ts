import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-basic-card',
    templateUrl: './basic-card.component.html',
    styleUrls: ['./basic-card.component.less'],
})
export class BasicCardComponent implements OnInit {

    @Input('class') class: string = '';
    @Input('header') header: string = '';
    @Input('value') value: number = -1;
    @Input('valueAddon') valueAddon: string = '';
    @Input('badge') badge: string = '';
    @Input('caret') caret: string = '';
    @Input('chartOptions') chartOptions: any;
    constructor() { }

    ngOnInit(): void {
    }

}
