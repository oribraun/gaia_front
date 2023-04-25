import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-how-to-implement',
    templateUrl: './how-to-implement.component.html',
    styleUrls: ['./how-to-implement.component.less']
})
export class HowToImplementComponent implements OnInit {

    company: any;
    howToImplement = '';
    constructor() { }

    ngOnInit(): void {

    }

}
