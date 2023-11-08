import {Component, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../../../main/entities/user";

@Component({
  selector: 'app-vocabulary',
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.less']
})
export class VocabularyComponent implements OnInit {
    user!: User;

    vocabulary!: any[];
    gettingVocabulary = false;
    lessonOptions: any[] = []
    typeOptions: any[] = ['User', 'System']
    difficultyOptions = [1, 2, 3, 4, 5]

    checkboxes: any = {
        lessons: [],
        types: [],
        difficulty: [],
    }

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
        if (this.checkboxes[obj_key]) {
            const index = this.checkboxes[obj_key].indexOf(key)
            if (index > -1) {
                this.checkboxes[obj_key].splice(index, 1)
            } else {
                this.checkboxes[obj_key].push(key)
            }
        }
    }

    getFilterVocabs() {
        return this.vocabulary.filter((o) => {
            let show = true;
            if (this.checkboxes.lessons.length && this.checkboxes.lessons.indexOf(o.user_lesson_id) === -1) {
                show = false;
            }
            if (this.checkboxes.difficulty.length && this.checkboxes.difficulty.indexOf(o.difficulty) === -1) {
                show = false;
            }
            if (this.checkboxes.types.length && this.checkboxes.types.indexOf((o.presentation_slide_uuid ? 'User': 'System')) === -1) {
                show = false;
            }
            return show;
        });
    }

    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    getVocabulary() {
        this.vocabulary = []
        this.gettingVocabulary = true;
        this.apiService.getVocabulary({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getVocabulary err', response)
                } else {
                    this.vocabulary = response.vocabulary;
                    let lessonOptions = this.vocabulary.map((o) => {return {value: o.lesson_title, key: o.user_lesson_id}})
                    let keysMap = lessonOptions.map((o) => o.key)
                    this.lessonOptions = lessonOptions.filter((item, index) => keysMap.indexOf(item.key) === index);
                }
                this.gettingVocabulary = false;
            },
            error: (error) => {
                console.log('getVocabulary error', error)
                this.gettingVocabulary = false;
            },
        })
    }

    print(e: any){
        e.preventDefault();
        window.print();
    }
}
