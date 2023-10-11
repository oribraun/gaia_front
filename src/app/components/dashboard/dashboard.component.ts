import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {Config} from "../../config";
import {User} from "../../entities/user";
import {Presentation} from "../../entities/presentation";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

    user!: User;
    gettingUserCourses = false;

    courses: any = [];
    purchasedCourses: any = [];

    constructor(
        private config: Config,
        private apiService: ApiService
    ) {
    }

    ngOnInit(): void {
        this.getUser();
        this.getUserCourses();
    }

    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    getUserCourses() {
        this.gettingUserCourses = true;
        this.apiService.getUserCourses({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getPresentation err', response)
                } else {
                    this.courses = response.courses;
                    this.purchasedCourses = response.purchased_courses;
                }
                this.gettingUserCourses = false;
            },
            error: (error) => {
                console.log('getPresentation error', error)
                this.gettingUserCourses = false;
            },
        })
    }

    onCourseClick(course: any) {
        console.log('course', course)
    }
    onPurchasedCourseClick(purchasedCourse: any) {
        console.log('purchasedCourse', purchasedCourse)
    }

}
