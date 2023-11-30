import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {ApiService} from "../../../main/services/api.service";
import {Config} from "../../../main/config";
import {AnimationsService} from "../../../main/services/animations/animations.service";
import {SpeechRecognitionService} from "../../../main/services/speech-recognition/speech-recognition.service";
import {SocketSpeechRecognitionService} from "../../../main/services/socket-speech-recognition/socket-speech-recognition.service";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {SpeechRecognitionEnhancerService} from "../../../main/services/speech-recognition/speech-recognition-enhancer.service";
import {SocketRecorderService} from "../../../main/services/socket-recorder/socket-recorder.service";
import {User} from "../../../shared-slides/entities/user";
import {environment} from "../../../../../environments/environment";
import {Presentation, PresentationSection, PresentationSlide} from "../../../shared-slides/entities/presentation";
import {BlobItem} from "../../../shared-slides/entities/blob_item";

@Component({
    selector: 'app-practice-lesson',
    templateUrl: './practice-lesson.component.html',
    styleUrls: ['./practice-lesson.component.less']
})
export class PracticeLessonComponent implements OnInit {

    private user!: User;
    mock = environment.is_mock;
    lesson_id!: number;
    question_id!: number;
    modalActive:boolean=false;
    enable_end_lesson_button:boolean=false;
    vocabulary_was_added:boolean=true;
    slide_uid!: string;

    socketRecorderEvents: any = {};
    socketRecorderEnabled = false;

    presentation: Presentation = new Presentation();

    gettingPresentation = false;
    currentSectionIndex: number = -1;
    currentSlideIndex: number = -1;
    currentObjectiveIndex: number = -1;
    estimatedDuration: number = -1;
    currentSection: PresentationSection = new PresentationSection();
    currentSlide: PresentationSlide = new PresentationSlide();
    currentObjective: any = null;
    currentData: any = null;

    presentationReplayIsInProgress = false;
    presentationResetIsInProgress = false;
    presentationNewSlideInProgress = false;
    presentationNoReplayIsInProgress = false;
    nextSlideIsInProgress = false;
    prevSlideIsInProgress = false;
    eventHandlingInProgress = false;

    apiSubscriptions: any = {}

    audioQue: string[] = []
    audioBlobQue: BlobItem[] = []
    speakInProgress = false;
    currentAudio: any = null;

    doNotDisturb = false;
    isPause: boolean = false;
    webcam_last_snapshot_url: string = ''
    webcam_last_snapshot_url_updated: boolean = false;
    needToCallNextSlideReplay: boolean = false;
    forceChangeSlideInfo: boolean = false;
    forcedChangeSlideInfo:any = {};

    enableArrayBuffer = true;

    initApplicationDone = false;


    public sectionTitles = {
        bundle:'bundle',
        greeting: 'greeting',
        reading: 'reading',
        word_repeater: 'word_repeater',
        image_generator: 'image_generator',
        agenda: 'agenda',
        ending: 'ending',
        video: 'video',
        video_ielts: 'video-ielts',
        blanks:'blanks',
        title:'title',
        random_selector:'random_selector',
        writing:'writing',
        template:'template',
        word_translator:'word_translator',
        unseen:'unseen',
        hearing:'hearing',
        speaking:'speaking',
        generic_slide:'generic_slide',
        embed_game:'embed_game'
    }

    @ViewChild('slides', { static: false }) slides!: ElementRef;
    slidesData: any[] = []
    slideWidth: number = -1;
    slideHeight: number = -1;

    imageSrc = ''

    constructor(
        private apiService: ApiService,
        private config: Config,
        private animationsService: AnimationsService,
        private speechRecognitionService: SpeechRecognitionService,
        private socketSpeechRecognitionService: SocketSpeechRecognitionService,
        public lessonService: LessonService,
        private speechRecognitionEnhancerService: SpeechRecognitionEnhancerService,
        private socketRecorderService: SocketRecorderService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.imageSrc = this.config.staticImagePath
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            const lesson_id = params.get('id')
            if (lesson_id) {
                this.lesson_id = parseInt(lesson_id);
            }
        })
        this.route.queryParams.subscribe((params) => {
            const q_id = params['q_id']
            if (q_id) {
                this.question_id = parseInt(q_id);
            }
            const s_uid = params['s_uid']
            if (s_uid) {
                this.slide_uid = s_uid;
            }
        })

        this.getUser();
        if (this.socketRecorderEnabled) {
            this.startRecordingScreen();
        } else {
            this.initApplication();
        }
    }

    getUser() {
        this.user = this.config.user
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user
        })
    }

    startRecordingScreen() {
        this.setupSocketRecorder().then(() => {
            const lesson_id = `lesson_id_${new Date().getTime()}`;
            this.socketRecorderService.startCapturingVideo();
            this.socketRecorderService.startCapturingInterval(this.user.id, lesson_id);
            this.socketRecorderService.capturingMediaStream.getVideoTracks()[0].onended = () => {
                // stoped sharing
                console.log('socketRecorderService stopped sharing');
                this.socketRecorderService.stopCapturingInterval(this.user.id, lesson_id);
                this.socketRecorderService.capturingMediaStream = null
            };
            this.initApplication();
        }).catch((e) => {
            console.log('setupSocketRecorder e', e);
            this.initApplication();
        })
    }

    async resetApplication(){

        if (!this.mock) {
            this.stopAudio();
            this.unsubscribeAllHttpEvents();
        } else {

        }
    }

    initApplication(){
        if (!this.mock) {
            if(!this.speechRecognitionService.mainRecognition) {
                this.speechRecognitionService.setupSpeechRecognition();
            }
            this.stopAudio();
            this.resetAllEventProgress();
            this.lessonService.Broadcast('resetChatMessages', {});
            this.lessonService.Broadcast('resumeLesson', {});
            this.getPresentation();
            if (!this.initApplicationDone) {
                // adding listeners only once
                this.listenForSlideEventRequests()
                this.listenForPauseEvnet()
                this.listenForSnapshots()
            }
            this.initApplicationDone = true;

        } else {
            if(!this.speechRecognitionService.mainRecognition) {
                this.speechRecognitionService.setupSpeechRecognition();
                // this.speechRecognitionService.startListening();
            }
            this.lessonService.resetHelpMode()
            if (!this.initApplicationDone) {
                // adding listeners only once
                this.listenForPauseEvnet()
                this.listenForSlideEventRequests()
            }
            this.initApplicationDone = true;
            // this.setupPresentationMock();
            this.getPresentation();
            // this.setRandomCircleAnimation();
        }
    }

    async getPresentation() {
        this.gettingPresentation = true;
        this.apiSubscriptions.get_presentation = this.apiService.getPresentation({
            practice_lesson_id: this.lesson_id,
        }).subscribe({
            next: (response: any) => {
                if (response.err) {
                    if (response.errMessage.indexOf('lesson does not exist') > -1) {
                        this.router.navigate(['test_prep/dashboard'])
                    }
                    console.log('getPresentation err', response)
                } else {
                    this.presentation = new Presentation(response.presentation);
                    console.log('this.presentation ', this.presentation)
                    if (this.question_id) {
                        let get_slide_from_presentation = true;
                        if (this.slide_uid) {
                            get_slide_from_presentation = this.setSlideBySlideUid();
                        }
                        this.setIndexesByQuestionId(get_slide_from_presentation);
                        this.gettingPresentation = false;
                        return;
                    } else {
                        this.user.last_lesson_id = this.lesson_id;
                        this.config.user = this.user;
                        this.currentSectionIndex = this.presentation.current_section_index;
                        this.currentSlideIndex = this.presentation.current_slide_index;
                        this.currentObjectiveIndex = this.presentation.current_objective_index;
                        this.estimatedDuration = this.presentation.estimated_duration;
                        this.setCurrentSection();
                        this.setData();
                    }
                    console.log('this.currentSlide', this.currentSlide)
                    if (!this.mock) {
                        // this.restartCurrentSlide()
                        this.getNewSlideReply();
                    }
                }
                this.gettingPresentation = false;
            },
            error: (error) => {
                console.log('getPresentation error', error)
                this.gettingPresentation = false;
            },
        })
    }

    async getPresentationEventReplay(data:any={}) {
        if(!data.hasOwnProperty('background') || !data['background']){
            if (this.eventHandlingInProgress) {
                return;
            }
        }
        this.eventHandlingInProgress = true;
        this.apiSubscriptions.replay = this.apiService.getPresentationReplay({
            practice_lesson_id: this.lesson_id,
            app_data: {
                type:'event',
                help_mode: this.lessonService.helpMode,
                data: data,
                array_buffer: this.enableArrayBuffer,
                webcam_last_snapshot_url: this.webcam_last_snapshot_url_updated ? this.webcam_last_snapshot_url: "same"
            }
        }).subscribe({
            next: (response: any) => {
                this.eventHandlingInProgress = false;
                if (response.err) {
                    console.log('response err', response)
                    this.handleOnReplayError()
                } else {
                    this.currentData = response.data;
                    this.handleOnPresentationReplay();
                }
            },
            error: (error) => {
                console.log('getPresentationEventReplay error', error)
                this.eventHandlingInProgress = false;
                if (data.source == "image_generator_button_click") {
                    const data = {'type': 'additional_instructions', 'data': {source: 'image_generator_button_click_error'}}
                    this.lessonService.Broadcast("slideEventReply", data)
                }
            },
        })
    }

    async getPresentationReplay(text: string = '') {
        if (this.presentationNoReplayIsInProgress) {
            return;
        }
        let message = text;

        this.presentationReplayIsInProgress = true;
        this.lessonService.Broadcast('student_reply_request', message)
        this.apiSubscriptions.replay = this.apiService.getPresentationReplay({
            practice_lesson_id: this.lesson_id,
            app_data: {
                type:'student_reply',
                student_text: message,
                help_mode: this.lessonService.helpMode,
                array_buffer: this.enableArrayBuffer,
                webcam_last_snapshot_url: this.webcam_last_snapshot_url_updated ? this.webcam_last_snapshot_url: "same"
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationReplayIsInProgress = false;
                this.lessonService.Broadcast('student_reply_response', response);

                if (response.err) {
                    console.log('response err', response)
                    this.handleOnReplayError()
                } else {
                    this.currentData = response.data;
                    this.handleOnPresentationReplay();
                }
            },
            error: (error) => {
                console.log('getPresentationReplay error', error)
                this.presentationReplayIsInProgress = false;
            },
        })
    }

    async getNewSlideReply() {
        if (this.presentationNewSlideInProgress) {
            return;
        }
        this.lessonService.speakNativeOnProgress = false;
        this.lessonService.speakNativeOnWaiting = false;
        this.presentationNewSlideInProgress = true;
        this.apiSubscriptions.next_slide = this.apiService.getNewSlideReply({
            practice_lesson_id: this.lesson_id,
            app_data: {
                type: 'new_slide',
                last_sr: '',
                last_sr_ts:0,
                last_speak_ts:0,
                help_mode: this.lessonService.helpMode,
                n_seconds_from_last_sr: 0,
                n_seconds_from_last_speak: 0,
                array_buffer: this.enableArrayBuffer,
                webcam_last_snapshot_url: this.webcam_last_snapshot_url_updated ? this.webcam_last_snapshot_url: "same"
            }
        }).subscribe({
            next: async (response: any) => {
                this.presentationNewSlideInProgress = false;
                // this.stopAudio()
                if (response.err) {
                    console.log('new slide response err', response)
                    this.handleOnReplayError()
                } else {
                    this.currentData = response.data;
                    this.handleOnPresentationReplay('new_slide');

                }
            },
            error: (error) => {
                this.presentationNewSlideInProgress = false;
                console.log('new slide error', error)
            },
        })
    }

    async getSpeakNative() {
        let blob = null;
        console.log('speakNative this.currentSlide', this.currentSlide)
        if (this.currentSlide.should_read_native &&
            (this.currentSlide.index_in_bundle == 0 || this.currentSlide.index_in_bundle == -1)) {
            blob = await this.speakNative({'text': this.currentSlide.native_language_text.he})
        }
        return blob;
    }

    async changeSlideReply() {
        if (this.presentationNewSlideInProgress) {
            return;
        }
        this.presentationNewSlideInProgress = true;
        this.apiSubscriptions.change_slide = this.apiService.changeSlideReply({
            practice_lesson_id: this.lesson_id,
            app_data: {
                type: 'change_slide',
                current_slide_info: this.forceChangeSlideInfo ? this.forcedChangeSlideInfo : {section_idx:this.currentSectionIndex, slide_idx:this.currentSlideIndex , objective_idx:this.currentObjectiveIndex}
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationNewSlideInProgress = false;
                this.clearForcedSlide()

                if (response.err) {
                    console.log('change slide response err', response)
                    this.handleOnReplayError()
                } else {
                    const data = response.data;
                    // this.stopAudio();
                    if (data.success) {
                        this.currentSectionIndex = data.current_section_index;
                        this.currentSlideIndex = data.current_slide_index;
                        this.currentObjectiveIndex = data.current_objective_index;
                        this.setCurrentSection();
                        this.setData();
                        if (this.doNotDisturb) {
                            this.lessonService.Broadcast('endDoNotDisturb',{})
                        }
                        if (this.isPause) {
                            this.needToCallNextSlideReplay = true;
                        } else {
                            this.getNewSlideReply();
                        }
                    } else {
                        console.log('change slide response err', response)
                    }
                }
            },
            error: (error) => {
                this.presentationNewSlideInProgress = false;
                this.clearForcedSlide()
                console.log('change slide error', error)
            },
        })
    }

    async speakNative(obj:any={}): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.lessonService.speakNativeOnProgress && !this.lessonService.speakNativeOnWaiting) {
                this.lessonService.speakNativeOnWaiting=true;
                this.apiSubscriptions.text_to_speech = this.apiService.textToSpeech({
                    'app_data':{'text':obj.text, 'lang':'iw'}
                }).subscribe({
                    next: async (response: any) => {
                        if (response.err) {
                            console.log('textToSpeech err', response)
                        } else {
                            const arrayBuffer = this.base64ToArrayBuffer(response.data.help_sound_buffer);
                            console.log('textToSpeech - ', arrayBuffer)
                            let blob = null;
                            if(!BlobItem.includes(this.audioBlobQue, arrayBuffer)){
                                blob = new BlobItem({arrayBuffer:arrayBuffer,
                                    action:'speakNative',
                                    type:'audio'})
                            }
                            resolve(blob);
                        }
                    },
                    error: (error) => {
                        console.log('getPresentation error', error)
                    },
                })
            }
        })
    }

    handleOnReplayError() {
        if (!this.presentationReplayIsInProgress
            && !this.presentationNoReplayIsInProgress
            && !this.presentationResetIsInProgress
            && !this.nextSlideIsInProgress
            && !this.prevSlideIsInProgress
            && !this.eventHandlingInProgress) {
            // this.resetIntervalNoReplay();
            // this.stopIntervalNoReplay();
            // this.startIntervalNoReplay()
        }
    }

    async handleOnPresentationReplay(reason: string = '') {
        if (this.isPause) {

            return;
        }
        const data = this.currentData
        console.log('DANIEL', data)
        let currentObjectiveIndexChanged = false
        const additional_instructions =data.additional_instructions;
        const presentation_index_updated = data.presentation_index_updated;
        const presentation_slide_updated = data.presentation_slide_updated;
        const presentation_content_updated = data.presentation_content_updated;
        const all_objectives_accomplished = data.all_objectives_accomplished;
        if(this.currentObjectiveIndex != data.current_objective_index){
            this.currentObjectiveIndex = data.current_objective_index
            currentObjectiveIndexChanged=true
        }
        const n_slide_objectives = data.n_slide_objectives;
        const presentation_done = data.presentation_done;
        const all_presentation_tasks_completed= data.all_presentation_tasks_completed;
        const text = data.text;
        // this.broadCastMessage('computer', text, true);
        const help_sound_url = data.help_sound_url;
        const help_sound_buffer = data.help_sound_buffer;
        // console.log('presentation_slide_updated',presentation_slide_updated)
        // console.log('presentation_index_updated',presentation_index_updated)
        // console.log('reason',reason)
        // console.log('data',data)

        // console.log('after+speak_native')
        // console.log('slideEventReply additional_instructions', additional_instructions)

        this.handleCoreFunctionalityOfSlide()

        if (additional_instructions) {
            const data = {'type': 'additional_instructions', 'data': additional_instructions}
            this.lessonService.Broadcast("slideEventReply", data)
        }

        let blob = null;
        if (reason === 'new_slide') {
            blob = await this.getSpeakNative();
        }

        if (help_sound_buffer || blob) {
            if(this.handleCoreFunctionalityOfSlide('speak')){
                if (blob && this.currentSlide.index_in_bundle == 0) {
                    console.log('speakNative before');
                    this.audioBlobQue.push(blob);
                }
                if (help_sound_buffer) {
                    console.log('help_sound_buffer added to que')
                    const arrayBuffer = this.base64ToArrayBuffer(help_sound_buffer);
                    if(!BlobItem.includes(this.audioBlobQue, arrayBuffer)){
                        this.audioBlobQue.push(new BlobItem({arrayBuffer:arrayBuffer, action:all_objectives_accomplished?'doNotListenAfter':'', type:'audio'}));
                    }
                }
                if (blob && this.currentSlide.index_in_bundle == -1) {
                    console.log('speakNative after');
                    this.audioBlobQue.push(blob);
                }
                if (!this.speakInProgress && this.audioBlobQue.length) {
                    console.log('this.audioBlobQue', this.audioBlobQue.length)
                    console.log('this.speakInProgress', this.speakInProgress)
                    const value = await this.playUsingBlob();
                }
            }
        }


        if (presentation_done) {
            this.unsubscribeAllHttpEvents();
            this.stopAudio();
            return;
        }
        console.log("all_presentation_tasks_completed",all_presentation_tasks_completed)
        if (all_presentation_tasks_completed){
            this.enable_end_lesson_button = true;
            // this.modalActive=true;
        }

        if (presentation_content_updated) {
            // TODO request presentation from server
        }

        if (all_objectives_accomplished) {
            // NIR - TODO - add wait for audio que to finish
            this.changeSlideReply()
        }

        if(currentObjectiveIndexChanged) {
            this.lessonService.Broadcast('currentObjectiveIndexChanged',this.currentObjectiveIndex)
        }

        // this.handleCoreFunctionalityOfSlide()

    }

    handleCoreFunctionalityOfSlide(is_key_enabled:string='') {
        const coreFuncs = this.currentSlide.core_instructions
        if(is_key_enabled){
            if(coreFuncs.hasOwnProperty(is_key_enabled)){
                return coreFuncs[is_key_enabled]
            } else {
                return true
            }
        } else {
            console.log('coreFuncs', coreFuncs)
            if(coreFuncs.hasOwnProperty('asr') && !coreFuncs.asr){
                console.log('coreFuncs', 'Stopping ASR')
            }
        }
        return false
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
    }

    playUsingBlob() {
        return new Promise(async (resolve, reject) => {
            if (this.audioBlobQue.length) {
                console.log('playUsingBlob arrayBuffer length', this.audioBlobQue.length)

                const currentBlobItem: BlobItem | undefined = this.audioBlobQue.shift();
                const loop = (blobItem: BlobItem) => {
                    if (blobItem.action=='speakNative') {
                        this.lessonService.speakNativeOnProgress = true;
                        this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_do_nothing'});
                    }
                    else {
                        console.log('change gif - speaking')
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
                    }
                    this.currentAudio.onpause = () => {
                        console.log('audio paused')
                        this.speakInProgress = false;
                        if (blobItem && blobItem.action=='speakNative') {
                            this.lessonService.speakNativeOnProgress = false;
                            this.lessonService.speakNativeOnWaiting = false;
                        }
                    }
                    this.currentAudio.onended = () => {
                        if (blobItem && blobItem.action=='speakNative') {
                            this.lessonService.speakNativeOnProgress = false;
                            this.lessonService.speakNativeOnWaiting = false;
                        }

                        console.log('audio ended')
                        this.currentAudio.currentTime = 0;
                        const currentBlobItem: BlobItem | undefined = this.audioBlobQue.shift();
                        console.log('playUsingBlob ended arrayBuffer')
                        if (currentBlobItem) {
                            loop(currentBlobItem)
                        } else {
                            console.log('end_blobItem', blobItem)
                            if (!blobItem || blobItem.action!='doNotListenAfter') {
                                console.log('change gif - listening')
                                // this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_listening'});
                                this.lessonService.Broadcast('audio_finished', {});
                            }
                            this.speakInProgress = false;
                            // this.resetSpeechRecognition();
                            resolve(true);
                        }
                    };
                }
                if (currentBlobItem) {
                    loop(currentBlobItem);
                }
            }
        });
    }

    async resetPresentation(reason: string = '') {
        console.log('this.gettingPresentation',this.gettingPresentation)
        console.log('this.presentationResetIsInProgress',this.presentationResetIsInProgress)
        if (this.presentationResetIsInProgress || this.gettingPresentation) {
            return;
        }
        await this.resetApplication()
        this.presentationResetIsInProgress = true;
        this.apiSubscriptions.reset = this.apiService.resetPresentation({
            practice_lesson_id: this.lesson_id,
            app_data: {
                type: reason,
            }
        }).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('response err', response)
                    this.handleOnReplayError();
                } else {
                    console.log('response', response)
                    this.initApplication()
                }
                this.presentationResetIsInProgress = false;
            },
            error: (error) => {
                this.presentationResetIsInProgress = false;
                console.log('resetPresentation error', error)
            },
        })
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
        if (index > -1) {
            this.currentSlide = new PresentationSlide(this.currentSection.slides[index]);
        } else {
            this.currentSlide = new PresentationSlide(this.currentSection.slides[this.currentSlideIndex]);
        }
        console.log('this.currentSlide', this.currentSlide)
    }

    setCurrentObjective(index: number = -1) {
        if (index > -1) {
            this.currentObjective = this.currentSlide.slide_objectives[index];
        } else {
            this.currentObjective = this.currentSlide.slide_objectives[this.currentObjectiveIndex];
        }
    }

    setData() {
        if (this.currentSlide.bundle_id > -1) {
            this.slidesData = this.currentSlide.bundle;
        } else {
            this.slidesData = [this.currentSlide]
        }
        setTimeout(() => {
            this.setSlidesRelativeWidth();
        })
    }

    setSlidesRelativeWidth() {
        const map = this.slidesData.map(o => o.slide_type).filter((str) => str !== undefined);
        const all_blanks = map.every( v => v === 'blanks' );
        const all_word_repeater = map.every( v => v === 'word_repeater' );
        const desiredRatio = 9/16;
        if(this.slides && this.slidesData.length > 1 && all_word_repeater) {
            const e = this.slides.nativeElement;
            const slidesWidth = e.clientWidth;
            const slidesHeight = e.clientHeight;
            const currentRatio = slidesHeight/slidesWidth;
            if (currentRatio < 1) {
                // width is bigger
                let newWidth = slidesHeight / desiredRatio;
                if (newWidth < slidesWidth) {
                    this.slideWidth = newWidth;
                    this.slideHeight = -1;
                } else {
                    this.slideWidth = -1;
                    this.slideHeight = slidesWidth * desiredRatio;
                }
            } else {
                // height is bigger
                let newHeight = slidesWidth * desiredRatio;
                if (newHeight < slidesHeight) {
                    this.slideWidth = -1;
                    this.slideHeight = newHeight;
                } else {
                    this.slideHeight = -1;
                    this.slideWidth = slidesHeight / desiredRatio;
                }
            }
        } else {
            this.resetSlideStyle();
        }
    }

    resetSlideStyle() {
        this.slideWidth = -1;
        this.slideHeight = -1;
    }

    listenForSlideEventRequests(){
        this.lessonService.ListenFor("slideEventRequest").subscribe((obj: any) => {
            if (obj.stopAudio) {
                this.stopAudio();
            }
            this.getPresentationEventReplay(obj)//#{"source": "image_generator_button_click", "selected_words": obj.selected_words})
        })
        this.lessonService.ListenFor("PresentationReplayRequest").subscribe((obj: any) => {
            if (obj.stopAudio) {
                this.stopAudio();
            }
            this.getPresentationReplay(obj.student_response)
        })
        this.lessonService.ListenFor("DoNotDisturb").subscribe((obj: any) => {
            if(!this.doNotDisturb){
                this.doNotDisturb = true;
                this.toggleStopAll(this.doNotDisturb);
                this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_sleep'});
            }
        })
        this.lessonService.ListenFor("endDoNotDisturb").subscribe((obj: any) => {
            if(this.doNotDisturb){
                this.doNotDisturb = false;
                this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_listening'});
                if (!obj.noToggle) {
                    this.toggleStopAll(this.doNotDisturb);
                }
            }
        })
        this.lessonService.ListenFor("restartCurrentSlide").subscribe((helpMode: string) => {
            this.restartCurrentSlide()
        })
        this.lessonService.ListenFor("stopAudio").subscribe((obj: any) => {
            this.stopAudio()
        })
        this.lessonService.ListenFor("slideDestroy").subscribe((obj: any) => {
            console.log('slideDestroy Event')
        })
        this.lessonService.ListenFor("slideAddToVocab").subscribe((obj: any) => {
            console.log('slideAddToVocab Event')
            const data = {
                word: obj.word,
                translate: obj.translate,
                lesson_id: this.lesson_id,
                slide_uuid: this.currentSlide.slide_uid,
                slide_index: this.currentSlideIndex
            }
            this.apiService.saveVocab(data).subscribe({
                next: (response: any) => {
                    if (response.err) {
                        console.log('saveVocab err', response)
                    } else {
                        console.log('saveVocab success')
                    }
                },
                error: (error) => {
                    console.log('saveVocab error', error)
                },
            })
        })
        this.lessonService.ListenFor("endGameAndMoveSlide").subscribe((obj: any) => {
            this.getPresentationEventReplay(obj)
        })

    }

    listenForPauseEvnet(){
        this.lessonService.ListenFor("pauseLesson").subscribe((obj: any) => {
            if (this.doNotDisturb) {
                return;
            }
            this.isPause = true
            this.lessonService.Broadcast('panelIconChange', {'iconName':'teacher_sleep'})
            this.togglePauseLesson()//#{"source": "image_generator_button_click", "selected_words": obj.selected_words})
        })
        this.lessonService.ListenFor("resumeLesson").subscribe((obj: any) => {
            if (this.doNotDisturb) {
                return;
            }
            this.lessonService.Broadcast('panelIconChange', {iconName: 'teacher_listening'});
            this.isPause = false
            this.togglePauseLesson()//#{"source": "image_generator_button_click", "selected_words": obj.selected_words})
        })
    }

    listenForSnapshots(){
        this.lessonService.ListenFor("snapshotTaken").subscribe((obj: any) => {
            this.webcam_last_snapshot_url = obj["image_url"]
            this.webcam_last_snapshot_url_updated = true
        })
    }

    togglePauseLesson(){
        console.log('this.isPause', this.isPause)
        this.toggleStopAll(this.isPause);
    }

    async toggleStopAll(value: boolean) {
        if (value) {
            this.stopAudio();
            this.unsubscribeAllHttpEvents();
            this.resetAllEventProgress();

        } else {
            if (this.needToCallNextSlideReplay) {
                this.needToCallNextSlideReplay = false;
                this.getNewSlideReply();
            }
        }
    }

    async setupSocketRecorder() {
        return new Promise(async (resolve, reject) => {
            if (navigator.mediaDevices) {
                const userCameraConstraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                    },
                    // video: true
                };
                const videoStream = await navigator.mediaDevices.getUserMedia(userCameraConstraints).catch(e => {
                    throw e
                })
                const userShareScreenConstraints = {
                    video: true,
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        //     restrictOwnAudio: false
                        //     // sampleRate: 44100,
                        //     // suppressLocalAudioPlayback: true,
                    },
                    preferCurrentTab: true,
                    // systemAudio : 'include',
                    // selfBrowserSurface: 'include'
                    // video: {
                    //     displaySurface: "monitor",
                    //     // cursor: 'always',
                    //     // resizeMode: 'crop-and-scale',
                    // },
                }

                this.socketRecorderService.connect()
                // this.socketRecorderEvents.onConnect = this.socketRecorderService.onConnect.subscribe(this.onSocketRecorderConnect)
                this.socketRecorderService.ListenFor('got-recorder-data').subscribe((data) => {
                    console.log('SocketRecorderService got-recorder-data', data)
                })
                this.socketRecorderService.ListenFor('hello-back').subscribe((data) => {
                    console.log('SocketRecorderService hello-back', data)
                })

                let displayStream: any = null;
                if (!this.socketRecorderService.capturingMediaStream) {
                    try {
                        displayStream = await navigator.mediaDevices.getDisplayMedia(userShareScreenConstraints).catch(e => {
                            throw e
                        })

                        // combine two audio sources
                        const audioCtx = new AudioContext();
                        const source1 = audioCtx.createMediaStreamSource(videoStream);
                        const source2 = audioCtx.createMediaStreamSource(displayStream);
                        const destination = audioCtx.createMediaStreamDestination();
                        source1.connect(destination);
                        source2.connect(destination);

                        const combineAudio = destination.stream.getAudioTracks();
                        const displayVideoTracks = displayStream.getVideoTracks();
                        const mergeTracks = [...displayVideoTracks, ...combineAudio]
                        this.socketRecorderService.capturingMediaStream = new MediaStream(mergeTracks)
                        this.socketRecorderService.setupContinuesRecording3(this.socketRecorderService.capturingMediaStream);
                        resolve('');
                    } catch (e) {
                        reject('the use canceled streaming')
                        return;
                    }
                } else {
                    reject('already running')
                }
            } else {
                reject('Webcam access not supported');
            }
        })
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

    unsubscribeAllHttpEvents() {
        for (let key in this.apiSubscriptions) {
            if (this.apiSubscriptions[key]) {
                this.apiSubscriptions[key].unsubscribe();
                this.apiSubscriptions[key] = null;
            }
        }
        this.clearForcedSlide()
    }

    restartCurrentSlide(){
        this.setForcedSlide(-1)
        this.changeSlideReply()
    }

    setForcedSlide(modifier:number=0){
        let flat_index = this.presentation.sections[this.currentSectionIndex].slides[this.currentSlideIndex].flat_index
        let new_flat_index = flat_index+modifier
        console.log('flat index ',flat_index)
        console.log('flat index info',this.presentation.slides_flat[flat_index])
        console.log('new_flat_index ',new_flat_index)
        console.log('new_flat_index info ',this.presentation.slides_flat[new_flat_index])
        if(new_flat_index>=0 && new_flat_index<this.presentation.slides_flat.length){
            let target_slide_info = this.presentation.slides_flat[new_flat_index]
            this.forceChangeSlideInfo = true
            this.forcedChangeSlideInfo = target_slide_info
        } else if (new_flat_index<0){
            this.resetPresentation()

        }
    }

    onNextSlide(e: any) {
        this.setForcedSlide(0)
        if(this.forceChangeSlideInfo){
            this.stopAudio()
            this.changeSlideReply()
        }
    }

    onPrevSlide(e: any) {
        this.setForcedSlide(-2)
        if(this.forceChangeSlideInfo){
            this.stopAudio()
            this.changeSlideReply()
        }
    }

    resetSpeechRecognition() {
        console.log('resetting ASR', this.speechRecognitionService.ASR_recognizing)
        if (this.speechRecognitionService.ASR_recognizing) {
            this.speechRecognitionService.stopListening().then(() => {
                this.startSpeechRecognition()
            })
        } else {
            if (!this.speechRecognitionService.stoppingRecognition) {
                this.startSpeechRecognition();
            }
        }
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

    clearForcedSlide() {
        this.forceChangeSlideInfo = false
        this.forcedChangeSlideInfo = {}
    }

    clearSocketRecorderServices() {
        if (this.socketRecorderEvents.onConnect) {
            // this.socketRecorderEvents.onConnect.unsubscribe(this.onSocketRecorderConnect)
            this.socketRecorderService.ClearEvent('got-recorder-data');
            this.socketRecorderService.ClearEvent('hello-back')
        }
    }

    setSlideBySlideUid() {
        let section_index = 0;
        for (let section of this.presentation.sections) {
            let slide_index = 0;
            for (let slide of section.slides) {
                console.log("slide.slide_uid, this.slide_uid", slide.slide_uid, this.slide_uid)
                if (slide.slide_uid == this.slide_uid) {
                    this.currentSectionIndex = section_index;
                    this.currentSlideIndex = slide_index;
                    this.currentObjectiveIndex = 0;
                    this.setCurrentSection();
                    this.setData();
                    return false;
                }
                slide_index++;
            }
            section_index++;
        }
        return true;
    }
    setIndexesByQuestionId(get_slide_from_presentation: boolean) {
        if (get_slide_from_presentation)
        {
            this.currentSectionIndex = this.presentation.current_section_index;
            this.currentSlideIndex = this.presentation.current_slide_index;
            this.currentObjectiveIndex = this.presentation.current_objective_index;
        }
        this.estimatedDuration = this.presentation.estimated_duration;
        this.setCurrentSection();
        this.setData();
        if (this.currentSlide.all_questions) {
            const all_question_ids = this.currentSlide.all_questions.map(o => o.question_id)
            const index = all_question_ids.indexOf(this.question_id);
            if (index > -1) {
                this.currentSlide.question_index = index
            }
        }
    }
    backToDashboard(){
        this.router.navigate(['/test_prep/dashboard']);
    }

    openVocabularyModal(){
        this.modalActive = true
    }


    closeModel(){
        this.modalActive = false
    }


    ngOnDestroy() {
        this.stopAudio();
        this.unsubscribeAllHttpEvents();
        this.lessonService.ClearAllEvents();
        this.clearSocketRecorderServices();
    }



}
