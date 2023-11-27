import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from "../../../main/services/api.service";
import {Config} from "../../../main/config";
import {User} from "../../../shared-slides/entities/user";
import {Presentation} from "../../../shared-slides/entities/presentation";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertService} from "../../../main/services/alert.service";
import {HelperService} from "../../../main/services/helper.service";

declare var $: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, OnDestroy {

    user!: User;
    gettingGroupTypes = false;

    groupTypes: any = [];
    courses: any = {};
    statusMapping: any = {};
    coursePlan: any = null;
    // courseAchievements: Partial<{ [key in SomeArray]: string[] }> = null;
    courseAchievements!: Partial<{[key: string]: number[]}>;
    recommendedVideos: any = [
        {'url': 'https://www.w3schools.com/html/mov_bbb.mp4', desc: ' example desc'},
        {'url': 'https://www.w3schools.com/html/mov_bbb.mp4', desc: ' example desc'},
        {'url': 'https://www.w3schools.com/html/mov_bbb.mp4', desc: ' example desc'},
    ];
    currentCoursePlanPartIndex: any = null;

    currentCourseType: any;
    currentCourseLessons: any;

    gettingCourseInfo = false;
    gettingNewLesson = false;
    gettingUserAchievements = false;

    coursesType: string = 'in_progress';

    currentCourseClicked: any = {};
    currentLessonClicked: any = {};

    imageSrc: string = ''

    achievements = {
        labels: ['Progress', 'Score', 'Pace'],
        colors: ['rgb(13,110,253)', 'rgb(220,53,69)', 'rgb(255,193,7)'],
    }

    difficulty: any = []
    words_learned: any = {
        labels: [],
        data: [],
    }
    activity: any = {
        labels: [],
        data: [],
        strike_num: 0
    }

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private helperService: HelperService
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
                    this.coursePlan = response.current_course_plan;
                    this.courseAchievements = response.achievements;
                    this.activity = response.activity;
                    this.difficulty = response.difficulty;
                    this.words_learned = response.words_learned;
                    if (this.coursePlan && this.coursePlan.parts && this.coursePlan.parts.length) {
                        this.selectCoursePart(0);
                    }
                    this.helperService.applyTooltip();
                    this.demoPlanPartsAnimation();
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
            this.alertOrShowUserLessonModel();
        }
    }

    selectCourseByName(courseTypeName: any) {
        const map = this.groupTypes.map((o: any) => o.name)
        const index = map.indexOf(courseTypeName)
        let courseType: any = null;
        if (index > -1) {
            courseType = this.groupTypes[index]
        }
        if (courseType) {
            if (this.currentCourseType !== courseType) {
                this.resetCurrentCourse();
                this.currentCourseType = courseType
                this.getCourseInfo(this.currentCourseType)
            } else {
                this.alertOrShowUserLessonModel();
            }
        }
    }

    getCourseInfo(courseType: any) {
        this.gettingCourseInfo = true;
        this.apiService.getUserLessons({course_type_id: courseType.id, plan_id: this.coursePlan.id}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getCourseInfo err', response)
                } else {
                    this.currentCourseLessons = response.lessons;
                    this.alertOrShowUserLessonModel();
                }
                this.gettingCourseInfo = false;
            },
            error: (error) => {
                console.log('getCourseInfo error', error)
                this.gettingCourseInfo = false;
            },
        })
    }

    getUserLessonAchievements() {
        this.gettingUserAchievements = true;
        this.apiService.getUserLessonAchievements({plan_id: this.coursePlan.id}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getUserLessonAchievements err', response)
                } else {
                    this.courseAchievements = response.achievements;
                }
                this.gettingUserAchievements = false;
            },
            error: (error) => {
                console.log('getUserLessonAchievements error', error)
                this.gettingUserAchievements = false;
            },
        })
    }

    startNewUserLessonByName(courseTypeName: any, event: Event) {
        event.preventDefault();
        const map = this.groupTypes.map((o: any) => o.name)
        const index = map.indexOf(courseTypeName)
        let courseType: any = null;
        if (index > -1) {
            courseType = this.groupTypes[index]
        }
        if (courseType) {
            this.generateNewLesson(courseType.id).then((id) => {
                this.hideUserLessonsModal();
                this.router.navigate(['test_prep/practice/' + id])
            }).catch((err) => {})
        }
    }

    startNewUserLesson(event: Event) {
        event.preventDefault();
        console.log('startNewUserLesson')
        this.generateNewLesson(this.currentCourseType.id).then((id) => {
            this.hideUserLessonsModal();
            this.router.navigate(['test_prep/practice/' + id])
        }).catch((err) => {})

    }

    generateNewLesson(courseTypeId: any) {
        return new Promise((resolve, reject) => {
            this.gettingNewLesson = true;
            this.apiService.getUserNewLesson({
                current_course_id: courseTypeId,
                plan_id: this.coursePlan.id
            }).subscribe({
                next: (response: any) => {
                    this.gettingNewLesson = false;
                    if (response.err) {
                        console.log('generateNewLesson err', response)
                        this.alertService.error(response.errMessage)
                        reject(response.errMessage)
                    } else {
                        const id = response.id
                        resolve(id)
                    }
                },
                error: (error) => {
                    console.log('generateNewLesson error', error)
                    this.gettingNewLesson = false;
                    reject(error)
                },
            })
        })
    }
    startUserLesson(event: Event, id: number) {
        event.preventDefault();
        console.log('startUserLesson', id)
        this.hideUserLessonsModal();
        this.router.navigate(['test_prep/practice/' + id])
    }
    continueUserLesson(event: Event, id: number) {
        event.preventDefault();
        console.log('continueUserLesson', id)
        this.hideUserLessonsModal();
        this.router.navigate(['test_prep/practice/' + id])
    }
    tryAgainUserLesson(event: Event, id: number) {
        event.preventDefault();
        console.log('tryAgainUserLesson', id)
        this.hideUserLessonsModal();
        this.router.navigate(['test_prep/practice/' + id])
    }

    alertOrShowUserLessonModel() {
        if (this.currentCourseLessons.length) {
            this.showUserLessonsModal();
        } else {
            this.alertService.info('your should start a new lesson by pressing the play button', false, 5000)
        }
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

    selectCoursePart(index: number) {
        if (index !== this.currentCoursePlanPartIndex) {
            this.currentCoursePlanPartIndex = index;
        }
    }

    getCourseFinished(key: any) {
        if (this.courses[key]) {
            return Number(this.courses[key].finished);
        } else {
            return 0;
        }
    }

    gotTo(route: string) {
        this.router.navigate([route])
    }

    demoPlanPartsAnimation() {
        try {
            const orig = JSON.parse(JSON.stringify(this.courses))
            const timeout = 1000;
            setTimeout(() => {
                this.courses.hearing.finished = this.coursePlan.parts[this.currentCoursePlanPartIndex].lessons.hearing;
                setTimeout(() => {
                    this.courses.reading.finished = this.coursePlan.parts[this.currentCoursePlanPartIndex].lessons.reading;
                    setTimeout(() => {
                        this.courses.speaking.finished = this.coursePlan.parts[this.currentCoursePlanPartIndex].lessons.speaking;
                        setTimeout(() => {
                            this.courses.writing.finished = this.coursePlan.parts[this.currentCoursePlanPartIndex].lessons.writing;
                            setTimeout(() => {
                                this.courses = JSON.parse(JSON.stringify(orig));
                            }, timeout)
                        }, timeout)
                    }, timeout)
                }, timeout)
            }, timeout)
        } catch (e: any) {}
    }

    getString(str: any) {
        return str.toString();
    }

    ngOnDestroy(): void {
        this.hideUserLessonsModal();
    }

}
