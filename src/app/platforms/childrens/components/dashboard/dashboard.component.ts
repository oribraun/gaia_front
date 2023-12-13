import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../../main/services/api.service";
import {Config} from "../../../main/config";
import {User} from "../../../shared/entities/user";
import {Presentation} from "../../../shared/entities/presentation";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class ChildrensDashboardComponent implements OnInit {

    user!: User;
    gettingUserCourses = false;
    gettingCourseLessons = false;

    courses: any = [];
    // purchasedCourses: any = [];
    lessons: any = [];

    coursesType: string = 'in_progress';

    currentCourseClicked: any = {};
    currentLessonClicked: any = {};

    imageSrc: string = '';

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
            const type = params['type'];
            if (type && available.indexOf(type) > -1) {
                this.coursesType = type;
            }
        });
        this.getUserCourses(this.coursesType);
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }

    getUserCourses(coursesType: string) {
        this.reset();
        this.coursesType = coursesType;
        this.gettingUserCourses = true;
        const obj: any = {};
        obj[coursesType] = true;
        this.apiService.getUserCourses(obj).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getUserCourses err', response);
                } else {
                    this.courses = response.courses;
                    // this.purchasedCourses = response.purchased_courses;
                }
                this.gettingUserCourses = false;
            },
            error: (error) => {
                console.log('getUserCourses error', error);
                this.gettingUserCourses = false;
            }
        });
    }

    onCourseClick(course: any) {
        this.currentCourseClicked = course;
        this.currentLessonClicked = {};
        this.gettingCourseLessons = true;
        let service = this.apiService.getPurchasedLessons({purchased_course_id: course.id});
        if (this.coursesType == 'suggested_courses') {
            service = this.apiService.getCourseLessons({course_id: course.id});
        }
        service.subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('onCourseClick err', response);
                } else {
                    this.lessons = response.lessons;
                }
                this.gettingCourseLessons = false;
            },
            error: (error) => {
                console.log('onCourseClick error', error);
                this.gettingCourseLessons = false;
            }
        });
    }

    onLessonsClick(lesson: any) {
        this.currentLessonClicked = lesson;
    }

    onStart() {
        const lesson_id = this.currentLessonClicked.id;
        this.router.navigate(['/childrens/lesson/' + lesson_id]);

    }
    onContinue() {
        const lesson_id = this.currentLessonClicked.id;
        this.router.navigate(['/childrens/lesson/' + lesson_id]);
    }
    onBuy() {
        const course_id = this.currentCourseClicked.id;
        this.router.navigate(['/childrens/buy/' + course_id]);
    }

    reset() {
        this.currentCourseClicked = {};
        this.currentLessonClicked = {};
        this.courses = [];
        this.lessons = [];
    }
    // onPurchasedCourseClick(purchasedCourse: any) {
    //     console.log('purchasedCourse', purchasedCourse)
    // }

}
