import {Component, OnInit} from '@angular/core';
import {User} from "../../../shared-slides/entities/user";
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.less']
})
export class PlanComponent implements OnInit {

    user!: User

    plans: any[] = []
    gettingPlans = false;

    constructor(
        private config: Config,
        private apiService: ApiService,
    ) {
    }

    ngOnInit(): void {
        this.getUser();
        this.getPlans();
    }

    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    getPlans() {
        this.plans = []
        this.gettingPlans = true;
        this.apiService.getPlans({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getPlans err', response)
                } else {
                    this.plans = response.questions;
                }
                this.gettingPlans = false;
            },
            error: (error) => {
                console.log('getPlans error', error)
                this.gettingPlans = false;
            },
        })
    }

}
