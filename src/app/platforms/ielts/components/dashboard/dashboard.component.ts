import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from "../../../main/services/api.service";
import {Config} from "../../../main/config";
import {User} from "../../../shared/entities/user";
import {Presentation} from "../../../shared/entities/presentation";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertService} from "../../../main/services/alert.service";
import {HelperService} from "../../../main/services/helper.service";
import {GeneralService} from "../../services/general/general.service";
import {LangChangeEvent, TranslateService} from "@ngx-translate/core";

declare let $: any;

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
    // courseAchievements!: Partial<{[key: string]: number[]}>;
    practiceLessons: any = [];
    recommendedVideos: any = [
        // {'presentation_data': {'presentation_lesson_data':
        //             { presentation_thumbnail: "https://unseen-audio-files.s3.amazonaws.com/videos/reading+overview+thumb.png", presentation_title: ' example desc'}
        //     }},
        // {'presentation_data': {'presentation_lesson_data':
        //             { presentation_thumbnail: "https://unseen-audio-files.s3.amazonaws.com/videos/reading+overview+thumb.png", presentation_title: ' example desc'}
        //     }},
        // {'presentation_data': {'presentation_lesson_data':
        //             { presentation_thumbnail: "https://unseen-audio-files.s3.amazonaws.com/videos/reading+overview+thumb.png", presentation_title: ' example desc'}
        //     }},
    ];
    userTests : any = [
        // {"id": 31,"score": 0,"created": "06.12.2023"},
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

    imageSrc: string = '';

    achievements: any = {

        labels: [{name:'Progress', tip: 'This reflects your progress through the entire course material'}, {name:'Score', tip: 'This indicates your score achieved across the entirety of the course'}, {name:'Pace', tip: 'This measures your pace compared to the average pace of other students throughout the entire course'}],
        colors: ['rgb(13,110,253)', 'rgb(220,53,69)', 'rgb(255,193,7)'],
        data: {'hearing': [50, 40, 80], 'reading': [80, 30, 50], 'speaking': [70, 20, 100], 'writing': [20, 70, 1]}
    };
    achievementsLabels = ['Progress', 'Score', 'Pace'];

    difficulty: any = [];
    words_learned: any = {
        labels: [],
        data: []
    };
    activity: any = {
        labels: [],
        data: [],
        strike_num: 0
    };

    currentLang: string = "";

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private helperService: HelperService,
        private generalService: GeneralService,
        private translate: TranslateService
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    ngOnInit(): void {
        this.getUser();
        this.route.paramMap.subscribe((params) => {
            const lang = params.get('lang');
            if (lang) {
                this.currentLang = lang;
                this.translate.use(this.currentLang);
            }
        });
        this.route.queryParams.subscribe((params) => {
            const available = ['in_progress', 'my_courses', 'suggested_courses'];
            const type = params['type'];
            if (type && available.indexOf(type) > -1) {
                this.coursesType = type;
            }
        });
        this.getPlatformDashboard();
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }

    getPlatformDashboard() {
        this.reset();
        this.gettingGroupTypes = true;
        this.apiService.getPlatformDashboard({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getGroupTypes err', response);
                } else {
                    this.groupTypes = response.group_types;
                    this.recommendedVideos = response.recommended_videos;
                    this.practiceLessons = response.practice_lessons;
                    this.userTests = response.user_tests;
                    this.courses = response.courses;
                    this.statusMapping = response.status_mapping;
                    this.coursePlan = response.current_course_plan;
                    if (response.achievements) {
                        if (response.achievements.labels) {
                            this.achievements.labels = response.achievements.labels;
                            this.achievementsLabels = this.achievements.labels.map((o: any) => o.name);
                        }
                        if (response.achievements.data) {
                            this.achievements.data = response.achievements.data;
                        }
                    }
                    this.activity = response.activity;
                    this.difficulty = response.difficulty;
                    this.words_learned = response.words_learned;
                    if (this.coursePlan && this.coursePlan.parts && this.coursePlan.parts.length) {
                        this.selectCoursePart(0);
                    }
                    this.helperService.applyTooltip();
                    // this.demoPlanPartsAnimation();
                    // this.purchasedCourses = response.purchased_courses;
                }
                this.gettingGroupTypes = false;
            },
            error: (error) => {
                console.log('getGroupTypes error', error);
                this.gettingGroupTypes = false;
            }
        });
    }

    resetCurrentCourse() {
        this.currentCourseLessons = null;
        this.currentCourseType = null;
    }

    selectCourse(courseType: any) {
        if (this.currentCourseType !== courseType) {
            this.resetCurrentCourse();
            this.currentCourseType = courseType;
            this.getCourseInfo(this.currentCourseType);
        } else {
            this.alertOrShowUserLessonModel();
        }
    }

    selectCourseByName(courseTypeName: any) {
        const map = this.groupTypes.map((o: any) => o.name);
        const index = map.indexOf(courseTypeName);
        let courseType: any = null;
        if (index > -1) {
            courseType = this.groupTypes[index];
        }
        if (courseType) {
            if (this.currentCourseType !== courseType) {
                this.resetCurrentCourse();
                this.currentCourseType = courseType;
                this.getCourseInfo(this.currentCourseType);
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
                    console.log('getCourseInfo err', response);
                } else {
                    this.currentCourseLessons = response.lessons;
                    this.alertOrShowUserLessonModel();
                }
                this.gettingCourseInfo = false;
            },
            error: (error) => {
                console.log('getCourseInfo error', error);
                this.gettingCourseInfo = false;
            }
        });
    }

    getUserLessonAchievements() {
        this.gettingUserAchievements = true;
        this.apiService.getUserLessonAchievements({plan_id: this.coursePlan.id}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getUserLessonAchievements err', response);
                } else {
                    this.achievements = response.achievements;
                }
                this.gettingUserAchievements = false;
            },
            error: (error) => {
                console.log('getUserLessonAchievements error', error);
                this.gettingUserAchievements = false;
            }
        });
    }

    startNewUserLessonByName(courseTypeName: any, event: Event) {
        event.preventDefault();
        const map = this.groupTypes.map((o: any) => o.name);
        const index = map.indexOf(courseTypeName);
        let courseType: any = null;
        if (index > -1) {
            courseType = this.groupTypes[index];
        }
        if (courseType) {
            this.generalService.generateNewLesson(courseType.id, this.coursePlan.id).then((id: any) => {
                this.hideUserLessonsModal();
                this.goToLesson(id);
            }).catch((error: any) => {
                this.alertService.error(error);
            });
        }
    }

    startNewUserLesson(event: Event) {
        event.preventDefault();
        console.log('startNewUserLesson');
        this.generalService.generateNewLesson(this.currentCourseType.id, this.coursePlan.id).then((id: any) => {
            this.hideUserLessonsModal();
            this.goToLesson(id);
        }).catch((error: any) => {
            this.alertService.error(error);
        });

    }

    onClickUserLesson(event: Event, id: number) {
        event.preventDefault();
        // console.log('onClickUserLesson', id)
        this.hideUserLessonsModal();
        this.goToLesson(id);
    }

    startVideoLesson(id: number, lesson_group_type_id: number) {
        console.log('id', id);
        console.log('lesson_group_type_id', lesson_group_type_id);
        this.generalService.getOrGenerateLesson(lesson_group_type_id, this.coursePlan.id, id).then((id: any) => {
            this.goToLesson(id);
        }).catch((error: any) => {
            this.alertService.error(error);
        });
    }

    alertOrShowUserLessonModel() {
        if (this.currentCourseLessons.length) {
            this.showUserLessonsModal();
        } else {
            this.alertService.info('your should start a new lesson by pressing the play button', false, 5000);
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
        this.router.navigate([this.currentLang + '/lesson/' + lesson_id]);

    }
    onContinue() {
        const lesson_id = this.currentLessonClicked.id;
        this.router.navigate([this.currentLang + '/lesson/' + lesson_id]);
    }
    onBuy() {
        const course_id = this.currentCourseClicked.id;
        this.router.navigate([this.currentLang + '/buy/' + course_id]);
    }

    reset() {
        this.groupTypes = [];
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
        this.router.navigate([this.currentLang + '/' + route]);
    }

    goToLesson(id: number, event: any = null) {
        if (event) {
            event.preventDefault();
        }
        this.router.navigate([this.currentLang + '/ielts/practice/' + id]);
    }

    showStrikeToolTip() {
        $('#strike').find('.shield').tooltip('show');
    }

    hideStrikeToolTip() {
        $('#strike').find('.shield').tooltip('hide');
    }

    demoPlanPartsAnimation() {
        try {
            const orig = JSON.parse(JSON.stringify(this.courses));
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
                            }, timeout);
                        }, timeout);
                    }, timeout);
                }, timeout);
            }, timeout);
        } catch (e: any) {
            // console.log('e', e);
        }
    }

    getString(str: any) {
        return str.toString();
    }

    ngOnDestroy(): void {
        this.hideUserLessonsModal();
    }

}
