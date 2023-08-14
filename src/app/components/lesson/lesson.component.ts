import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {SpeechRecognitionService} from "../../services/speech-recognition/speech-recognition.service";
import {lastValueFrom} from "rxjs";
import {Presentation, PresentationSection, PresentationSlide} from "../../entities/presentation";
import {AnimationsService} from "../../services/animations/animations.service";

declare var webkitSpeechRecognition:any;

@Component({
    selector: 'app-lesson',
    templateUrl: './lesson.component.html',
    styleUrls: ['./lesson.component.less']
})
export class LessonComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
    @ViewChild('user', { static: true }) user!: ElementRef;
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

    noReplayInterval: any = null
    noReplayCounter = 0;
    noReplayTriggerOn = 5; // no replay will be called every 5 seconds

    audioQue: string[] = []

    constructor(
        private apiService: ApiService,
        private animationsService: AnimationsService,
        private speechRecognitionService: SpeechRecognitionService
    ) { }

    ngOnInit(): void {
        this.speechRecognitionService.setupSpeechRecognition();
        this.listenToSpeechRecognitionResults();
        this.startVideo()
        this.getPresentation();
    }

    listenToSpeechRecognitionResults() {
        this.recognitionOnResultsSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
    }

    onRecognitionResults = (results: any) => {
        this.recognitionText = results.text;
        this.animationsService.addCircle(this.user.nativeElement, this.recognitionCountWords)
        this.recognitionCountWords++;
        if (results.isFinal) {
            this.recognitionCountWords = 0;
            console.log("End speech recognition", this.recognitionText)
            if (this.recognitionText) {
        //         this.stopSpeechRecognition();
                this.getPresentationReplay();
                this.resetRecognitionData();
            } else {
        //         // this.stopSpeechRecognition();
        //         // this.startSpeechRecognition();
            }
        }
        console.log('results', results)
    }

    resetRecognitionData() {
        this.recognitionText = '';
        this.recognitionCountWords = 0;
    }

    startVideo() {
        try {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
                // Display the stream in the video element
                this.videoElement.nativeElement.srcObject = mediaStream;
            })
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    }

    async getPresentation() {
        this.gettingPresentation = true;
        const response: any = await lastValueFrom(this.apiService.getPresentation({
            "type": "messi",
        }))

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
    }
    setCurrentObjective(index: number = -1) {
        if (index > -1) {
            this.currentObjective = this.currentSlide.slide_objectives[index];
        } else {
            this.currentObjective = this.currentSlide.slide_objectives[this.currentObjectiveIndex];
        }
    }

    async getPresentationReplay(text: string = '') {
        let message = this.recognitionText
        if (text) {
            message = text;
        }
        const response: any = await lastValueFrom(this.apiService.getPresentationReplay({
            app_data: {
                type:'student_reply',
                student_text: message
            }
        }))

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
    }

    async getPresentationNoReplay(reason: string = '') {
        const response: any = await lastValueFrom(this.apiService.getPresentationNoReplay({
            app_data: {
                type: reason,
            }
        }))

        if (response.err) {
            console.log('response err', response)
            // setTimeout(() => {
            //     this.startSpeechRecognition();
            // },2000)
            this.handleOnReplayError()
        } else {
            console.log('response', response)
            // this.currentData = response.data;
            this.handleOnPresentationNoReplay(response.data);
        }
    }

    handleOnReplayError() {
        this.speakInProgress = false;
        this.resetSpeechRecognition();
    }

    resetSpeechRecognition() {
        this.stopSpeechRecognition()
        setTimeout(() => {
            this.startSpeechRecognition()
        }, 50)
    }

    startSpeechRecognition() {
        console.log('startSpeechRecognition');
        this.speechRecognitionService.startListening();
        // this.resetIntervalNoReplay();
        // this.stopIntervalNoReplay();
        // this.startIntervalNoReplay();
    }

    stopSpeechRecognition() {
        console.log('stopSpeechRecognition');
        this.speechRecognitionService.abortListening();
        // this.resetIntervalNoReplay();
        // this.stopIntervalNoReplay();
    }

    playUsingAudio() {
        return new Promise((resolve, reject) => {
            if (this.audioQue.length) {
                const src_url: any = this.audioQue.shift();
                console.log('playUsingAudio src_url', src_url)
                this.speakInProgress = true;
                const loop = (src_url: string) => {
                    const audio = new Audio();
                    audio.src = src_url;
                    audio.load();
                    audio.play();
                    audio.addEventListener('ended', (e) => {
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

    async handleOnPresentationNoReplay(data: any) {
        const presentation_index_updated = data.presentation_index_updated;
        const presentation_content_updated = data.presentation_content_updated;
        const presentation_done = data.presentation_done;
        const text = data.text;
        const help_sound_url = data.help_sound_url;
        console.log('presentation_index_updated',presentation_index_updated)
        console.log('data',data)

        if (help_sound_url) {
            console.log('help_sound_url added to que', help_sound_url)
            this.audioQue.push(help_sound_url);
            if (!this.speakInProgress) {
                const value = await this.playUsingAudio();
            }
            this.speakInProgress = false;
            this.resetSpeechRecognition();
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
        if (presentation_done) {
            // TODO show client presentation is done
        }

        // this.resetIntervalNoReplay();
        // this.stopIntervalNoReplay();
        // this.startIntervalNoReplay();
    }

    async handleOnPresentationReplay(reason: string = '') {
        const data = this.currentData
        const presentation_index_updated = data.presentation_index_updated;
        const presentation_content_updated = data.presentation_content_updated;
        const presentation_done = data.presentation_done;
        const text = data.text;
        const help_sound_url = data.help_sound_url;
        console.log('presentation_index_updated',presentation_index_updated)
        console.log('reason',reason)
        console.log('data',data)

        if (presentation_index_updated && reason !== 'new_slide') {
            this.getPresentationNoReplay('new_slide')
        }
        if (help_sound_url) {
            console.log('help_sound_url added to que', help_sound_url)
            this.audioQue.push(help_sound_url);
            if (!this.speakInProgress) {
                const value = await this.playUsingAudio();
            }
            this.speakInProgress = false;
            this.resetSpeechRecognition();
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
        if (presentation_done) {
            // TODO show client presentation is done
        }

        // this.resetIntervalNoReplay();
        // this.stopIntervalNoReplay();
        // this.startIntervalNoReplay();
    }

    ngOnDestroy() {
        if (this.recognitionOnResultsSubscribe) {
            this.recognitionOnResultsSubscribe.unsubscribe(this.onRecognitionResults);
        }
        // this.resetIntervalNoReplay()
        // this.stopIntervalNoReplay()
        // this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

    startIntervalNoReplay() {
        this.noReplayInterval = setInterval(() => {
            console.log('this.noReplayCounter', this.noReplayCounter)
            this.noReplayCounter++;
            if (this.noReplayCounter === this.noReplayTriggerOn) {
                this.noReplayCounter = 0;
                this.getPresentationNoReplay('no audio')
                this.resetIntervalNoReplay();
                this.stopIntervalNoReplay();
            }
        }, 1000)
    }

    stopIntervalNoReplay() {
        if (this.noReplayInterval) {
            clearInterval(this.noReplayInterval)
        }
    }

    resetIntervalNoReplay() {
        this.noReplayCounter = 0;
    }

    setRandomCircleAnimation() {
        const ele = this.user.nativeElement;
        let count = 0;
        if (ele) {
            setInterval(() => {
                const delay = this.animationsService.randomIntFromInterval(0, 1)
                setTimeout(() => {
                    this.animationsService.addCircle(this.user.nativeElement, count)
                    count++;
                    if (count > 10) {
                        count = 0;
                    }
                },delay * 1000)
            },800)
            this.animationsService.addCircle(this.user.nativeElement, count)
            count++;
        }
    }

}
