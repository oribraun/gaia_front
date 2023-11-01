import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../../../services/api.service";
import {Config} from "../../../../config";
import {User} from "../../../../entities/user";
import {Presentation} from "../../../../entities/presentation";
import {ActivatedRoute, Router} from "@angular/router";

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class TestPrepDashboardComponent implements OnInit {

    user!: User;
    gettingGroupTypes = false;

    groupTypes: any = [];
    courses: any = [];
    statusMapping: any = {};

    currentCourseType: any;
    currentCourseLessons: any;
    gettingCourseInfo = false;

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
        this.getPlatformDashboard();
    }

    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    getPlatformDashboard() {
        this.reset();
        this.gettingGroupTypes = true;
        this.apiService.getPlatformDashboard({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getGroupTypes err', response)
                } else {
                    this.groupTypes = response.group_types;
                    this.courses = response.courses;
                    this.statusMapping = response.status_mapping;
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

    resetCurrentCourse() {
        this.currentCourseLessons = null;
        this.currentCourseType = null;
    }

    selectCourse(courseType: any) {
        if (this.currentCourseType !== courseType) {
            this.resetCurrentCourse();
            this.currentCourseType = courseType
            this.getCourseInfo(this.currentCourseType)
        } else {
            this.showUserLessonsModal();
        }
    }

    getCourseInfo(courseType: any) {
        this.gettingCourseInfo = true;
        this.apiService.getUserLessons(courseType).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getCourseInfo err', response)
                } else {
                    this.currentCourseLessons = response.lessons;
                    this.showUserLessonsModal();
                }
                this.gettingCourseInfo = false;
            },
            error: (error) => {
                console.log('getCourseInfo error', error)
                this.gettingCourseInfo = false;
            },
        })
    }

    startNewUserLesson(event: Event) {
        event.preventDefault();
        console.log('startNewUserLesson')
    }
    startUserLesson(event: Event) {
        event.preventDefault();
        console.log('startUserLesson')
    }
    continueUserLesson(event: Event) {
        event.preventDefault();
        console.log('continueUserLesson')
    }
    tryAgainUserLesson(event: Event) {
        event.preventDefault();
        console.log('tryAgainUserLesson')
    }

    showUserLessonsModal() {
        $('#userLessonsModal').modal('show');
    }
    hideUserLessonsModal() {
        const el = $('#userLessonsModal');
        el.removeClass('show');
        el.modal('hide');
        $('.modal-backdrop').hide();
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
