import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {Config} from "../../config";
import {User} from "../../entities/user";
import {Presentation} from "../../entities/presentation";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

    user!: User;
    gettingUserCourses = false;
    gettingCourseLessons = false;

    courses: any = [];
    // purchasedCourses: any = [];
    lessons: any = [];

    coursesType: string = '';

    currentCourseClicked: any = {};
    currentLessonClicked: any = {};

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.getUser();
        this.getUserCourses('in_progress');
    }

    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    getUserCourses(coursesType: string) {
        this.reset();
        this.coursesType = coursesType;
        this.gettingUserCourses = true;
        const obj: any = {}
        obj[coursesType] = true;
        this.apiService.getUserCourses(obj).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getUserCourses err', response)
                } else {
                    this.courses = response.courses;
                    // this.purchasedCourses = response.purchased_courses;
                }
                this.gettingUserCourses = false;
            },
            error: (error) => {
                console.log('getUserCourses error', error)
                this.gettingUserCourses = false;
            },
        })
    }

    onCourseClick(course: any) {
        this.currentCourseClicked = course;
        this.currentLessonClicked = {};
        this.gettingCourseLessons = true;
        let service = this.apiService.getPurchasedLessons({purchased_course_id: course.id})
        if (this.coursesType == 'suggested_courses') {
            service = this.apiService.getCourseLessons({course_id: course.id})
        }
        service.subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('onCourseClick err', response)
                } else {
                    this.lessons = response.lessons;
                }
                this.gettingCourseLessons = false;
            },
            error: (error) => {
                console.log('onCourseClick error', error)
                this.gettingCourseLessons = false;
            },
        })
    }

    onLessonsClick(lesson: any) {
        this.currentLessonClicked = lesson;
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
        this.currentCourseClicked = {};
        this.currentLessonClicked = {};
        this.courses = [];
        this.lessons = [];
    }
    // onPurchasedCourseClick(purchasedCourse: any) {
    //     console.log('purchasedCourse', purchasedCourse)
    // }

}
