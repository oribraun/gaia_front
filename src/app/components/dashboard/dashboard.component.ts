import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../services/api.service";
import {lastValueFrom} from "rxjs";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
    results = [];
    constructor(
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.getDashBoard();
    }

    async getDashBoard() {
        const response: any = await lastValueFrom(this.apiService.getDashboard());
        console.log('response', response)
        this.results = response;
    }

}
