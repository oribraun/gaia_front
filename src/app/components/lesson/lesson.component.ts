import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {SpeechRecognitionService} from "../../services/speech-recognition/speech-recognition.service";
import {lastValueFrom} from "rxjs";
import {Presentation, PresentationSection, PresentationSlide} from "../../entities/presentation";
import {AnimationsService} from "../../services/animations/animations.service";
import {
    SocketSpeechRecognitionService
} from "../../services/socket-speech-recognition/socket-speech-recognition.service";
import {LessonService} from "../../services/lesson/lesson.service";

declare var $:any;

@Component({
    selector: 'app-lesson',
    templateUrl: './lesson.component.html',
    styleUrls: ['./lesson.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class LessonComponent implements OnInit, OnDestroy {

    @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
    @ViewChild('user', { static: false }) user!: ElementRef;

    mediaStream: any;

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
    sectionTitles = {
        greeting: 'greeting',
        reading: 'reading',
        word_repeater: 'word_repeater',
        image_generator: 'image-generator',
        agenda: 'agenda',
        ending: 'ending'
    }

    recognitionCountWords = 0;
    recognitionText = '';
    recognitionOnResultsSubscribe: any = null;
    speakInProgress = false;
    currentAudio: any = null;

    noReplayInterval: any = null
    noReplayCounter = 0;
    noReplayTriggerOn = 10; // no replay will be called every 5 seconds

    audioQue: string[] = []
    audioBlobQue: any[] = []
    enableArrayBuffer = true;
    enableNoReplayInterval = true;

    resetSpeechRecognitionTimeout: any = null;

    presentationReplayIsInProgress = false;
    presentationResetIsInProgress = false;
    presentationNoReplayIsInProgress = false;
    eventHandlingInProgress = false;

    mobileWidth = 768; // pixels
    isMobile = false;

    apiSubscriptions: any = {
        get_presentation: null,
        replay: null,
        no_replay: null,
        reset: null,
    }
    heartBeatInterval: any = null
    hearBeatCounter: number = 0;

    sr_list:string[] = []
    last_sr_ts: number = 0;
    last_speak_ts: number = 0;

    constructor(
        private apiService: ApiService,
        private animationsService: AnimationsService,
        private speechRecognitionService: SpeechRecognitionService,
        private socketSpeechRecognitionService: SocketSpeechRecognitionService,
        private lessonService: LessonService,
    ) { }

    ngOnInit(): void {
        this.triggerResize()
        // this.speechRecognitionService.setupSpeechRecognition();
        // this.setupSocketSpeechRecognition();
        // this.listenToSpeechRecognitionResults();
        // this.getPresentation();
        // this.startHeartBeat()
        this.listenForGenerateImageRequests()

        this.setupPresentationMock();
    }

    triggerResize() {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
    }

    listenToSpeechRecognitionResults() {
        this.recognitionOnResultsSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
    }

    listenForGenerateImageRequests(){
        this.lessonService.ListenFor("generateImage").subscribe((obj: any) => {
            this.getPresentationEventReplay({"source": "image_generator_button_click", "selected_words": obj.selected_words})
        })
    }

    onRecognitionResults = (results: any) => {
        this.recognitionText = results.text;
        // this.animationsService.addCircle(this.user.nativeElement, this.recognitionCountWords)
        this.recognitionCountWords++;
        if (this.recognitionText) {
            console.log('partial', this.recognitionText)
        }
        if (results.isFinal) {
            console.log('final', this.recognitionText)
            this.updateSrList(this.recognitionText)
            this.recognitionCountWords = 0;
            // console.log("End speech recognition", this.recognitionText)
            // if (this.recognitionText) {
            // this.stopSpeechRecognition();
            // this.getPresentationReplay();
            // } else {
            //         // this.stopSpeechRecognition();
            //         // this.startSpeechRecognition();
            // }
        }
        // console.log('results', results)
    }

    resetRecognitionData() {
        this.recognitionText = '';
        this.recognitionCountWords = 0;
    }

    updateSrList(recognitionText: string) {
        if(this.speakInProgress) {
            console.log('updateSrList - SPEAK IN PROGRESS ABORTING Trigger')
            return
        }
        this.sr_list.push(recognitionText)
        this.last_sr_ts = Date.now()
        this.heartBeatTrigger(true)
    }

    heartBeatTrigger(reply:boolean=false){
        // Triger a standard request to the server
        // provide the following information
        // app data : slide index, cam snapshot, sr_len, last_sr, timestamp
        // response : instruction for the client how to proceed (i.e change slide, play audio ...)
        console.log('heartBeatTrigger', this.sr_list)
        if(reply){
            this.getPresentationReplay();
        } else {
            if (!this.speakInProgress){
                this.getPresentationNoReplay('heartbeat')
            }
        }
    }

    heartBeatSequence(x:number=3){
        // increase the counter
        this.hearBeatCounter++;
        // make sure SR is active (if not actively playing sound)
        this.activateSR()
        // trigger a request to the server every x seconds
        if (this.hearBeatCounter%x == 0){
            this.heartBeatTrigger()
        }
    }

    activateSR(){
        // Only enable when speak is not in progress
        console.log('speakInProgress', this.speakInProgress)
        console.log('ASR_recognizing', this.speechRecognitionService.ASR_recognizing)

        if ((!this.speakInProgress) && (!this.speechRecognitionService.ASR_recognizing)){
            // make sure the service is off before starting it again
            try{
                this.startSpeechRecognition();
                console.log('Starting SR')

            }
            catch (error) {
                //line of code to stop the speech recognition
                console.log('SR is already on')
            }
        }
    }

    startHeartBeat(){
        this.heartBeatInterval =  setInterval(() => {
            this.heartBeatSequence()
        }, 5*1000)
    }

    stopHeartBeat(){
        clearInterval(this.heartBeatInterval)
    }


    startVideo() {
        try {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
                // Display the stream in the video element
                this.mediaStream = mediaStream;
            })
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    }

    async getPresentation() {
        this.gettingPresentation = true;
        this.apiSubscriptions.get_presentation = this.apiService.getPresentation({
            "type": "messi",
        }).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getPresentation err', response)
                } else {
                    this.presentation = new Presentation(response.presentation);
                    console.log('this.presentation ', this.presentation )
                    this.currentSectionIndex = this.presentation.current_section_index;
                    this.currentSlideIndex = this.presentation.current_slide_index;
                    this.currentObjectiveIndex = this.presentation.current_objective_index;
                    this.estimatedDuration = this.presentation.estimated_duration;
                    this.setCurrentSection();
                    this.getPresentationReplay('hi');
                }
                this.gettingPresentation = false;
            },
            error: (error) => {
                console.log('getPresentation error', error)
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
        this.recognitionText = ''
        if (index > -1) {
            this.currentSlide = new PresentationSlide(this.currentSection.slides[index]);
        } else {
            this.currentSlide = new PresentationSlide(this.currentSection.slides[this.currentSlideIndex]);
        }
    }
    setCurrentObjective(index: number = -1) {
        if (index > -1) {
            this.currentObjective = this.currentSlide.slide_objectives[index];
        } else {
            this.currentObjective = this.currentSlide.slide_objectives[this.currentObjectiveIndex];
        }
    }

    async getPresentationEventReplay(data:any={}) {
        if (this.eventHandlingInProgress) {
            return;
        }

        this.eventHandlingInProgress = true;
        this.apiSubscriptions.replay = this.apiService.getPresentationReplay({
            app_data: {
                type:'event',
                data: data,
                array_buffer: this.enableArrayBuffer
            }
        }).subscribe({
            next: (response: any) => {
                this.eventHandlingInProgress = false;

                if (response.err) {
                    console.log('response err', response)
                    // setTimeout(() => {
                    //     this.startSpeechRecognition();
                    // },2000)
                    this.handleOnReplayError()
                } else {
                    this.currentData = response.data;
                    this.handleOnPresentationReplay();
                }
            },
            error: (error) => {
                console.log('getPresentationEventReplay error', error)
                this.eventHandlingInProgress = false;
            },
        })
    }

    async getPresentationReplay(text: string = '') {
        if (this.presentationNoReplayIsInProgress) {
            return;
        }
        let message = this.recognitionText
        if (text) {
            message = text;
        }
        this.presentationReplayIsInProgress = true;
        this.apiSubscriptions.replay = this.apiService.getPresentationReplay({
            app_data: {
                type:'student_reply',
                student_text: message,
                array_buffer: this.enableArrayBuffer
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationReplayIsInProgress = false;

                if (response.err) {
                    console.log('response err', response)
                    // setTimeout(() => {
                    //     this.startSpeechRecognition();
                    // },2000)
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

    async getPresentationNoReplay(reason: string = '') {
        if (this.presentationReplayIsInProgress) {
            return;
        }
        this.presentationNoReplayIsInProgress = true;
        this.apiSubscriptions.no_replay = this.apiService.getPresentationNoReplay({
            app_data: {
                type: reason,
                last_sr: this.sr_list.length ? this.sr_list[this.sr_list.length - 1] : '',
                last_sr_ts:this.last_sr_ts,
                last_speak_ts:this.last_speak_ts,
                n_seconds_from_last_sr: Math.floor((Date.now() - this.last_sr_ts) / 1000),
                n_seconds_from_last_speak: Math.floor((Date.now() - this.last_speak_ts) / 1000),
                array_buffer: this.enableArrayBuffer
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationNoReplayIsInProgress = false;

                if (response.err) {
                    console.log('response err', response)
                    // setTimeout(() => {
                    //     this.startSpeechRecognition();
                    // },2000)
                    this.handleOnReplayError()
                } else {
                    if (response.data.type == 'heartbeat'){
                        console.log('HEARTBEAT RESP', response.data)
                        this.currentData = response.data;
                        this.handleOnPresentationReplay();
                    } else {
                        this.currentData = response.data;
                        this.handleOnPresentationReplay();
                    }
                }
            },
            error: (error) => {
                this.presentationNoReplayIsInProgress = false;
                console.log('getPresentationNoReplay error', error)
            },
        })
    }


    onResetPresentation(response: any) {
        this.presentationResetIsInProgress = false;

        if (response.err) {
            console.log('response err', response)
            this.handleOnReplayError();
        } else {
            console.log('response', response)
            this.unsubscribeAllHttpEvents();
            this.stopAudio();
            this.currentSectionIndex = 0;
            this.currentSlideIndex = 0;
            this.currentObjectiveIndex = 0;
            this.setCurrentSection();
            this.getPresentationNoReplay('new_slide');
        }
    }

    onResultsContinuesRecording(obj: any) {
        console.log('obj', obj)
        this.apiSubscriptions.replay = this.apiService.audioToText({
            app_data: {
                audio_chunks: obj['audio_chunks'],
            }
        }).subscribe({
            next: (response: any) => {
                console.log('onResultsContinuesRecording response', response)
            },
            error: (error) => {
                console.log('onResultsContinuesRecording error', error)
            },
        })

    }

    onSwipeLeft() {
        const ele = $('#lessonCarousel')
        if (ele && ele.carousel) {
            ele.carousel('next')
        }
    }
    onSwipeRight() {
        const ele = $('#lessonCarousel')
        if (ele && ele.carousel) {
            ele.carousel('prev')
        }
    }

    handleOnReplayError() {
        if (!this.presentationReplayIsInProgress
            && !this.presentationNoReplayIsInProgress
            && !this.presentationResetIsInProgress) {
            this.speakInProgress = false;
            this.resetSpeechRecognition();
            // this.resetIntervalNoReplay();
            // this.stopIntervalNoReplay();
            // this.startIntervalNoReplay()
        }
    }

    resetSpeechRecognition() {
        this.stopSpeechRecognition()
        this.last_speak_ts = Date.now()
        clearTimeout(this.resetSpeechRecognitionTimeout);
        this.resetSpeechRecognitionTimeout = setTimeout(() => {
            this.startSpeechRecognition()
        }, 500)
    }

    startSpeechRecognition() {
        console.log('startSpeechRecognition');
        this.speechRecognitionService.startListening();
    }

    stopSpeechRecognition() {
        console.log('stopSpeechRecognition');
        this.speechRecognitionService.abortListening();
    }

    playUsingAudio() {
        return new Promise((resolve, reject) => {
            if (this.audioQue.length) {
                const src_url: any = this.audioQue.shift();
                console.log('playUsingAudio src_url', src_url)
                this.speakInProgress = true;
                const loop = (src_url: string) => {
                    this.currentAudio = new Audio();
                    this.currentAudio.src = src_url;
                    this.currentAudio.load();
                    this.currentAudio.play();
                    let count = 0;
                    let lastLoggedTime = 0;
                    this.animationsService.triggerAddingCircle(count);
                    count++;
                    this.currentAudio.addEventListener('timeupdate', () => {
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
                    });
                    this.currentAudio.addEventListener('ended', (e: any) => {
                        // const handled_module_type = this.handleWhiteBoardModuleType();
                        // if (!handled_module_type) {
                        const src_url: any = this.audioQue.shift();
                        console.log('playUsingAudio ended src_url', src_url)
                        if (src_url) {
                            loop(src_url)
                        } else {
                            setTimeout(() => {
                                console.log('Reseting ASR')
                                this.speakInProgress = false;
                                this.resetSpeechRecognition();
                            }, 200)
                            resolve(true)
                        }
                        // }
                    })
                }
                loop(src_url);
            } else {
                reject('no audio in que');
            }
        })
    }


    playUsingBlob() {
        return new Promise((resolve, reject) => {
            if (this.audioBlobQue.length) {
                const arrayBuffer: any = this.audioBlobQue.shift();
                console.log('playUsingBlob arrayBuffer')
                this.speakInProgress = true;
                const loop = (blob: any) => {
                    const audioBlob = new Blob([arrayBuffer], {type: 'audio/mpeg'});
                    this.currentAudio = new Audio();
                    this.currentAudio.src = URL.createObjectURL(audioBlob);
                    this.currentAudio.load();
                    this.currentAudio.play();
                    let count = 0;
                    let lastLoggedTime = 0;
                    this.animationsService.triggerAddingCircle(count);
                    count++;
                    this.currentAudio.addEventListener('timeupdate', () => {
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
                    });
                    this.currentAudio.addEventListener('ended', (e: any) => {
                        const arrayBuffer: any = this.audioBlobQue.shift();
                        console.log('playUsingBlob ended arrayBuffer')
                        if (arrayBuffer) {
                            loop(arrayBuffer)
                        } else {
                            setTimeout(() => {
                                console.log('Reseting ASR')
                                this.speakInProgress = false;
                                this.resetSpeechRecognition();
                            }, 200)
                            // this.resetSpeechRecognition();
                            resolve(true);
                        }
                    })
                }
                loop(arrayBuffer);
            }
        });
    }


    async handleOnPresentationReplay(reason: string = '') {
        const data = this.currentData
        const additional_instructions =data.additional_instructions;
        const presentation_index_updated = data.presentation_index_updated;
        const presentation_slide_updated = data.presentation_slide_updated;
        const presentation_content_updated = data.presentation_content_updated;
        const presentation_done = data.presentation_done;
        const text = data.text;
        const help_sound_url = data.help_sound_url;
        const help_sound_buffer = data.help_sound_buffer;
        console.log('presentation_slide_updated',presentation_slide_updated)
        console.log('presentation_index_updated',presentation_index_updated)
        console.log('reason',reason)
        console.log('data',data)

        if (additional_instructions) {
            const data = {'type': 'additional_instructions', 'data': additional_instructions}
            this.lessonService.Broadcast("generateImagePath", data)
        }


        if (help_sound_url) {
            console.log('help_sound_url added to que', help_sound_url)
            this.audioQue.push(help_sound_url);
            if (!this.speakInProgress) {
                const value = await this.playUsingAudio();
            }
        }
        if (help_sound_buffer) {
            console.log('help_sound_buffer added to que')
            const arrayBuffer = this.base64ToArrayBuffer(help_sound_buffer);
            this.audioBlobQue.push(arrayBuffer);
            if (!this.speakInProgress) {
                console.log('this.audioBlobQue', this.audioBlobQue.length)
                console.log('this.speakInProgress', this.speakInProgress)
                const value = await this.playUsingBlob();
            }
        }

        if (presentation_done) {
            this.unsubscribeAllHttpEvents();
            this.stopAudio();
            return;
        }
        if (presentation_index_updated) {
            this.currentSectionIndex = data.current_section_index;
            this.currentSlideIndex = data.current_slide_index;
            this.currentObjectiveIndex = data.current_objective_index;
            this.setCurrentSection();
        }

        if (presentation_content_updated) {
            // TODO request presentation from server
        }

        if (presentation_slide_updated) {
            this.getPresentationNoReplay('new_slide');
        } else {
            // this.resetSpeechRecognition();
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

    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.speakInProgress = false;
        }
    }



    unsubscribeAllHttpEvents() {
        for (let key in this.apiSubscriptions) {
            if (this.apiSubscriptions[key]) {
                this.apiSubscriptions[key].unsubscribe();
                this.apiSubscriptions[key] = null;
            }
        }
    }


    setRandomCircleAnimation() {
        const ele = this.user.nativeElement;
        let count = 0;
        if (ele) {
            setInterval(() => {
                const delay = this.animationsService.randomIntFromInterval(0, 1)
                setTimeout(() => {
                    this.animationsService.triggerAddingCircle(count)
                    count++;
                    if (count > 10) {
                        count = 0;
                    }
                },delay * 1000)
            },800)
            this.animationsService.triggerAddingCircle(count)
            count++;
        }
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
                this.socketSpeechRecognitionService.connect()
                this.socketSpeechRecognitionService.onConnect.subscribe((msg) => {
                    console.log('onConnect msg', msg)
                    this.socketSpeechRecognitionService.sendMessage('hello', {'test': 'hi'})
                    this.socketSpeechRecognitionService.setupContinuesRecordAudio(mediaStream)
                })
                this.socketSpeechRecognitionService.ListenFor('got-audio-data').subscribe((data) => {
                    console.log('socketSpeechRecognitionService got-audio-data', data)
                    if ( data.is_final) {
                        this.onRecognitionResults({text: data.transcript})
                    }
                })
                this.socketSpeechRecognitionService.ListenFor('hello-back').subscribe((data) => {
                    console.log('socketSpeechRecognitionService hello-back', data)
                })
            })
        } else {
            console.error('Webcam access not supported');
        }
    }

    ngOnDestroy() {
        if (this.recognitionOnResultsSubscribe) {
            this.recognitionOnResultsSubscribe.unsubscribe(this.onRecognitionResults);
        }
        console.log('this.currentAudi', this.currentAudio);
        this.stopAudio();
        this.stopSpeechRecognition();
        this.unsubscribeAllHttpEvents();
        this.stopHeartBeat()
        this.lessonService.ClearAllEvents();
        // this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

    setupPresentationMock() {
        const presentation = {
            "sections": [
                {
                    "section_title": "Introduction",
                    "section_topic": "get to know each other and what we will do today",
                    "slides": [
                        {
                            "slide_title": "",
                            "slide_visual_description": "a slide with a teacher image and a text box with the teacher name and the topic of the lesson",
                            "remarks": "",
                            "n_failures_allowed": 3,
                            "slide_type": "image-generator",
                            "slide_objectives": [
                                "say hi and introduce yourself as the english teacher",
                                "say the topic of the lesson"
                            ],
                            "full_screen": false,
                            "word_list": ['dog', 'cat'],
                            "estimated_duration": 90,
                            "native_language_text": {
                                "he": "שלום! שמי ג׳ני "
                            },
                            "starting_responses": [
                                {
                                    "teacher_text": "Hi! My name is Jenny and I'm your English teacher. How are you today? MAA SHLOMECHAA?",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "Hello dear. SHALOM! You are so cute. I'm happy to be here. My name is Jenny and I will be your english teacher today. Are you excited?",
                                    "is_mission_accomplished": true
                                },
                                {
                                    "teacher_text": "SHALOM SHALOM! I'm Jenny. I'm your english teacher. What is your name?",
                                    "is_mission_accomplished": true
                                }
                            ],
                            "student_responses": [],
                            "teacher_name": "Jenny",
                            "teacher_name_native": "ג׳ני",
                            "teacher_image_path": "https://t3.ftcdn.net/jpg/00/63/41/20/360_F_63412065_tVAWzIWl9wE7l73MWUVieyGg1QlzhQCR.jpg",
                            "text": "Hello. I'm Jenny.\n\n                        Today's lesson:  Colors and Animals for beginners."
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
        }

        this.presentation = new Presentation(presentation);
        console.log('this.presentation ', this.presentation )
        this.currentSectionIndex = this.presentation.current_section_index;
        this.currentSlideIndex = this.presentation.current_slide_index;
        this.currentObjectiveIndex = this.presentation.current_objective_index;
        this.estimatedDuration = this.presentation.estimated_duration;
        this.setCurrentSection();
    }
}
