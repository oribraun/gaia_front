import {Component, OnInit} from '@angular/core';
import {animate, style, transition, trigger, state} from "@angular/animations";
import {User} from "../../../shared/entities/user";
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-review',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.less'],
    animations: [
        trigger('openClose', [
            state('open', style({
                height: '*',
                padding: '0.75rem',
                opacity: 1
            })),
            state('closed', style({
                height: '0',
                padding: '0',
                opacity: 0
            })),
            transition('* => closed', [
                animate('.3s')
            ]),
            transition('* => open', [
                animate('.3s')
            ])
        ])
    ]
})
export class ReviewComponent implements OnInit {
    user!: User;

    questions!: any[];
    gettingQuestions = false;

    showFilters = true;

    gotFirstQuestions = false;

    dateOptions = [
        'All Time',
        'Today',
        'Last 7 days',
        'Last 30 days'
    ];
    groupTypeOptions: any[] = [];
    difficultyOptions: any[] = [
        {key: 1, value: 'Easy'},
        {key: 2, value: 'Medium'},
        {key: 3, value: 'Hard'},
        {key: 4, value: 'Vary Hard'}
    ];
    filters: any = {
        date: '',
        group_type: {},
        // lessons: [],
        // types: [],
        difficulty: []
        // slower_then_average: false
    };

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
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }

    getQuestions() {
        this.questions = [];
        this.gettingQuestions = true;
        this.apiService.getQuestions({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getVocabulary err', response);
                } else {
                    this.questions = response.questions;
                    this.groupTypeOptions = response.group_types;
                }
                this.gettingQuestions = false;
                setTimeout(() => {
                    this.gotFirstQuestions = true;
                });
            },
            error: (error) => {
                console.log('getVocabulary error', error);
                this.gettingQuestions = false;
            }
        });
    }

    toggleFilters() {
        this.showFilters = !this.showFilters;
    }

    filter(obj_key: string, key: any) {
        if (this.filters[obj_key]) {
            const index = this.filters[obj_key].indexOf(key);
            if (index > -1) {
                this.filters[obj_key].splice(index, 1);
            } else {
                this.filters[obj_key].push(key);
            }
        }
    }

    getFilterQuestions() {
        return this.questions.filter((o) => {
            let show = true;
            // {
            //     "date": "All Time",
            //     "group_type": {
            //         "key": 1,
            //         "value": "writing"
            //     },
            //     "lessons": [],
            //     "types": [],
            //     "difficulty": [
            //         1
            //     ],
            //     "slower_then_average": false
            // }
            // {
            //     "id": 7,
            //     "created": "2023-11-08T09:57:19.620409Z",
            //     "title": "The Impact of COVID-19 on Children_1",
            //     "section": "reading",
            //     "type": "open_question",
            //     "score": 0,
            //     "difficulty": 1,
            //     "presentation_question_id": 1,
            //     "pace": 6,
            //     "avg_pace": 0,
            //     "hint_used": true,
            //     "user_lesson_id": 2,
            //     "lesson_title": "unseen title"
            // }
            if (this.filters.date && this.filters.date !== 'All Time') {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                let dateOffset = (24 * 60 * 60 * 1000) * 7;
                const created = new Date(o.created);
                created.setHours(0, 0, 0, 0);
                if (this.filters.date == 'Last 7 days') {
                    d.setTime(d.getTime() - dateOffset);
                } else if (this.filters.date == 'Last 30 days') {
                    dateOffset = (24 * 60 * 60 * 1000) * 30;
                    d.setTime(d.getTime() - dateOffset);
                }
                if (d.getTime() > created.getTime()) {
                    show = false;
                }
            }
            if (this.filters.group_type.value && this.filters.group_type.value != o.section) {
                show = false;
            }
            if (this.filters.difficulty.length && this.filters.difficulty.indexOf(o.difficulty) === -1) {
                show = false;
            }
            return show;
        });
    }

    private padZero(value: number): string {
        return value.toString().padStart(2, '0');
    }
}
