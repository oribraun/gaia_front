import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {User} from "../../../shared/entities/user";
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-plan',
    templateUrl: './plan.component.html',
    styleUrls: ['./plan.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class PlanComponent implements OnInit {

    user!: User;

    plans: any[] = [];
    gettingPlans = false;

    currentLang = "";

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.getUser();
        this.getPlans();
        this.route.paramMap.subscribe((params) => {
            const lang = params.get('lang');
            if (lang) {
                this.currentLang = lang;
            }
        });
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }

    getPlans() {
        this.plans = [];
        this.gettingPlans = true;
        this.apiService.getPlans({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getPlans err', response);
                } else {
                    this.plans = response.plans;
                }
                this.gettingPlans = false;
            },
            error: (error) => {
                console.log('getPlans error', error);
                this.gettingPlans = false;
            }
        });
    }

    selectedItem(e: any, plan_id: number) {
        e.preventDefault();
        this.router.navigate([this.currentLang], { relativeTo: this.route, queryParams: { }});
        setTimeout(() => {
            this.router.navigate([this.currentLang], { relativeTo: this.route, queryParams: { authType: 'signup', plan: plan_id}});
        });
    }

}
