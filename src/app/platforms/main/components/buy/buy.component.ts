import {Component, OnInit} from '@angular/core';
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {ActivatedRoute, ParamMap} from "@angular/router";

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.less']
})
export class BuyComponent implements OnInit {
    course_id!: number;

    course: any;

    gettingCourse = false;

    constructor(
        private config: Config,
        private apiService: ApiService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            const lesson_id = params.get('course_id');
            if (lesson_id) {
                this.course_id = parseInt(lesson_id);
            }
        });
        if (this.course_id) {
            this.getCourse();
        }
    }

    getCourse() {
        this.reset();
        this.gettingCourse = true;
        const obj: any = {};
        obj['course_id'] = this.course_id;
        this.apiService.getCourse(obj).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getCourse err', response);
                } else {
                    this.course = response.course;
                    // this.purchasedCourses = response.purchased_courses;
                }
                this.gettingCourse = false;
            },
            error: (error) => {
                console.log('getCourse error', error);
                this.gettingCourse = false;
            }
        });
    }

    reset() {
        this.course = null;
    }
}
