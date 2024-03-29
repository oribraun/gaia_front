import {
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {SpeechRecognitionService} from "../../services/speech-recognition/speech-recognition.service";
import {SpeechRecognitionEnhancerService} from "../../services/speech-recognition/speech-recognition-enhancer.service";
import {firstValueFrom, lastValueFrom} from "rxjs";
import {Presentation, PresentationSection, PresentationSlide} from "../../../shared/entities/presentation";
import {AnimationsService} from "../../services/animations/animations.service";
import {
    SocketSpeechRecognitionService
} from "../../services/socket-speech-recognition/socket-speech-recognition.service";
import {LessonService} from "../../services/lesson/lesson.service";
import {environment} from "../../../../../environments/environment";
import {ChatMessage} from "../../../shared/entities/chat_message";
import { BlobItem } from 'src/app/platforms/shared/entities/blob_item';
import {SocketRecorderService} from "../../services/socket-recorder/socket-recorder.service";
import {User} from "../../../shared/entities/user";
import {Config} from "../../config";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";

declare let $:any;

@Component({
    selector: 'app-lesson',
    templateUrl: './lesson.component.html',
    styleUrls: ['./lesson.component.less']
})
export class LessonComponent implements OnInit, OnDestroy {

    private user!: User;

    socketRecorderEvents: any = {};
    socketRecorderEnabled = false;

    mock = false;

    presentation: Presentation = new Presentation();
    current_lessons_id!: number;
    gettingPresentation = false;
    currentSectionIndex: number = -1;
    currentSlideIndex: number = -1;
    currentObjectiveIndex: number = -1;
    estimatedDuration: number = -1;
    currentSection: PresentationSection = new PresentationSection();
    currentSlide: PresentationSlide = new PresentationSlide();
    currentObjective: any = null;
    currentData: any = null;

    recognitionCountWords = 0;
    recognitionText = '';
    isFinishedCurrentChatMessage = false;
    recognitionOnResultsSubscribe: any = null;
    speakInProgress = false;
    doNotDisturb = false;
    currentAudio: any = null;
    isPause: boolean = false;
    needToCallNextSlideReplay: boolean = false;
    allow_ASR_activation: boolean = true;
    noReplayInterval: any = null;
    noReplayCounter = 0;
    noReplayTriggerOn = 10; // no replay will be called every 5 seconds

    audioQue: string[] = [];
    audioBlobQue: BlobItem[] = [];
    enableArrayBuffer = true;
    enableNoReplayInterval = true;
    webcam_last_snapshot_url: string = '';
    webcam_last_snapshot_url_updated: boolean = false;
    forceChangeSlideInfo: boolean = false;
    forcedChangeSlideInfo:any = {};


    presentationReplayIsInProgress = false;
    presentationResetIsInProgress = false;
    presentationNewSlideInProgress = false;
    presentationNoReplayIsInProgress = false;
    nextSlideIsInProgress = false;
    prevSlideIsInProgress = false;
    eventHandlingInProgress = false;

    mobileWidth = 768; // pixels
    isMobile = false;

    apiSubscriptions: any = {
        get_presentation: null,
        replay: null,
        no_replay: null,
        reset: null,
        next_slide: null,
        prev_slide: null,
        change_slide:null,
        text_to_speech:null
    };
    heartBeatInterval: any = null;
    heartBeatCounter: number = 0;
    disableHearBeat = false;

    sr_list:string[] = [];
    last_sr_ts: number = 0;
    last_speak_ts: number = 0;
    last_user_action_ts: number = 0;

    initApplicationDone = false;

    constructor(
        private apiService: ApiService,
        private config: Config,
        private animationsService: AnimationsService,
        private speechRecognitionService: SpeechRecognitionService,
        private socketSpeechRecognitionService: SocketSpeechRecognitionService,
        private lessonService: LessonService,
        private speechRecognitionEnhancerService: SpeechRecognitionEnhancerService,
        private socketRecorderService: SocketRecorderService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            const lesson_id = params.get('lesson_id');
            if (lesson_id) {
                this.current_lessons_id = parseInt(lesson_id);
            }
        });
        this.getUser();
        if (this.socketRecorderEnabled) {
            this.startRecordingScreen();
        } else {
            this.initApplication();
        }
    }

    startRecordingScreen() {
        this.setupSocketRecorder().then(() => {
            // starting
            const lesson_id = `lesson_id_${new Date().getTime()}`;
            this.socketRecorderService.startCapturingVideo();
            // this.socketRecorderService.startCapturingMediaTest(5, this.user.id, lesson_id);
            // this.socketRecorderService.capturingMediaStream.getVideoTracks()[0].onended = () => {
            //     // stoped sharing
            //     console.log('stopped sharing');
            //     this.socketRecorderService.stopCapturingMediaTest(this.user.id, lesson_id);
            //     this.socketRecorderService.capturingMediaStream = null
            // };
            this.socketRecorderService.startCapturingInterval(this.user.id, lesson_id);
            this.socketRecorderService.capturingMediaStream.getVideoTracks()[0].onended = () => {
                // stoped sharing
                console.log('socketRecorderService stopped sharing');
                this.socketRecorderService.stopCapturingInterval(this.user.id, lesson_id);
                this.socketRecorderService.capturingMediaStream = null;
            };
            this.initApplication();
        }).catch((e) => {
            console.log('setupSocketRecorder e', e);
            this.initApplication();
        });
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }

    async resetApplication() {

        if (!this.mock) {
            this.stopAudio();
            this.unsubscribeAllHttpEvents();
            this.stopHeartBeat();
            if (!this.speakInProgress) {
                await this.stopSpeechRecognition();
            }
            // this.lessonService.ClearAllEvents();
        }
    }



    initApplication() {
        this.triggerResize();
        if (!this.mock) {
            if(!this.speechRecognitionService.mainRecognition) {
                this.speechRecognitionService.setupSpeechRecognition();
            }
            // this.setupSocketSpeechRecognition();
            if (this.recognitionOnResultsSubscribe) {
                this.recognitionOnResultsSubscribe.unsubscribe(this.onRecognitionResults);
            }
            this.stopAudio();
            this.lessonService.resetHelpMode();
            this.listenToSpeechRecognitionResults();
            this.resetAllEventProgress();
            this.lessonService.Broadcast('resetChatMessages', {});
            this.lessonService.Broadcast('resumeLesson', {});
            this.getPresentation();
            this.startHeartBeat();
            if (!this.initApplicationDone) {
                // adding listeners only once
                this.listenForSlideEventRequests();
                this.listenForPauseEvnet();
                this.listenForSnapshots();
                this.listenForSpeakNative();
            }
            this.initApplicationDone = true;

        } else {
            if(!this.speechRecognitionService.mainRecognition) {
                this.speechRecognitionService.setupSpeechRecognition();
                this.speechRecognitionService.startListening();
            }
            this.lessonService.resetHelpMode();
            if (!this.initApplicationDone) {
                // adding listeners only once
                this.listenForPauseEvnet();
                this.listenForSlideEventRequests();
            }
            this.initApplicationDone = true;
            // this.setupPresentationMock();
            this.getPresentation();
            // this.setRandomCircleAnimation();
        }
    }

    triggerResize() {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
    }

    listenToSpeechRecognitionResults() {
        this.recognitionOnResultsSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
    }

    listenForPauseEvnet() {
        this.lessonService.ListenFor("pauseLesson").subscribe((obj: any) => {
            if (this.doNotDisturb) {
                return;
            }
            this.isPause = true;
            this.lessonService.Broadcast('panelIconChange', {'iconName':'teacher_sleep'});
            this.togglePauseLesson();//#{"source": "image_generator_button_click", "selected_words": obj.selected_words})
        });
        this.lessonService.ListenFor("resumeLesson").subscribe((obj: any) => {
            if (this.doNotDisturb) {
                return;
            }
            this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_listening'});
            this.isPause = false;
            this.togglePauseLesson();//#{"source": "image_generator_button_click", "selected_words": obj.selected_words})
        });
    }

    listenForSnapshots() {
        this.lessonService.ListenFor("snapshotTaken").subscribe((obj: any) => {
            this.webcam_last_snapshot_url = obj["image_url"];
            this.webcam_last_snapshot_url_updated = true;
        });
    }

    async speakNative(obj:any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('speakNative this.lessonService.speakNativeOnProgress', this.lessonService.speakNativeOnProgress);
            console.log('speakNative this.lessonService.speakNativeOnWaiting', this.lessonService.speakNativeOnWaiting);
            if (!this.lessonService.speakNativeOnProgress && !this.lessonService.speakNativeOnWaiting) {
                this.lessonService.speakNativeOnWaiting = true;
                this.apiSubscriptions.text_to_speech = this.apiService.textToSpeech({
                    'app_data':{'text':obj.text, 'lang':'iw'}
                }).subscribe({
                    next: async (response: any) => {
                        if (response.err) {
                            console.log('textToSpeech err', response);
                        } else {
                            const arrayBuffer = this.base64ToArrayBuffer(response.data.help_sound_buffer);
                            console.log('textToSpeech - ', arrayBuffer);
                            let blob = null;
                            if(!BlobItem.includes(this.audioBlobQue, arrayBuffer)) {
                                blob = new BlobItem({arrayBuffer:arrayBuffer,
                                    action:'speakNative',
                                    type:'audio'});
                                // this.audioBlobQue.push(blob);
                                // if (!this.speakInProgress && playAudio) {
                                //     await this.stopSpeechRecognition();
                                //     this.stopHeartBeat();
                                //     const value = await this.playUsingBlob();
                                //     this.resetSpeechRecognition();
                                //     this.startHeartBeat();
                                // }
                            }
                            resolve(blob);
                        }
                    },
                    error: (error) => {
                        console.log('getPresentation error', error);
                    }
                });
            }
        });
    }

    async listenForSpeakNative() {
        this.lessonService.ListenFor("speakNative").subscribe(async (obj: any) => {
            this.stopAudio();
            this.lessonService.speakNativeOnProgress = false;
            this.lessonService.speakNativeOnWaiting = false;
            const blob = await this.speakNative(obj);
            if (blob) {
                this.audioBlobQue.push(blob);
                if (!this.speakInProgress) {
                    if (!obj.onlyAudio) {
                        await this.stopSpeechRecognition();
                        this.stopHeartBeat();
                    }
                    const value = await this.playUsingBlob();
                    if (!obj.onlyAudio) {
                        this.resetSpeechRecognition();
                        this.startHeartBeat();
                    }
                }
            }
        });
    }

    togglePauseLesson() {
        console.log('this.isPause', this.isPause);
        this.toggleStopAll(this.isPause);
    }

    async toggleStopAll(value: boolean) {
        if (value) {
            this.stopAudio();
            this.stopHeartBeat();
            this.unsubscribeAllHttpEvents();
            this.resetAllEventProgress();
            await this.stopSpeechRecognition();

        } else {
            this.startHeartBeat();
            if (!this.speakInProgress) {
                await this.startSpeechRecognition();
            }
            if (this.needToCallNextSlideReplay) {
                this.needToCallNextSlideReplay = false;
                this.getNewSlideReply();
            }
        }
    }

    listenForSlideEventRequests() {
        this.lessonService.ListenFor("slideEventRequest").subscribe((obj: any) => {
            if (obj.stopAudio) {
                this.stopAudio();
            }
            this.getPresentationEventReplay(obj);//#{"source": "image_generator_button_click", "selected_words": obj.selected_words})
        });
        this.lessonService.ListenFor("DoNotDisturb").subscribe((obj: any) => {
            if(!this.doNotDisturb) {
                this.doNotDisturb = true;
                this.toggleStopAll(this.doNotDisturb);
                this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_sleep'});
            }
        });
        this.lessonService.ListenFor("endDoNotDisturb").subscribe((obj: any) => {
            if(this.doNotDisturb) {
                this.doNotDisturb = false;
                this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_listening'});
                if (!obj.noToggle) {
                    this.toggleStopAll(this.doNotDisturb);
                }
            }
        });
        this.lessonService.ListenFor("getHeartBeatReply").subscribe((helpMode: string) => {
            this.getHeartBeatReply();
        });
        this.lessonService.ListenFor("restartCurrentSlide").subscribe((helpMode: string) => {
            this.restartCurrentSlide();
        });
        this.lessonService.ListenFor("stopAudio").subscribe((obj: any) => {
            this.stopAudio();
        });
        this.lessonService.ListenFor("slideDestroy").subscribe((obj: any) => {
            console.log('slideDestroy Event');
        });
        this.lessonService.ListenFor("endGameAndMoveSlide").subscribe((obj: any) => {
            this.getPresentationEventReplay(obj);
        });

    }

    restartCurrentSlide() {
        this.setForcedSlide(-1);
        this.changeSlideReply();
    }

    onRecognitionResults = (results: any, shouldValidate = true) => {
        console.log("out", this.isPause);
        if (shouldValidate) {
            this.speechRecognitionEnhancerService.validate(results, this.currentSlide, this.onRecognitionResults, this.currentSlideIndex);
        }
        // clear hearbeat
        this.resetHeartBeatCounter();
        if (!this.speakInProgress && !this.doNotDisturb && !this.isPause) {
            console.log("in", this.isPause);

            this.recognitionText = results.text;
            // this.animationsService.addCircle(this.user.nativeElement, this.recognitionCountWords)
            this.recognitionCountWords++;
            if (this.recognitionText) {
                console.log('partial', this.recognitionText);
            }
            if (results.isFinal) {
                console.log('final', this.recognitionText);
                this.updateSrList(this.recognitionText);
                this.recognitionCountWords = 0;
                this.recognitionText = '';
            }
            console.log('results', results);
            this.resetHeartBeatCounter();
        }
    };

    broadCastMessage(type: string, text: string, isFinal: boolean) {
        this.lessonService.Broadcast('newChatMessage', new ChatMessage({
            type: type,
            message: text,
            isFinal: isFinal
        }));
    }

    resetRecognitionData() {
        this.recognitionText = '';
        this.recognitionCountWords = 0;
    }

    updateSrList(recognitionText: string) {
        if(this.speakInProgress) {
            console.log('updateSrList - SPEAK IN PROGRESS ABORTING Trigger');
            return;
        }
        if(!this.doNotDisturb) {
            const recognitionTextTrimmed = recognitionText.trim();
            const prevRecognitionTextTrimmed = this.sr_list[this.sr_list.length - 1];
            const now = Date.now();
            if(recognitionTextTrimmed) {
                // In case two exactrly the same answers and less than 1.5 sec between them dont insert to list
                if(prevRecognitionTextTrimmed == recognitionTextTrimmed) {
                    if ((now - this.last_sr_ts) < 1500) {
                        console.log('updateSrList: Abort inserting ', recognitionTextTrimmed);
                        return;
                    }
                }
                // Insert to list
                this.sr_list.push(recognitionTextTrimmed);
                this.last_sr_ts = now;
                // add user to chat
                this.broadCastMessage('user', this.sr_list[this.sr_list.length - 1], true);
                this.getPresentationReplay(this.sr_list[this.sr_list.length - 1]);
            }
        }
    }

    heartBeatTrigger() {
        // Triger a standard request to the server
        // provide the following information
        // app data : slide index, cam snapshot, sr_len, last_sr, timestamp
        const n_seconds_from_last_sr =  Math.floor((Date.now() - this.last_sr_ts) / 1000);
        const n_seconds_from_last_speak =  Math.floor((Date.now() - this.last_speak_ts) / 1000);
        const n_seconds_from_user_action =  Math.floor((Date.now() - this.last_user_action_ts) / 1000);

        if( (!this.speakInProgress) && (n_seconds_from_last_sr > 10)  && (n_seconds_from_last_speak > 10) && (n_seconds_from_user_action > 10)) {
            this.getHeartBeatReply();
        }
    }

    heartBeatSequence(x:number = 3) {
        // increase the counter
        this.heartBeatCounter++;
        // make sure SR is active (if not actively playing sound)
        // this.activateSR()
        // trigger a request to the server every x seconds
        if (this.heartBeatCounter % x == 0) {
            console.log('calling heartBeatTrigger', new Date().toTimeString());
            this.heartBeatTrigger();
        }
    }

    // activateSR(){
    //     // Only enable when speak is not in progress
    //     console.log('speakInProgress', this.speakInProgress)
    //     console.log('ASR_recognizing', this.speechRecognitionService.ASR_recognizing)
    //
    //     if ((!this.speakInProgress) && (!this.isPause) && (!this.speechRecognitionService.ASR_recognizing) && this.allow_ASR_activation){
    //         // make sure the service is off before starting it again
    //         try{
    //             this.startSpeechRecognition();
    //             console.log('Starting SR')
    //
    //         }
    //         catch (error) {
    //             //line of code to stop the speech recognition
    //             console.log('SR is already on')
    //         }
    //     }
    // }

    startHeartBeat() {
        if (!this.disableHearBeat) {
            console.log('startHeartBeat Called');
            this.stopHeartBeat();
            this.heartBeatInterval = setInterval(() => {
                this.heartBeatSequence();
            }, 50 * 1000);
        }
    }

    resetHeartBeatCounter() {
        this.heartBeatCounter = 0;
    }

    stopHeartBeat() {
        console.log('stopHeartBeat Called');
        this.resetHeartBeatCounter();
        if (this.heartBeatInterval) {
            clearInterval(this.heartBeatInterval);
        }
    }

    async getPresentation() {
        this.gettingPresentation = true;
        this.apiSubscriptions.get_presentation = this.apiService.getPresentation(this.user.last_logged_platform, {
            "type": "messi",
            purchased_lesson_id: this.current_lessons_id
        }).subscribe({
            next: (response: any) => {
                if (response.err) {
                    if (response.errMessage.indexOf('PurchasedLesson') > -1) {
                        this.router.navigate(['dashboard'], { queryParams: { type: 'my_courses' }});
                    }
                    console.log('getPresentation err', response);
                } else {
                        this.presentation = new Presentation(response.presentation);
                        console.log('this.presentation ', this.presentation);
                        this.currentSectionIndex = this.presentation.current_section_index;
                        this.currentSlideIndex = this.presentation.current_slide_index;
                        this.currentObjectiveIndex = this.presentation.current_objective_index;
                        this.estimatedDuration = this.presentation.estimated_duration;
                        this.setCurrentSection();
                        if (!this.mock) {
                            // this.restartCurrentSlide()
                            this.getNewSlideReply();
                        }
                }
                this.gettingPresentation = false;
            },
            error: (error) => {
                console.log('getPresentation error', error);
                this.gettingPresentation = false;
            }
        });
    }

    async getPurchasedLesson() {
        this.gettingPresentation = true;
        this.apiSubscriptions.get_presentation = this.apiService.getPurchasedLesson({
            purchased_lesson_id: this.current_lessons_id
        }).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getPresentation err', response);
                } else {
                    this.presentation = new Presentation(response.lesson.presentation_data.presentation);
                    console.log('this.presentation ', this.presentation );
                    this.currentSectionIndex = this.presentation.current_section_index;
                    this.currentSlideIndex = this.presentation.current_slide_index;
                    this.currentObjectiveIndex = this.presentation.current_objective_index;
                    this.estimatedDuration = this.presentation.estimated_duration;
                    this.setCurrentSection();
                    if (!this.mock) {
                        // this.restartCurrentSlide()
                        this.getNewSlideReply();
                    }
                }
                this.gettingPresentation = false;
            },
            error: (error) => {
                console.log('getPresentation error', error);
                this.gettingPresentation = false;
            }
        });
    }

    setCurrentSection(index: number = -1) {
        if (index > -1) {
            this.currentSection = new PresentationSection(this.presentation.sections[index]);
        } else {
            this.currentSection = new PresentationSection(this.presentation.sections[this.currentSectionIndex]);
        }
        this.setCurrentSlide();
        this.setCurrentObjective();
    }

    setCurrentSlide(index: number = -1) {
        this.recognitionText = '';
        if (index > -1) {
            this.currentSlide = new PresentationSlide(this.currentSection.slides[index]);
        } else {
            this.currentSlide = new PresentationSlide(this.currentSection.slides[this.currentSlideIndex]);
        }
        console.log('this.currentSlide', this.currentSlide);
    }
    setCurrentObjective(index: number = -1) {
        if (index > -1) {
            this.currentObjective = this.currentSlide.slide_objectives[index];
        } else {
            this.currentObjective = this.currentSlide.slide_objectives[this.currentObjectiveIndex];
        }
    }

    async getPresentationEventReplay(data:any = {}) {
        this.last_user_action_ts = Date.now();
        if(!data.hasOwnProperty('background') || !data['background']) {
            if (!this.allowApiCalls()) {
                return;
            }
            if (this.eventHandlingInProgress) {
                return;
            }
        }
        this.stopSpeechRecognition();
        this.eventHandlingInProgress = true;
        this.apiSubscriptions.replay = this.apiService.getPresentationReplay(this.user.last_logged_platform, {
            purchased_lesson_id: this.current_lessons_id,
            app_data: {
                type:'event',
                help_mode: this.lessonService.helpMode,
                data: data,
                array_buffer: this.enableArrayBuffer,
                webcam_last_snapshot_url: this.webcam_last_snapshot_url_updated ? this.webcam_last_snapshot_url : "same"
            }
        }).subscribe({
            next: (response: any) => {
                this.eventHandlingInProgress = false;

                if (response.err) {
                    console.log('response err', response);
                    this.handleOnReplayError();
                } else {
                    this.currentData = response.data;
                    this.handleOnPresentationReplay();
                }
            },
            error: (error) => {
                console.log('getPresentationEventReplay error', error);
                this.eventHandlingInProgress = false;
                if (data.source == "image_generator_button_click") {
                    const data = {'type': 'additional_instructions', 'data': {source: 'image_generator_button_click_error'}};
                    this.lessonService.Broadcast("slideEventReply", data);
                }
            }
        });
    }

    async getPresentationReplay(text: string = '') {
        if (!this.allowApiCalls()) {
            return;
        }
        if (this.presentationNoReplayIsInProgress) {
            return;
        }
        let message = this.recognitionText;
        if (text) {
            message = text;
        }

        this.stopSpeechRecognition();
        this.presentationReplayIsInProgress = true;
        this.lessonService.Broadcast('student_reply_request', message);
        this.apiSubscriptions.replay = this.apiService.getPresentationReplay(this.user.last_logged_platform, {
            purchased_lesson_id: this.current_lessons_id,
            app_data: {
                type:'student_reply',
                student_text: message,
                help_mode: this.lessonService.helpMode,
                array_buffer: this.enableArrayBuffer,
                webcam_last_snapshot_url: this.webcam_last_snapshot_url_updated ? this.webcam_last_snapshot_url : "same"
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationReplayIsInProgress = false;
                this.lessonService.Broadcast('student_reply_response', response);

                if (response.err) {
                    console.log('response err', response);
                    this.handleOnReplayError();
                } else {
                    this.currentData = response.data;
                    this.handleOnPresentationReplay();
                }
            },
            error: (error) => {
                console.log('getPresentationReplay error', error);
                this.presentationReplayIsInProgress = false;
            }
        });
    }

    async getHeartBeatReply() {
        if (!this.allowApiCalls()) {
            return;
        }
        if (this.presentationReplayIsInProgress) {
            return;
        }
        this.presentationNoReplayIsInProgress = true;
        this.apiSubscriptions.no_replay = this.apiService.getHeartBeatReply(this.user.last_logged_platform, {
            purchased_lesson_id: this.current_lessons_id,
            app_data: {
                type: 'heartbeat',
                last_sr: this.sr_list.length ? this.sr_list[this.sr_list.length - 1] : '',
                last_sr_ts:this.last_sr_ts,
                last_speak_ts:this.last_speak_ts,
                n_seconds_from_last_sr: Math.floor((Date.now() - this.last_sr_ts) / 1000),
                n_seconds_from_last_speak: Math.floor((Date.now() - this.last_speak_ts) / 1000),
                help_mode: this.lessonService.helpMode,
                array_buffer: this.enableArrayBuffer,
                webcam_last_snapshot_url: this.webcam_last_snapshot_url_updated ? this.webcam_last_snapshot_url : "same"
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationNoReplayIsInProgress = false;

                if (response.err) {
                    console.log('hearbeat response error', response);
                    this.handleOnReplayError();
                } else {
                    console.log('HEARTBEAT RESP', response.data);
                    this.currentData = response.data;
                    this.handleOnPresentationReplay();
                }
            },
            error: (error) => {
                this.presentationNoReplayIsInProgress = false;
                console.log('hearbeat error', error);
            }
        });
    }

    async changeSlideReply() {
        if (this.presentationNewSlideInProgress) {
            return;
        }
        this.presentationNewSlideInProgress = true;
        this.apiSubscriptions.change_slide = this.apiService.changeSlideReply(this.user.last_logged_platform, {
            purchased_lesson_id: this.current_lessons_id,
            app_data: {
                type: 'change_slide',
                current_slide_info: this.forceChangeSlideInfo ? this.forcedChangeSlideInfo : {section_idx:this.currentSectionIndex, slide_idx:this.currentSlideIndex, objective_idx:this.currentObjectiveIndex}
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationNewSlideInProgress = false;
                this.clearForcedSlide();

                if (response.err) {
                    console.log('change slide response err', response);
                    this.handleOnReplayError();
                } else {
                    const data = response.data;
                    // this.stopAudio();
                    if (data.success) {
                        this.currentSectionIndex = data.current_section_index;
                        this.currentSlideIndex = data.current_slide_index;
                        this.currentObjectiveIndex = data.current_objective_index;
                        this.setCurrentSection();
                        if (this.doNotDisturb) {
                            this.lessonService.Broadcast('endDoNotDisturb', {});
                        }
                        if (this.isPause) {
                            this.needToCallNextSlideReplay = true;
                        } else {
                            this.getNewSlideReply();
                        }
                    } else {
                        console.log('change slide response err', response);
                    }
                }
            },
            error: (error) => {
                this.presentationNewSlideInProgress = false;
                this.clearForcedSlide();
                console.log('change slide error', error);
            }
        });
    }
    clearForcedSlide() {
        this.forceChangeSlideInfo = false;
        this.forcedChangeSlideInfo = {};
    }

    async getNewSlideReply() {
        if (this.presentationNewSlideInProgress) {
            return;
        }
        this.lessonService.speakNativeOnProgress = false;
        this.lessonService.speakNativeOnWaiting = false;
        this.presentationNewSlideInProgress = true;
        this.apiSubscriptions.next_slide = this.apiService.getNewSlideReply(this.user.last_logged_platform, {
            purchased_lesson_id: this.current_lessons_id,
            app_data: {
                type: 'new_slide',
                last_sr: this.sr_list.length ? this.sr_list[this.sr_list.length - 1] : '',
                last_sr_ts:this.last_sr_ts,
                last_speak_ts:this.last_speak_ts,
                help_mode: this.lessonService.helpMode,
                n_seconds_from_last_sr: Math.floor((Date.now() - this.last_sr_ts) / 1000),
                n_seconds_from_last_speak: Math.floor((Date.now() - this.last_speak_ts) / 1000),
                array_buffer: this.enableArrayBuffer,
                webcam_last_snapshot_url: this.webcam_last_snapshot_url_updated ? this.webcam_last_snapshot_url : "same"
            }
        }).subscribe({
            next: async (response: any) => {
                this.presentationNewSlideInProgress = false;
                // this.stopAudio()
                if (response.err) {
                    console.log('new slide response err', response);
                    this.handleOnReplayError();
                } else {
                    this.currentData = response.data;
                    this.handleOnPresentationReplay('new_slide');

                }
            },
            error: (error) => {
                this.presentationNewSlideInProgress = false;
                console.log('new slide error', error);
            }
        });
    }

    async resetPresentation(reason: string = '') {
        if (!this.allowApiCalls()) {
            return;
        }
        console.log('this.gettingPresentation', this.gettingPresentation);
        console.log('this.presentationResetIsInProgress', this.presentationResetIsInProgress);
        if (this.presentationResetIsInProgress || this.gettingPresentation) {
            return;
        }
        await this.resetApplication();
        this.presentationResetIsInProgress = true;
        this.apiSubscriptions.reset = this.apiService.resetPresentation(this.user.last_logged_platform, {
            purchased_lesson_id: this.current_lessons_id,
            app_data: {
                type: reason
            }
        }).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('response err', response);
                    this.handleOnReplayError();
                } else {
                    console.log('response', response);
                    this.initApplication();
                }
                this.presentationResetIsInProgress = false;
            },
            error: (error) => {
                this.presentationResetIsInProgress = false;
                console.log('resetPresentation error', error);
            }
        });
    }

    onResetPresentation(obj: any) {
        this.resetPresentation();
    }


    setForcedSlide(modifier:number = 0) {
        const flat_index = this.presentation.sections[this.currentSectionIndex].slides[this.currentSlideIndex].flat_index;
        const new_flat_index = flat_index + modifier;
        console.log('flat index ', flat_index);
        console.log('flat index info', this.presentation.slides_flat[flat_index]);
        console.log('new_flat_index ', new_flat_index);
        console.log('new_flat_index info ', this.presentation.slides_flat[new_flat_index]);
        if(new_flat_index >= 0 && new_flat_index < this.presentation.slides_flat.length) {
            const target_slide_info = this.presentation.slides_flat[new_flat_index];
            this.forceChangeSlideInfo = true;
            this.forcedChangeSlideInfo = target_slide_info;
        } else if (new_flat_index < 0) {
            this.resetPresentation();

        }
    }

    onNextSlide(obj: any) {
        if (!this.allowApiCalls()) {
            return;
        }
        this.setForcedSlide(0);
        if(this.forceChangeSlideInfo) {
            this.stopAudio();
            this.changeSlideReply();
        }
    }

    onPrevSlide(obj: any) {
        if (!this.allowApiCalls()) {
            return;
        }
        this.setForcedSlide(-2);
        if(this.forceChangeSlideInfo) {
            this.stopAudio();
            this.changeSlideReply();
        }
    }

    onResultsContinuesRecording(obj: any) {
        console.log('obj', obj);
        this.apiSubscriptions.replay = this.apiService.audioToText({
            purchased_lesson_id: this.current_lessons_id,
            app_data: {
                audio_chunks: obj['audio_chunks']
            }
        }).subscribe({
            next: (response: any) => {
                console.log('onResultsContinuesRecording response', response);
            },
            error: (error) => {
                console.log('onResultsContinuesRecording error', error);
            }
        });

    }

    onSwipeLeft() {
        const ele = $('#lessonCarousel');
        if (ele && ele.carousel) {
            ele.carousel('next');
        }
    }
    onSwipeRight() {
        const ele = $('#lessonCarousel');
        if (ele && ele.carousel) {
            ele.carousel('prev');
        }
    }

    handleOnReplayError() {
        if (!this.presentationReplayIsInProgress
            && !this.presentationNoReplayIsInProgress
            && !this.presentationResetIsInProgress
            && !this.nextSlideIsInProgress
            && !this.prevSlideIsInProgress
            && !this.eventHandlingInProgress) {
            this.resetSpeechRecognition();
            // this.resetIntervalNoReplay();
            // this.stopIntervalNoReplay();
            // this.startIntervalNoReplay()
        }
    }

    resetSpeechRecognition() {
        console.log('resetting ASR', this.speechRecognitionService.ASR_recognizing);
        if (this.speechRecognitionService.ASR_recognizing) {
            this.speechRecognitionService.stopListening().then(() => {
                this.startSpeechRecognition();
            });
        } else {
            if (!this.speechRecognitionService.stoppingRecognition) {
                this.startSpeechRecognition();
            }
        }
        this.last_speak_ts = Date.now();
    }

    async startSpeechRecognition() {
        console.log('startSpeechRecognition');
        console.log('this.speechRecognitionService.ASR_recognizing', this.speechRecognitionService.ASR_recognizing);
        console.log('this.speechRecognitionService.startingRecognition', this.speechRecognitionService.startingRecognition);
        if (this.speechRecognitionService.mainRecognition &&
            !this.speechRecognitionService.ASR_recognizing && !this.speechRecognitionService.startingRecognition) {
            await this.speechRecognitionService.startListening();
        }
    }

    async stopSpeechRecognition() {
        console.log('stopSpeechRecognition');
        if (this.speechRecognitionService.ASR_recognizing && !this.speechRecognitionService.stoppingRecognition) {
            await this.speechRecognitionService.stopListening();
        }
    }

    async abortSpeechRecognition() {
        console.log('abortSpeechRecognition');
        if (this.speechRecognitionService.ASR_recognizing && !this.speechRecognitionService.abortingRecognition) {
            await this.speechRecognitionService.abortListening();
        }
    }

    playUsingAudio() {
        return new Promise(async (resolve, reject) => {
            if (this.audioQue.length) {
                const current_src_url: any = this.audioQue.shift();
                console.log('playUsingAudio src_url', current_src_url);
                const loop = (src_url: string) => {
                    this.speakInProgress = true;
                    this.currentAudio = new Audio();
                    this.currentAudio.src = src_url;
                    this.currentAudio.load();
                    this.currentAudio.play();
                    let count = 0;
                    let lastLoggedTime = 0;
                    this.animationsService.triggerAddingCircle(count);
                    count++;
                    this.currentAudio.ontimeupdate = () => {
                        const currentTime = this.currentAudio.currentTime;
                        const timeIntervalMilliseconds = 250; // 250 milliseconds
                        if (currentTime - lastLoggedTime >= timeIntervalMilliseconds / 1000) {
                            this.animationsService.triggerAddingCircle(count);
                            count++;
                            if (count > 10) {
                                count = 0;
                            }
                            lastLoggedTime = currentTime;
                        }
                    };
                    this.currentAudio.onpause = (e: any) => {
                        this.speakInProgress = false;
                        this.last_speak_ts = Date.now();
                    };
                    this.currentAudio.onended = (e: any) => {
                        // const handled_module_type = this.handleWhiteBoardModuleType();
                        // if (!handled_module_type) {
                        this.currentAudio.currentTime = 0;
                        const current_src_url: any = this.audioQue.shift();
                        console.log('playUsingAudio ended src_url', current_src_url);
                        if (current_src_url) {
                            loop(current_src_url);
                        } else {
                            this.speakInProgress = false;
                            this.last_speak_ts = Date.now();
                            resolve(true);
                        }
                        // }
                    };
                };
                loop(current_src_url);
            } else {
                reject('no audio in que');
            }
        });
    }


    playUsingBlob() {
        return new Promise(async (resolve, reject) => {
            if (this.audioBlobQue.length) {
                console.log('playUsingBlob arrayBuffer length', this.audioBlobQue.length);

                const currentBlobItem: BlobItem | undefined = this.audioBlobQue.shift();
                const loop = (blobItem: BlobItem) => {
                    if (blobItem.action == 'speakNative') {
                        this.lessonService.speakNativeOnProgress = true;
                        this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_do_nothing'});
                    }
                    else {
                        console.log('change gif - speaking');
                        this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_speaking'});
                    }
                    this.speakInProgress = true;
                    const audioBlob = new Blob([blobItem.arrayBuffer], {type: 'audio/mpeg'});
                    this.currentAudio = new Audio();
                    this.currentAudio.src = URL.createObjectURL(audioBlob);
                    this.currentAudio.load();
                    this.currentAudio.play();
                    let count = 0;
                    let lastLoggedTime = 0;
                    this.animationsService.triggerAddingCircle(count);
                    count++;
                    this.currentAudio.ontimeupdate = () => {
                        const currentTime = this.currentAudio.currentTime;
                        const timeIntervalMilliseconds = 250; // 250 milliseconds
                        if (currentTime - lastLoggedTime >= timeIntervalMilliseconds / 1000) {
                            this.animationsService.triggerAddingCircle(count);
                            count++;
                            if (count > 10) {
                                count = 0;
                            }
                            lastLoggedTime = currentTime;
                        }
                        // HERE WE CAN DO THINGS BEFORE THE AUDIO ENDS
                        // if (this.currentAudio.duration-currentTime<0.1) {
                        //     if (!this.audioBlobQue.length) {

                        //     }
                        //     console.log('audio ended')
                        // }
                    };
                    this.currentAudio.onpause = () => {
                        console.log('audio paused');
                        this.speakInProgress = false;
                        this.last_speak_ts = Date.now();
                        if (blobItem && blobItem.action == 'speakNative') {
                            this.lessonService.speakNativeOnProgress = false;
                            this.lessonService.speakNativeOnWaiting = false;
                        }
                    };
                    this.currentAudio.onended = () => {
                        if (blobItem && blobItem.action == 'speakNative') {
                            this.lessonService.speakNativeOnProgress = false;
                            this.lessonService.speakNativeOnWaiting = false;
                        }

                        console.log('audio ended');
                        this.currentAudio.currentTime = 0;
                        const currentBlobItem: BlobItem | undefined = this.audioBlobQue.shift();
                        console.log('playUsingBlob ended arrayBuffer');
                        if (currentBlobItem) {
                            loop(currentBlobItem);
                        } else {
                            console.log('end_blobItem', blobItem);
                            if (!blobItem || blobItem.action != 'doNotListenAfter') {
                                console.log('change gif - listening');
                                this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_listening'});
                            }
                            this.speakInProgress = false;
                            this.last_speak_ts = Date.now();
                            // this.resetSpeechRecognition();
                            resolve(true);
                        }
                    };
                };
                if (currentBlobItem) {
                    loop(currentBlobItem);
                }
            }
        });
    }


    async handleOnPresentationReplay(reason: string = '') {
        if (this.isPause) {

            return;
        }
        const data = this.currentData;
        let currentObjectiveIndexChanged = false;
        const additional_instructions = data.additional_instructions;
        const presentation_index_updated = data.presentation_index_updated;
        const presentation_slide_updated = data.presentation_slide_updated;
        const presentation_content_updated = data.presentation_content_updated;
        const all_objectives_accomplished = data.all_objectives_accomplished;
        if(this.currentObjectiveIndex != data.current_objective_index) {
            this.currentObjectiveIndex = data.current_objective_index;
            currentObjectiveIndexChanged = true;
        }
        const n_slide_objectives = data.n_slide_objectives;
        const presentation_done = data.presentation_done;
        const all_presentation_tasks_completed = data.all_presentation_tasks_completed;
        const text = data.text;
        this.broadCastMessage('computer', text, true);
        const help_sound_url = data.help_sound_url;
        const help_sound_buffer = data.help_sound_buffer;
        // console.log('presentation_slide_updated',presentation_slide_updated)
        // console.log('presentation_index_updated',presentation_index_updated)
        // console.log('reason',reason)
        // console.log('data',data)

        // console.log('after+speak_native')
        // console.log('slideEventReply additional_instructions', additional_instructions)

        this.handleCoreFunctionalityOfSlide();

        if (additional_instructions) {
            const data = {'type': 'additional_instructions', 'data': additional_instructions};
            this.lessonService.Broadcast("slideEventReply", data);
        }



        if (help_sound_url) {
            if(this.handleCoreFunctionalityOfSlide('speak')) {
                console.log('help_sound_url added to que', help_sound_url);
                this.audioQue.push(help_sound_url);
                if (!this.speakInProgress) {
                    await this.stopSpeechRecognition();
                    this.stopHeartBeat();
                    const value = await this.playUsingAudio();
                    if(this.handleCoreFunctionalityOfSlide('asr')) {
                        this.resetSpeechRecognition();
                    }

                    this.startHeartBeat();
                }
            }
        }
        let blob = null;
        if (reason === 'new_slide') {
            blob = await this.getSpeakNative();
        }

        if (help_sound_buffer || blob) {
            if(this.handleCoreFunctionalityOfSlide('speak')) {
                if (blob && this.currentSlide.index_in_bundle == 0) {
                    console.log('speakNative before');
                    this.audioBlobQue.push(blob);
                }
                if (help_sound_buffer) {
                    console.log('help_sound_buffer added to que');
                    const arrayBuffer = this.base64ToArrayBuffer(help_sound_buffer);
                    if(!BlobItem.includes(this.audioBlobQue, arrayBuffer)) {
                        this.audioBlobQue.push(new BlobItem({arrayBuffer:arrayBuffer, action:all_objectives_accomplished ? 'doNotListenAfter' : '', type:'audio'}));
                    }
                }
                if (blob && this.currentSlide.index_in_bundle == -1) {
                    console.log('speakNative after');
                    this.audioBlobQue.push(blob);
                }
                if (!this.speakInProgress && this.audioBlobQue.length) {
                    console.log('this.audioBlobQue', this.audioBlobQue.length);
                    console.log('this.speakInProgress', this.speakInProgress);
                    await this.stopSpeechRecognition();
                    this.stopHeartBeat();
                    const value = await this.playUsingBlob();
                    if(this.handleCoreFunctionalityOfSlide('asr')) {
                        this.resetSpeechRecognition();
                    }
                    this.startHeartBeat();
                }
            }
        }
        if(!help_sound_buffer && !help_sound_url) {
            if (!this.speechRecognitionService.ASR_recognizing) {
                if(this.handleCoreFunctionalityOfSlide('asr')) {
                    await this.startSpeechRecognition();
                }
            }
        }


        if (presentation_done) {
            this.unsubscribeAllHttpEvents();
            this.stopAudio();
            return;
        }


        if (presentation_content_updated) {
            // TODO request presentation from server
        }

        if (all_objectives_accomplished) {
            // NIR - TODO - add wait for audio que to finish
            this.changeSlideReply();
        }

        if(currentObjectiveIndexChanged) {
            this.lessonService.Broadcast('currentObjectiveIndexChanged', this.currentObjectiveIndex);
        }

        // this.handleCoreFunctionalityOfSlide()

    }

    handleCoreFunctionalityOfSlide(is_key_enabled:string = '') {
        const coreFuncs = this.currentSlide.core_instructions;
        if(is_key_enabled) {
            if(coreFuncs.hasOwnProperty(is_key_enabled)) {
                return coreFuncs[is_key_enabled];
            } else {
                return true;
            }
        } else {
            console.log('coreFuncs', coreFuncs);
            if(coreFuncs.hasOwnProperty('asr') && !coreFuncs.asr) {
                console.log('coreFuncs', 'Stopping ASR');
                this.stopSpeechRecognition();
            }
        }
        return false;
    }

    async getSpeakNative() {
        let blob = null;
        console.log('speakNative this.currentSlide', this.currentSlide);
        if (this.currentSlide.should_read_native &&
            (this.currentSlide.index_in_bundle == 0 || this.currentSlide.index_in_bundle == -1)) {
            blob = await this.speakNative({'text': this.currentSlide.native_language_text.he});
        }
        return blob;
    }

    base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = window.atob(base64);
        const length = binaryString.length;
        const bytes = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes.buffer;
    }

    clearAudioQue() {
        this.audioBlobQue = [];
        this.audioQue = [];
    }

    stopAudio() {
        this.clearAudioQue();
        if (this.currentAudio) {
            this.currentAudio.pause();
            // setTimeout(() => {
            // this.currentAudio.src = '';
            // })
            // this.speakInProgress = false;
        }
    }



    unsubscribeAllHttpEvents() {
        for (const key in this.apiSubscriptions) {
            if (this.apiSubscriptions[key]) {
                this.apiSubscriptions[key].unsubscribe();
                this.apiSubscriptions[key] = null;
            }
        }
        this.clearForcedSlide();
    }


    setRandomCircleAnimation() {
        let count = 0;
        setInterval(() => {
            const delay = this.animationsService.randomIntFromInterval(0, 1);
            setTimeout(() => {
                this.animationsService.triggerAddingCircle(count);
                count++;
                if (count > 10) {
                    count = 0;
                }
            }, delay * 1000);
        }, 800);
        this.animationsService.triggerAddingCircle(count);
        count++;
    }

    @HostListener('window:resize', ['$event'])
    windowResize(e: any) {
        if (e.target.innerWidth < this.mobileWidth) {
            if (!this.isMobile) {
                this.isMobile = true;
            }
        } else {
            if (this.isMobile) {
                this.isMobile = false;
            }
        }
    }

    setupSocketSpeechRecognition() {
        if (navigator.mediaDevices) {
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                },
                video: true
            };
            navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
                // Display the stream in the video element
                this.socketSpeechRecognitionService.connect();
                this.socketSpeechRecognitionService.onConnect.subscribe((msg) => {
                    console.log('onConnect msg', msg);
                    this.socketSpeechRecognitionService.sendMessage('hello', {'test': 'hi'});
                    this.socketSpeechRecognitionService.setupContinuesRecordAudio(mediaStream);
                });
                this.socketSpeechRecognitionService.ListenFor('got-audio-data').subscribe((data) => {
                    console.log('socketSpeechRecognitionService got-audio-data', data);
                    if ( data.is_final) {
                        this.onRecognitionResults({text: data.transcript});
                    }
                });
                this.socketSpeechRecognitionService.ListenFor('hello-back').subscribe((data) => {
                    console.log('socketSpeechRecognitionService hello-back', data);
                });
            });
        } else {
            console.error('Webcam access not supported');
        }
    }

    allowApiCalls() {
        return true;
        return !this.presentationResetIsInProgress &&
            !this.presentationReplayIsInProgress &&
            !this.presentationNewSlideInProgress &&
            !this.presentationNoReplayIsInProgress &&

            !this.nextSlideIsInProgress &&
            !this.prevSlideIsInProgress &&
            !this.eventHandlingInProgress;
    }

    resetAllEventProgress() {
        this.presentationResetIsInProgress = false;
        this.presentationReplayIsInProgress = false;
        this.presentationNewSlideInProgress = false;
        this.presentationNoReplayIsInProgress = false;

        this.nextSlideIsInProgress = false;
        this.prevSlideIsInProgress = false;
        this.eventHandlingInProgress = false;
    }

    ngOnDestroy() {
        if (this.recognitionOnResultsSubscribe) {
            this.recognitionOnResultsSubscribe.unsubscribe(this.onRecognitionResults);
        }
        console.log('this.currentAudi', this.currentAudio);
        this.stopAudio();
        this.unsubscribeAllHttpEvents();
        this.stopHeartBeat();
        this.lessonService.ClearAllEvents();
        this.stopSpeechRecognition();
        // this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
        this.clearSocketRecorderServices();
    }

    setupPresentationMock() {
        const presentation = {
            "sections": [
                {
                    "section_title": "Introduction",
                    "section_topic": "get to know each other and what we will do today",
                    "slides": [
                        {
                            "slide_title": "This vs These",
                            "slide_visual_description": "a slide with youtube video about This vs These",
                            "remarks": "",
                            "n_failures_allowed": 3,
                            "slide_type": "video",
                            "slide_objectives": [
                                "explain that we are going to see a video for the purpose of: {slide_dict.video_purpose}",
                                "wait till the student confirm he watched the entire movie"
                            ],
                            "full_screen": false,
                            "estimated_duration": 120,
                            "native_language_text": {
                                "he": "צְפֵה בַּוִּידֵאוֹ"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK. now let's see a short video in order to learn this vs these. you can start it by pressing the play button.",
                                    "is_mission_accomplished": true
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": -1,
                            "video_purpose": "learn this vs these",
                            "video_details": {
                                "id": "-sPwShzNyGQ",
                                "start_time": 14,
                                "end_time": 496
                            },
                            "video_content": "explanation when to use this and these with many examples",
                            "text": "This is used for one thing,\n These is used for many things"
                        },
                        {
                            "slide_title": "",
                            "slide_visual_description": "a slide with a teacher image and a text box with the teacher name and the topic of the lesson",
                            "remarks": "",
                            "n_failures_allowed": 3,
                            "slide_type": "greeting",
                            "slide_objectives": [
                                "say hi and introduce yourself as the english teacher",
                                "say the topic of the lesson"
                            ],
                            "full_screen": false,
                            "estimated_duration": 90,
                            "native_language_text": {
                                "he": "שלום! שמי ג׳ני "
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "Hi! My name is Jenny and I'm your English teacher. How are you today?",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "Hello dear. SHALOM! You are so cute. I'm happy to be here. My name is Jenny and I will be your english teacher today. are you ready to start?",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "SHALOM SHALOM! I'm Jenny. I'm your english teacher. What is your name?",
                                    "is_mission_accomplished": true
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": -1,
                            "teacher_name": "Jenny",
                            "teacher_name_native": "ג׳ני",
                            "teacher_image_path": "https://t3.ftcdn.net/jpg/00/63/41/20/360_F_63412065_tVAWzIWl9wE7l73MWUVieyGg1QlzhQCR.jpg",
                            "text": "Hello. I'm Jenny.\n\n                        Today's lesson:  Colors and Animals for beginners."
                        },
                        {
                            "slide_title": "Colors and Animals for beginners",
                            "slide_visual_description": "a slide with a list of the topics that will be covered in the lesson",
                            "remarks": "",
                            "n_failures_allowed": 3,
                            "slide_type": "agenda",
                            "slide_objectives": [
                                "tell the student what are the sections of today's lesson: \n  0) Introduction.\n  1) Vocabulary.\n  2) Wrap up.\n"
                            ],
                            "full_screen": false,
                            "estimated_duration": 30,
                            "native_language_text": {},
                            "starting_responses": [
                                {
                                    "teacher_text": "PAUSE1SECBefore we start, let me tell you what are the sections of today's lesson:   0) Introduction.PAUSE1SEC\n  1) Vocabulary.PAUSE1SEC\n  2) Wrap up.PAUSE1SEC\n.                                    you can always see the section list on the right panel.PAUSE1SEC Now... let's take a deep breath and get started! or how we say it in hebrew? YALLLA! PAUSE3SEC",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "PAUSE1SECI would like to tell you a bit about today's lessons parts. You can see it on the right side of your screenPAUSE1SEC, The first section is Introduction where we get to know each other and what we will do todayPAUSE1SEC.                                    then, we will continue with the following:PAUSE1SEC Vocabulary, where we learn new words. Then Wrap up, where we say good Bye. So... are you ready to have some fun?PAUSE3SEC",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "PAUSE1SECNow, let's go through today's lesson plan. The first section is Introduction where we get to know each other and what we will do todayPAUSE1SEC.                                    then, we will continue with the following:PAUSE1SEC Vocabulary, where we learn new words. Then Wrap up, where we say good Bye. So... are you ready to have some fun? PAUSE3SEC",
                                    "is_mission_accomplished": true
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": -1,
                            "text": "Today we will cover the following topics:\n  0) Introduction.\n  1) Vocabulary.\n  2) Wrap up.\nLet's get started!"
                        }
                    ]
                },
                {
                    "section_title": "Vocabulary",
                    "section_topic": "learn new words",
                    "slides": [
                        {
                            "slide_title": "repeat after me:",
                            "slide_visual_description": "a slide with a picture and a text of a dog ",
                            "remarks": "if the mission has accomplished (meaning the student said the expected text) do not end your reply with a question !,\n        DO NOT ask to repeat after text that is not dog, do not invent other tasks other than repaeting the specific text - dog",
                            "n_failures_allowed": 3,
                            "slide_type": "word_repeater",
                            "slide_objectives": [
                                "make the student repeat after you saying correctly the word dog"
                            ],
                            "full_screen": true,
                            "estimated_duration": 15,
                            "native_language_text": {
                                "he": "חזור אחר המורה והקרא את המילה או המילים המופיעות בשקף"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK. Let's continue and practive our volcabulary. Can you repeat after me saying the word dog? dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "So... Now try to repeat after me saying the word dog. please say it slowly and correctly. dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Look how nice is the picture of the dog. Can you repeat after me and say it? dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Wow. I love dog so much. What about you? can you please say the word after me? dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Can you see the picture on the screen? this is a dog. can you please say the word dog loudly after me? dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Let's move on. Now. This is a dog. can you say dog after me? dog",
                                    "is_mission_accomplished": false
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": 1,
                            "word": "dog",
                            "word_image_path": "https://www.thesprucepets.com/thmb/wdb0SmPvT4IjVLM7TdztfD_KAUs=/2144x0/filters:no_upscale():strip_icc()/AmericanEskimo-4293b26f3e044165959f6dbfd70214b2.jpg",
                            "text": "dog"
                        },
                        {
                            "slide_title": "repeat after me:",
                            "slide_visual_description": "a slide with a picture and a text of a cat ",
                            "remarks": "if the mission has accomplished (meaning the student said the expected text) do not end your reply with a question !,\n        DO NOT ask to repeat after text that is not cat, do not invent other tasks other than repaeting the specific text - cat",
                            "n_failures_allowed": 3,
                            "slide_type": "word_repeater",
                            "slide_objectives": [
                                "make the student repeat after you saying correctly the word cat"
                            ],
                            "full_screen": true,
                            "estimated_duration": 15,
                            "native_language_text": {
                                "he": "חזור אחר המורה והקרא את המילה או המילים המופיעות בשקף"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK. Let's continue and practive our volcabulary. Can you repeat after me saying the word cat? cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "So... Now try to repeat after me saying the word cat. please say it slowly and correctly. cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Look how nice is the picture of the cat. Can you repeat after me and say it? cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Wow. I love cat so much. What about you? can you please say the word after me? cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Can you see the picture on the screen? this is a cat. can you please say the word cat loudly after me? cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Let's move on. Now. This is a cat. can you say cat after me? cat",
                                    "is_mission_accomplished": false
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": 1,
                            "word": "cat",
                            "word_image_path": "https://images.ctfassets.net/cnu0m8re1exe/qDQgxOUG5DNKlKH5TXsbo/813fa629fe33794c7ff439070fc31b89/shutterstock_603117302.jpg?fm=jpg&fl=progressive&w=660&h=433&fit=fill",
                            "text": "cat"
                        },
                        {
                            "slide_title": "repeat after me:",
                            "slide_visual_description": "a slide with a picture and a text of a bird ",
                            "remarks": "if the mission has accomplished (meaning the student said the expected text) do not end your reply with a question !,\n        DO NOT ask to repeat after text that is not bird, do not invent other tasks other than repaeting the specific text - bird",
                            "n_failures_allowed": 3,
                            "slide_type": "word_repeater",
                            "slide_objectives": [
                                "make the student repeat after you saying correctly the word bird"
                            ],
                            "full_screen": true,
                            "estimated_duration": 15,
                            "native_language_text": {
                                "he": "חזור אחר המורה והקרא את המילה או המילים המופיעות בשקף"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK. Let's continue and practive our volcabulary. Can you repeat after me saying the word bird? bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "So... Now try to repeat after me saying the word bird. please say it slowly and correctly. bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Look how nice is the picture of the bird. Can you repeat after me and say it? bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Wow. I love bird so much. What about you? can you please say the word after me? bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Can you see the picture on the screen? this is a bird. can you please say the word bird loudly after me? bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Let's move on. Now. This is a bird. can you say bird after me? bird",
                                    "is_mission_accomplished": false
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": -1,
                            "word": "bird",
                            "word_image_path": "https://cdn.britannica.com/23/188023-050-C1E4796B/cardinal-branch-songbird.jpg",
                            "text": "bird"
                        },
                        {
                            "slide_title": "repeat after me:",
                            "slide_visual_description": "a slide with a picture and a text of a white dog ",
                            "remarks": "if the mission has accomplished (meaning the student said the expected text) do not end your reply with a question !,\n        DO NOT ask to repeat after text that is not white dog, do not invent other tasks other than repaeting the specific text - white dog",
                            "n_failures_allowed": 3,
                            "slide_type": "word_repeater",
                            "slide_objectives": [
                                "make the student repeat after you saying correctly the word white dog"
                            ],
                            "full_screen": true,
                            "estimated_duration": 15,
                            "native_language_text": {
                                "he": "חזור אחר המורה והקרא את המילה או המילים המופיעות בשקף"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK. Let's continue and practive our volcabulary. Can you repeat after me saying the word white dog? white dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "So... Now try to repeat after me saying the word white dog. please say it slowly and correctly. white dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Look how nice is the picture of the white dog. Can you repeat after me and say it? white dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Wow. I love white dog so much. What about you? can you please say the word after me? white dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Can you see the picture on the screen? this is a white dog. can you please say the word white dog loudly after me? white dog",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Let's move on. Now. This is a white dog. can you say white dog after me? white dog",
                                    "is_mission_accomplished": false
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": 1,
                            "word": "white dog",
                            "word_image_path": "https://www.rd.com/wp-content/uploads/2021/03/GettyImages-185867236-scaled-e1617044973291.jpg",
                            "text": "white dog"
                        },
                        {
                            "slide_title": "repeat after me:",
                            "slide_visual_description": "a slide with a picture and a text of a black cat ",
                            "remarks": "if the mission has accomplished (meaning the student said the expected text) do not end your reply with a question !,\n        DO NOT ask to repeat after text that is not black cat, do not invent other tasks other than repaeting the specific text - black cat",
                            "n_failures_allowed": 3,
                            "slide_type": "word_repeater",
                            "slide_objectives": [
                                "make the student repeat after you saying correctly the word black cat"
                            ],
                            "full_screen": true,
                            "estimated_duration": 15,
                            "native_language_text": {
                                "he": "חזור אחר המורה והקרא את המילה או המילים המופיעות בשקף"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK. Let's continue and practive our volcabulary. Can you repeat after me saying the word black cat? black cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "So... Now try to repeat after me saying the word black cat. please say it slowly and correctly. black cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Look how nice is the picture of the black cat. Can you repeat after me and say it? black cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Wow. I love black cat so much. What about you? can you please say the word after me? black cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Can you see the picture on the screen? this is a black cat. can you please say the word black cat loudly after me? black cat",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Let's move on. Now. This is a black cat. can you say black cat after me? black cat",
                                    "is_mission_accomplished": false
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": 1,
                            "word": "black cat",
                            "word_image_path": "https://www.rover.com/blog/wp-content/uploads/black-long-hair-cat-min-1024x683.jpg",
                            "text": "black cat"
                        },
                        {
                            "slide_title": "repeat after me:",
                            "slide_visual_description": "a slide with a picture and a text of a red bird ",
                            "remarks": "if the mission has accomplished (meaning the student said the expected text) do not end your reply with a question !,\n        DO NOT ask to repeat after text that is not red bird, do not invent other tasks other than repaeting the specific text - red bird",
                            "n_failures_allowed": 3,
                            "slide_type": "word_repeater",
                            "slide_objectives": [
                                "make the student repeat after you saying correctly the word red bird"
                            ],
                            "full_screen": true,
                            "estimated_duration": 15,
                            "native_language_text": {
                                "he": "חזור אחר המורה והקרא את המילה או המילים המופיעות בשקף"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK. Let's continue and practive our volcabulary. Can you repeat after me saying the word red bird? red bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "So... Now try to repeat after me saying the word red bird. please say it slowly and correctly. red bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Look how nice is the picture of the red bird. Can you repeat after me and say it? red bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Wow. I love red bird so much. What about you? can you please say the word after me? red bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Can you see the picture on the screen? this is a red bird. can you please say the word red bird loudly after me? red bird",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "Let's move on. Now. This is a red bird. can you say red bird after me? red bird",
                                    "is_mission_accomplished": false
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": -1,
                            "word": "red bird",
                            "word_image_path": "https://www.birdsandblooms.com/wp-content/uploads/2017/05/cardinal_michelle-summers.jpg?fit=680%2C617",
                            "text": "red bird"
                        },
                        {
                            "slide_title": "read the text below:",
                            "slide_visual_description": "a slide with the following text to be read by the student: \n                                Dogs say woof-woof. \n                                Cats say meow. \n                                Birds sing tweet-tweet.\n                            ",
                            "remarks": "The task is done when the student reads all the text but it can be line by line and does not have to be all in one shot\nif the student read a part of the given text correctly give him a positive reward and focus on the parts he did not do correctly",
                            "n_failures_allowed": 6,
                            "slide_type": "reading",
                            "slide_objectives": [
                                "explain the student that he needs to read the text on the slide loudly and correctly. sentence by sentense",
                                "make sure the student read the following text corrrectly: \n                                Dogs say woof-woof. \n                                Cats say meow. \n                                Birds sing tweet-tweet.\n                            "
                            ],
                            "full_screen": true,
                            "estimated_duration": 120,
                            "native_language_text": {
                                "he": "קרא את הטקסט בקול רם"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "Great. you have done a very good so far. Let's move on. I hope you ready for a challange. I want you to read out the text on the slide correctly. Do it sentence by sentence.",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "Let's move on. I hope you're up for a challange. I want you to read out the text on the slide for me. \n                                    Do it sentence by sentence.PAUSE1SEC I will read first and than you goPAUSE1SEC. Dogs say woof-woof.PAUSE1SEC Cats say meow.PAUSE1SEC Birds sing tweet-tweet.PAUSE1SEC",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "So... Now it's time to read some longer sentences. Can you please read for me the text on the screen? Best is to do it correctly and slowly, or how you say it in hebrew: LEAAT LEAAT",
                                    "is_mission_accomplished": true
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": -1,
                            "text": "\n                                Dogs say woof-woof. \n                                Cats say meow. \n                                Birds sing tweet-tweet.\n                            ",
                            "lines": [
                                "Dogs say woof-woof.",
                                "Cats say meow.",
                                "Birds sing tweet-tweet."
                            ],
                            "lines_lower_no_punct": [
                                "dogssaywoofwoof",
                                "catssaymeow",
                                "birdssingtweettweet"
                            ],
                            "text_to_validate": "dogssaywoofwoofcatssaymeowbirdssingtweettweet"
                        }
                    ]
                },
                {
                    "section_title": "Wrap up",
                    "section_topic": "say good Bye",
                    "slides": [
                        {
                            "slide_title": "",
                            "slide_visual_description": "a slide with a bye bye image that is related to the lesson",
                            "remarks": "",
                            "n_failures_allowed": 3,
                            "slide_type": "ending",
                            "slide_objectives": [
                                "review the lesson topics",
                                "say goodbye and thank the student for the lesson"
                            ],
                            "full_screen": false,
                            "estimated_duration": 15,
                            "native_language_text": {
                                "he": "ביי ביי"
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "OK dear. It is time to finish out lesson. I really hope you enjoyed it. have you?",
                                    "is_mission_accomplished": false
                                },
                                {
                                    "teacher_text": "So... Our time is off and the lesson comes to its end. How was it? Did you learn new things?",
                                    "is_mission_accomplished": false
                                }
                            ],
                            "student_responses": [],
                            "bundle_id": -1,
                            "image_path": "https://cdn2.vectorstock.com/i/1000x1000/72/36/basic-colors-educational-set-with-sea-animals-vector-22457236.jpg",
                            "text": "Bye Bye.\n                        We will meet again soon!"
                        }
                    ]
                }
            ],
            "presentation_done": false,
            "current_section_index": 0,
            "current_slide_index": 0,
            "current_objective_index": 0,
            "current_objective_api_tries": 0,
            "estimated_duration": 345,
            "teacher": {
                "age": 25,
                "name": "Jenny",
                "style": "very friendly, patient, and kids' oriented",
                "gender": "female",
                "image_path": "https://t3.ftcdn.net/jpg/00/63/41/20/360_F_63412065_tVAWzIWl9wE7l73MWUVieyGg1QlzhQCR.jpg"
            },
            "presentation_title": "Colors and Animals",
            "presentation_topic": "Colors and Animals for beginners"
        };

        this.presentation = new Presentation(presentation);
        console.log('this.presentation ', this.presentation );
        this.currentSectionIndex = this.presentation.current_section_index;
        this.currentSlideIndex = this.presentation.current_slide_index;
        this.currentObjectiveIndex = this.presentation.current_objective_index;
        this.estimatedDuration = this.presentation.estimated_duration;
        this.setCurrentSection();
    }

    async setupSocketRecorder() {
        return new Promise(async (resolve, reject) => {
            if (navigator.mediaDevices) {
                const userCameraConstraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                    }
                    // video: true
                };
                const videoStream = await navigator.mediaDevices.getUserMedia(userCameraConstraints).catch(e => {
                    throw e;
                });
                const userShareScreenConstraints = {
                    video: true,
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                        //     restrictOwnAudio: false
                        //     // sampleRate: 44100,
                        //     // suppressLocalAudioPlayback: true,
                    },
                    preferCurrentTab: true
                    // systemAudio : 'include',
                    // selfBrowserSurface: 'include'
                    // video: {
                    //     displaySurface: "monitor",
                    //     // cursor: 'always',
                    //     // resizeMode: 'crop-and-scale',
                    // },
                };

                this.socketRecorderService.connect();
                this.socketRecorderEvents.onConnect = this.socketRecorderService.onConnect.subscribe(this.onSocketRecorderConnect);
                this.socketRecorderService.ListenFor('got-recorder-data').subscribe((data) => {
                    console.log('SocketRecorderService got-recorder-data', data);
                });
                this.socketRecorderService.ListenFor('hello-back').subscribe((data) => {
                    console.log('SocketRecorderService hello-back', data);
                });

                let displayStream: any = null;
                if (!this.socketRecorderService.capturingMediaStream) {
                    try {
                        displayStream = await navigator.mediaDevices.getDisplayMedia(userShareScreenConstraints).catch(e => {
                            throw e;
                        });

                        // combine two audio sources
                        const audioCtx = new AudioContext();
                        const source1 = audioCtx.createMediaStreamSource(videoStream);
                        const source2 = audioCtx.createMediaStreamSource(displayStream);
                        const destination = audioCtx.createMediaStreamDestination();
                        source1.connect(destination);
                        source2.connect(destination);

                        const combineAudio = destination.stream.getAudioTracks();
                        const displayVideoTracks = displayStream.getVideoTracks();
                        const mergeTracks = [...displayVideoTracks, ...combineAudio];
                        this.socketRecorderService.capturingMediaStream = new MediaStream(mergeTracks);
                        this.socketRecorderService.setupContinuesRecording3(this.socketRecorderService.capturingMediaStream);
                        resolve('');
                    } catch (e) {
                        reject('the use canceled streaming');
                        return;
                    }
                } else {
                    reject('already running');
                }
            } else {
                reject('Webcam access not supported');
            }
        });
    }

    onSocketRecorderConnect = (msg: string) => {
        console.log('SocketRecorderService onConnect msg', msg);
        this.socketRecorderService.sendMessage('hello', {'test': 'hi'});
    };

    clearSocketRecorderServices() {
        if (this.socketRecorderEvents.onConnect) {
            this.socketRecorderEvents.onConnect.unsubscribe(this.onSocketRecorderConnect);
            this.socketRecorderService.ClearEvent('got-recorder-data');
            this.socketRecorderService.ClearEvent('hello-back');
        }
    }
}

