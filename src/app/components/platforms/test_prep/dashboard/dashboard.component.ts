import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../../../services/api.service";
import {Config} from "../../../../config";
import {User} from "../../../../entities/user";
import {Presentation} from "../../../../entities/presentation";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class TestPrepDashboardComponent implements OnInit {

    user!: User;
    gettingGroupTypes = false;

    groupTypes: any = [];
    // purchasedCourses: any = [];
    lessons: any = [];

    coursesType: string = 'in_progress';

    currentCourseClicked: any = {};
    currentLessonClicked: any = {};

    imageSrc: string = ''

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    ngOnInit(): void {
        this.getUser();
        this.route.queryParams.subscribe((params) => {
            const available = ['in_progress', 'my_courses', 'suggested_courses'];
            const type = params['type']
            if (type && available.indexOf(type) > -1) {
                this.coursesType = type
            }
        })
        this.getGroupTypes();
    }

    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    getGroupTypes() {
        this.reset();
        this.gettingGroupTypes = true;
        this.apiService.getGroupTypes({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getGroupTypes err', response)
                } else {
                    this.groupTypes = response.group_types;
                    // this.purchasedCourses = response.purchased_courses;
                }
                this.gettingGroupTypes = false;
            },
            error: (error) => {
                console.log('getGroupTypes error', error)
                this.gettingGroupTypes = false;
            },
        })
    }

    onStart() {
        const lesson_id = this.currentLessonClicked.id;
        this.router.navigate(['/lesson/' + lesson_id])

    }
    onContinue() {
        const lesson_id = this.currentLessonClicked.id;
        this.router.navigate(['/lesson/' + lesson_id])
    }
    onBuy() {
        const course_id = this.currentCourseClicked.id;
        this.router.navigate(['/buy/' + course_id])
    }

    reset() {
        this.groupTypes = []
    }

}
