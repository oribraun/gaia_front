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
                }
                this.gettingVocabulary = false;
            },
            error: (error) => {
                console.log('getVocabulary error', error)
                this.gettingVocabulary = false;
            },
        })
    }
}
