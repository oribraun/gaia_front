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

    constructor(
        private apiService: ApiService,
        private animationsService: AnimationsService,
        private speechRecognitionService: SpeechRecognitionService
    ) { }

    ngOnInit(): void {
        this.triggerResize()
        this.speechRecognitionService.setupSpeechRecognition();
        this.listenToSpeechRecognitionResults();
        this.getPresentation();
        this.startHeartBeat()
        this.stopHeartBeat()
    }

    triggerResize() {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
    }

    listenToSpeechRecognitionResults() {
        this.recognitionOnResultsSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
    }

    onRecognitionResults = (results: any) => {
        this.recognitionText = results.text;
        // this.animationsService.addCircle(this.user.nativeElement, this.recognitionCountWords)
        this.recognitionCountWords++;
        if (this.recognitionText) {
            this.resetIntervalNoReplay();
            this.stopIntervalNoReplay();
        }
        if (results.isFinal) {
            this.recognitionCountWords = 0;
            console.log("End speech recognition", this.recognitionText)
            if (this.recognitionText) {
                this.stopSpeechRecognition();
                this.getPresentationReplay();
            } else {
                //         // this.stopSpeechRecognition();
                //         // this.startSpeechRecognition();
            }
        }
        // console.log('results', results)
    }

    resetRecognitionData() {
        this.recognitionText = '';
        this.recognitionCountWords = 0;
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
                    this.currentData = response.data;
                    this.handleOnPresentationReplay();
                }
            },
            error: (error) => {
                console.log('getPresentationNoReplay error', error)
            },
        })
    }

    async resetPresentation(reason: string = '') {
        if (this.presentationResetIsInProgress) {
            return;
        }
        this.presentationResetIsInProgress = true;
        this.apiSubscriptions.reset = this.apiService.resetPresentation({
            app_data: {
                type: reason,
                array_buffer: this.enableArrayBuffer
            }
        }).subscribe({
            next: (response: any) => {
                this.onResetPresentation(response)
            },
            error: (error) => {
                console.log('resetPresentation error', error)
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
            this.resetIntervalNoReplay();
            this.stopIntervalNoReplay();
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
        clearTimeout(this.resetSpeechRecognitionTimeout);
        this.resetSpeechRecognitionTimeout = setTimeout(() => {
            this.startSpeechRecognition()
        }, 100)
    }

    startSpeechRecognition() {
        console.log('startSpeechRecognition');
        this.speechRecognitionService.startListening();
        if (this.enableNoReplayInterval) {
            this.resetIntervalNoReplay();
            this.stopIntervalNoReplay();
            this.startIntervalNoReplay();
        }
    }

    stopSpeechRecognition() {
        console.log('stopSpeechRecognition');
        this.speechRecognitionService.abortListening();
        if (this.enableNoReplayInterval) {
            this.resetIntervalNoReplay();
            this.stopIntervalNoReplay();
        }
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
                            this.speakInProgress = false;
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
                            this.speakInProgress = false;
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
            this.resetIntervalNoReplay();
            this.stopIntervalNoReplay();
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
            if (this.enableNoReplayInterval &&
                !this.speakInProgress &&
                !this.presentationReplayIsInProgress &&
                ! this.presentationNoReplayIsInProgress) {
                this.resetIntervalNoReplay();
                this.stopIntervalNoReplay();
                this.startIntervalNoReplay();
            }
            this.resetSpeechRecognition();
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

    ngOnDestroy() {
        if (this.recognitionOnResultsSubscribe) {
            this.recognitionOnResultsSubscribe.unsubscribe(this.onRecognitionResults);
        }
        console.log('this.currentAudi', this.currentAudio);
        this.stopAudio();
        if (this.enableNoReplayInterval) {
            this.resetIntervalNoReplay()
            this.stopIntervalNoReplay()
        }
        this.stopSpeechRecognition();
        this.unsubscribeAllHttpEvents();
        this.stopHeartBeat()
        // this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

    unsubscribeAllHttpEvents() {
        for (let key in this.apiSubscriptions) {
            if (this.apiSubscriptions[key]) {
                this.apiSubscriptions[key].unsubscribe();
                this.apiSubscriptions[key] = null;
            }
        }
    }

    startHeartBeat(){
        this.heartBeatInterval =  setInterval(() => {
            console.log('heartBeatCounter', this.hearBeatCounter)
            this.hearBeatCounter++;
        }, 1000)
    }

    stopHeartBeat(){
        clearInterval(this.heartBeatInterval)
    }

    startIntervalNoReplay() {
        this.noReplayInterval = setInterval(() => {
            console.log('this.noReplayCounter', this.noReplayCounter)
            this.noReplayCounter++;
            if (this.noReplayCounter === this.noReplayTriggerOn) {
                this.noReplayCounter = 0;
                this.resetIntervalNoReplay();
                this.stopIntervalNoReplay();
                this.getPresentationNoReplay('no_audio')
            }
        }, 1000)
    }

    stopIntervalNoReplay() {
        if (this.noReplayInterval) {
            console.log('clearInterval stopIntervalNoReplay')
            clearInterval(this.noReplayInterval)
        }
    }

    resetIntervalNoReplay() {
        console.log('resetIntervalNoReplay 0')

        this.noReplayCounter = 0;
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
}