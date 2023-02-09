import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../../services/api.service";

@Component({
    selector: 'app-prompt-optimizer',
    templateUrl: './prompt-optimizer.component.html',
    styleUrls: ['./prompt-optimizer.component.less']
})
export class PromptOptimizerComponent implements OnInit {

    promptValue = '';
    resultsData: resultsDataClass = new resultsDataClass();
    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
    }

    async submitPrompt() {
        if (this.promptValue) {
            const response: any = await this.apiService.promptOptimizer(this.promptValue).toPromise()
            this.resultsData = new resultsDataClass(response.results)
        }
    }

}

class resultsDataClass {
    input: string = '';
    select_model: string = '';
    selected_ai_model: string = '';
    output: string = '';

    constructor(obj?: any) {
        if (obj) {
            for (let key in obj) {
                if (key in this && obj[key] !== undefined && obj[key] !== null) {
                    // @ts-ignore
                    this[key] = obj[key];
                }
            }
        }
    }
}
