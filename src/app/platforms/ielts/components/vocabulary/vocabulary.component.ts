import {Component, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../../../shared/entities/user";

@Component({
  selector: 'app-vocabulary',
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.less']
})
export class VocabularyComponent implements OnInit {
    user!: User;

    vocabulary!: any[];
    gettingVocabulary = false;
    lessonOptions: any[] = [];
    typeOptions: any[] = ['User', 'System'];
    difficultyOptions: any[] = [
        {key: 1, value: 'Easy'},
        {key: 2, value: 'Medium'},
        {key: 3, value: 'Hard'},
        {key: 4, value: 'Vary Hard'}
    ];

    filters: any = {
        lessons: [],
        types: [],
        difficulty: []
    };

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.getUser();
        this.getVocabulary();
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

    getFilterVocabs() {
        return this.vocabulary.filter((o) => {
            let show = true;
            if (this.filters.lessons.length && this.filters.lessons.indexOf(o.user_lesson_id) === -1) {
                show = false;
            }
            if (this.filters.difficulty.length && this.filters.difficulty.indexOf(o.difficulty) === -1) {
                show = false;
            }
            if (this.filters.types.length && this.filters.types.indexOf((o.presentation_slide_uuid ? 'User' : 'System')) === -1) {
                show = false;
            }
            return show;
        });
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }

    getVocabulary() {
        this.vocabulary = [];
        this.gettingVocabulary = true;
        this.apiService.getVocabulary({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getVocabulary err', response);
                } else {
                    this.vocabulary = response.vocabulary;
                    const lessonOptions = this.vocabulary.map((o) => {return {value: o.lesson_title, key: o.user_lesson_id};});
                    const keysMap = lessonOptions.map((o) => o.key);
                    this.lessonOptions = lessonOptions.filter((item, index) => keysMap.indexOf(item.key) === index);
                }
                this.gettingVocabulary = false;
            },
            error: (error) => {
                console.log('getVocabulary error', error);
                this.gettingVocabulary = false;
            }
        });
    }

    print(e: any) {
        e.preventDefault();
        window.print();
    }
}
