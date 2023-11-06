import {Component, OnInit} from '@angular/core';
import {User} from "../../../main/entities/user";
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.less']
})
export class ReviewComponent implements OnInit {
    user!: User;

    questions!: any[];
    gettingQuestions = false;

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.getUser();
        this.getQuestions();
    }



    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    getQuestions() {
        this.questions = []
        this.gettingQuestions = true;
        this.apiService.getQuestions({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getVocabulary err', response)
                } else {
                    this.questions = response.questions;
                }
                this.gettingQuestions = false;
            },
            error: (error) => {
                console.log('getVocabulary error', error)
                this.gettingQuestions = false;
            },
        })
    }
}
