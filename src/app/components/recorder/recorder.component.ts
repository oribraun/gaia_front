import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {AudioRecordingService} from "../../services/audio-recorder/audio-recording.service";
import { webSocket } from 'rxjs/webSocket';
import {ApiService} from "../../services/api.service";
import {fromEvent, lastValueFrom} from "rxjs";
import { DOCUMENT } from '@angular/common';
import {SpeechRecognitionService} from "../../services/speech-recognition/speech-recognition.service";
import {HttpEventType} from "@angular/common/http";

declare var $: any;
declare var webkitSpeechRecognition: any;
@Component({
    selector: 'app-recorder',
    templateUrl: './recorder.component.html',
    styleUrls: ['./recorder.component.less']
})
export class RecorderComponent implements OnInit, OnDestroy {

    @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
    @ViewChild('user', { static: true }) user!: ElementRef;

    speech = 'speechSynthesis' // speechSynthesis, audio
    audioChunks: Uint8Array[] = [];
    lessons: any = {
        "lesson_parts": [
            {
                "id": 1,
                "native_lang": "he",
                "text": "אוצר מילים",
                "desc": "בשיעור זה נלמד מילים פשוטות באנגלית",
                "placeholder_image": "",
                "vocab": "",
                "duration": "3:01",
                "white_board_pages": [
                    {
                        'item_id':0,
                        'next_item_id':1,
                        'module_type': 'displayer',
                        'image': 'url',
                        'text': 'Apple',
                        'text_native': 'תפוח',
                        'help_native': 'תפוח באנגלית זה apple',
                        'instructions': ['apple', 'apple', 'apple'],
                        'delay': '1',
                        'help_sound_url': 'url',
                        'section_ended': false
                    },
                    {
                        'item_id':1,
                        'next_item_id':2,
                        'module_type': 'repeater',
                        'image': 'url',
                        'text': 'Apple',
                        'text_native': 'תפוח',
                        'help_native': 'אתה צריך לומר מה אתה רואה',
                        'instructions': ['what do you see ?', 'I see an apple', 'now you - what do you see ?'],
                        'delay': '1',
                        'help_sound_url': 'url',
                        'section_ended': false
                    },
                    {
                        'item_id':2,
                        'next_item_id':3,
                        'module_type': 'typewriter',
                        'image': 'url',
                        'text': 'Apple',
                        'text_native': 'תפוח',
                        'help_native': 'אתה צריך לכתוב מה אתה רואה',
                        'instructions': ['Type the word APPLE'],
                        'delay':0,
                        'help_sound_url': 'url',
                        'section_ended': false
                    }
                ]
            },
            {
                "id": 2,
                "text": "text 2",
                "desc": "desc 2",
                "placeholder_image": "",
                "vocab": "",
                "duration": "3:01",
                "white_board_pages": [
                    {
                        'item_id':0,
                        'next_item_id':1,
                        'module_type': 'conversation',
                        'image': '',
                        'text': 'Introduction',
                        'text_native': 'הוראות',
                        'help_native': '',
                        'instructions': ['Hi, my name is Nehama and I am your teacher for today, how are you today?'],
                        'delay':0,
                        'help_sound_url': 'url',
                        'section_ended': false,
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_item_id": "1"},
                            "b": {"next_item_id": "2"}
                        }
                    },
                    {
                        'item_id':0,
                        'next_item_id':1,
                        'module_type': 'conversation',
                        'image': '',
                        'text': 'Introduction',
                        'text_native': 'הוראות',
                        'help_native': '',
                        'instructions': ['Hi, my name is Nehama and I am your teacher for today, how are you today?'],
                        'delay':0,
                        'help_sound_url': 'url',
                        'section_ended': false,
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_item_id": "1"},
                            "b": {"next_item_id": "2"}
                        }
                    },
                ]
            }
        ]
    }
    presentation: any = null;
    currentSectionIndex: number = -1;
    currentSlideIndex: number = -1;
    currentObjectiveIndex: number = -1;
    estimatedDuration: number = -1;
    currentSection: any = null;
    currentSlide: any = null;
    currentObjective: any = null;
    currentData: any = null;
    sectionTitles = {
        greeting: 'greeting',
        reading: 'reading',
        word_repeater: 'word_repeater',
        agenda: 'agenda',
        ending: 'ending'
    }
    answer: string = '';
    recognitionCountWords = 0;
    recognitionText = '';

    speakInProgress = false;

    private socket!: WebSocket;
    private audioStreamSubscription: any;

    isRecording = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        // private audioRecordingService: AudioRecordingService,
        private apiService: ApiService,
        private renderer: Renderer2,
        private speechRecognitionService: SpeechRecognitionService
    ) {
        this.lessons = null;
        // this.socket = new WebSocket('ws://127.0.0.1:8000/ws/audio-upload/');
        // this.socket.onopen = () => {
        //     console.log('WebSocket connection established.')
        // };
        // this.socket.onerror = (err: any) => {
        //     console.log('WebSocket err', err)
        // }
    }

    ngOnInit(): void {
        this.speechRecognitionService.setupSpeechRecognition();
        this.listenToSpeechRecognitionResults();
        this.startVideo()
        // this.getLessons();
        this.getPresentation();
        // this.setCurrentLesson();
        // this.setRandomCircleAnimation()
    }

    listenToSpeechRecognitionResults() {
        this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
    }

    onRecognitionResults = (results: any) => {
        this.recognitionText = results.text;
        this.addCircle(this.user.nativeElement, this.recognitionCountWords)
        this.recognitionCountWords++;
        if (results.isFinal) {
            this.answer = this.recognitionText;
            console.log("End speech recognition", this.answer)
            if (this.answer) {
                this.stopSpeechRecognition();
                this.recognitionText = '';
                this.recognitionCountWords = 0;
                this.getPresentationReplay();
            } else {
                // this.stopSpeechRecognition();
                // this.startSpeechRecognition();
            }
        }
        console.log('results', results)
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

    startSpeechRecognition() {
        this.speechRecognitionService.startListening()
    }

    stopSpeechRecognition() {
        this.speechRecognitionService.stopListening()
    }

    textToVoice(text: string, startRecognition=true) {
        this.speakInProgress = true;
        // Create a new SpeechSynthesisUtterance object
        let utterance = new SpeechSynthesisUtterance();

        // Set the text and voice of the utterance
        // console.log('text', text)
        // console.log('window.speechSynthesis.getVoices()', window.speechSynthesis.getVoices())
        const voices = window.speechSynthesis.getVoices();
        const names = voices.map((o) => o.name);
        const langs = voices.map((o) => o.lang);
        // console.log('names', names)
        // console.log('langs', langs)
        utterance.text = text;
        utterance.voice = window.speechSynthesis.getVoices()[0];
        fromEvent(utterance, 'end').subscribe((event) => {
            this.onEndTextToVoice(startRecognition);
        })
        // Speak the utterance
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance);
    }

    onEndTextToVoice(startRecognition: boolean) {
        // if (this.currentInstructions && this.currentInstructions.length) {
        //     const delay_s = this.whiteBoardPage.delay * 1000;
        //     setTimeout(() => {
        //         const t: any = this.currentInstructions.shift();
        //         this.textToVoice(t);
        //     }, delay_s)
        // } else {
        //     const handled_module_type = this.handleWhiteBoardModuleType();
        //     if (!handled_module_type) {
                this.speakInProgress = false;
                this.stopSpeechRecognition()
                if (startRecognition) {
                    // if (this.whiteBoardPage.module_type != 'typewriter') {
                        this.startSpeechRecognition()
                    // }
                }
            // }
        // }
    }

    setRandomCircleAnimation() {
        const ele = this.user.nativeElement;
        let count = 0;
        if (ele) {
            // this.addCircle(ele, count)
            // count++;
            setInterval(() => {
                const delay = this.randomIntFromInterval(0, 3)
                setTimeout(() => {
                    this.addCircle(ele, count)
                    count++;
                    if (count > 10) {
                        count = 0;
                    }
                },delay * 1000)
            },800)
        }
    }

    addCircle(elm: any, unique_num: number) {
        if (elm) {
            var randomColor = Math.floor(Math.random()*16777215).toString(16);
            const child = this.document.createElement('div');
            // const transformSpeed = this.randomIntFromInterval(1, 1.5)
            const transformSpeed = 1.5;
            child.id = "circle-animation-" + unique_num
            child.style.position = "absolute";
            child.style.top = "0";
            child.style.right = "0";
            child.style.bottom = "0";
            child.style.left = "0";
            child.style.opacity = "0";
            child.style.zIndex = "-1";
            child.style.borderRadius = "100%";
            child.style.border = "1px solid " + "#" + randomColor;
            child.style.transform = "scale(.9)";
            child.style.transition = `transform ${transformSpeed}s ease-in-out, opacity ${transformSpeed}s ease-in-out`;
            elm.appendChild(child);
            this.animateAndRemoveCircle(child.id, transformSpeed)
        }
    }

    animateAndRemoveCircle(id: string, transformSpeed: number) {
        setTimeout(() => {
            const e = document.getElementById(id);
            if (e) {
                const scale = this.randomIntFromInterval(1.4, 1.8)
                e.style.transform = `scale(${scale})`;
                e.style.opacity = "1";
                setTimeout(() => {
                    e.style.transition = `transform ${transformSpeed}s ease-in-out, opacity ${transformSpeed/1.5}s ease-in-out`;
                    e.style.opacity = "0";
                }, transformSpeed/1.5 * 1000)
                setTimeout(() => {
                    setTimeout(() => {
                        e.remove();
                    }, 600);
                }, transformSpeed * 1000)
            }
        },50);
    }

    randomIntFromInterval(min: number, max: number) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    async getPresentation() {
        const response: any = await lastValueFrom(this.apiService.getPresentation({
            "type": "messi",
        }))

        if (response.err) {
            console.log('response err', response)
        } else {
            this.presentation = response.presentation;
            this.currentSectionIndex = this.presentation.current_section_index;
            this.currentSlideIndex = this.presentation.current_slide_index;
            this.currentObjectiveIndex = this.presentation.current_objective_index;
            this.estimatedDuration = this.presentation.estimated_duration;
            this.setCurrentSection();
            this.getPresentationReplay('hi');
        }
    }

    setCurrentSection(index: number = -1) {
        if (index > -1) {
            this.currentSection = this.presentation.sections[index];
        } else {
            this.currentSection = this.presentation.sections[this.currentSectionIndex];
        }
        this.setCurrentSlide();
        this.setCurrentObjective();
    }

    setCurrentSlide(index: number = -1) {
        if (index > -1) {
            this.currentSlide = this.currentSection.slides[index];
        } else {
            this.currentSlide = this.currentSection.slides[this.currentSlideIndex];
        }
    }
    setCurrentObjective(index: number = -1) {
        if (index > -1) {
            this.currentObjective = this.currentSlide.slide_objectives[index];
        } else {
            this.currentObjective = this.currentSlide.slide_objectives[this.currentObjectiveIndex];
        }
    }

    playUsingSpeechSynthesis(text: string) {
        if (window.speechSynthesis.getVoices().length) {
            this.textToVoice(text);
        } else {
            fromEvent(speechSynthesis, 'voiceschanged').subscribe((event) => {
                this.speakInProgress = true;
                this.textToVoice(text);
            })
        }
    }

    playUsingAudio(src_url: string) {
        return new Promise((resolve, reject) => {
            console.log('playing audion', src_url)
            const audio = new Audio();
            audio.src = src_url;
            audio.load();
            audio.play();
            audio.addEventListener('ended', (e) => {
                // const handled_module_type = this.handleWhiteBoardModuleType();
                // if (!handled_module_type) {
                console.log('playUsingAudio ended')
                this.speakInProgress = false;
                this.stopSpeechRecognition()
                this.startSpeechRecognition()
                resolve(true)
                // }
            })
        })
    }

    // async sendAnswerStream() {
    //     const answer = this.answer
    //     const obj: any = {
    //         "lesson_id": this.currentLesson.id,
    //         "white_board_item_id": this.whiteBoardPage.item_id,
    //         "module_type": this.whiteBoardPage.module_type,
    //         "help_native": this.whiteBoardPage.help_native,
    //         "instructions": this.whiteBoardPage.instructions,
    //         "repeat_value": this.whiteBoardPage.repeat_value,
    //         "repeat_failed": this.whiteBoardPage.repeat_failed,
    //         "repeat_success": this.whiteBoardPage.repeat_success,
    //         "answer": answer
    //     }
    //     this.audioChunks = []
    //     this.apiService.sendAnswerStream(obj).subscribe((event: any) => {
    //         if (event.type === HttpEventType.DownloadProgress) {
    //             // Append received chunk to audioChunks and play it
    //             console.log('event', event)
    //             // const chunk = new Uint8Array(event.loaded - this.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0));
    //             // console.log('chunk', chunk)
    //             // this.audioChunks.push(chunk);
    //             // this.playAudioChunk(chunk);
    //         } else if (event.type === HttpEventType.Response) {
    //             // Audio data fully received, play the whole audio
    //             // console.log('event 1', event)
    //             const audioData = new Uint8Array(event.body);
    //             this.audioChunks.push(audioData);
    //             this.playAudio();
    //         }
    //     })
    //
    //     // if (response.err) {
    //     //     console.log('response err', response)
    //     //     // setTimeout(() => {
    //     //     //     this.startSpeechRecognition();
    //     //     // },2000)
    //     // } else {
    //     //     this.handleOnAnswer(response)
    //     //     // console.log('this.currentLesson', this.currentLesson)
    //     //     // const next_page_id = response.data.next_page_id;
    //     //     // const ids = this.currentLesson.white_board_pages.map((o: any) => o.id)
    //     //     // const index = ids.indexOf(next_page_id);
    //     //     // if (index > -1) {
    //     //     //     this.whiteBoardPage = this.currentLesson.white_board_pages[index];
    //     //     // }
    //     //     // console.log('response', response)
    //     // }
    // }

    async getPresentationReplay(text: string = '') {
        let message = this.answer
        if (text) {
            message = text;
        }
        const answer = this.answer
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
        } else {
            this.currentData = response.data;
            this.handleOnPresentationReplay();
        }
    }
    
    async handleOnPresentationReplay() {
        const data = this.currentData
        const presentation_index_updated = data.presentation_index_updated;
        const presentation_content_updated = data.presentation_content_updated;
        const presentation_done = data.presentation_done;
        const text = data.text;
        const help_sound_url = data.help_sound_url;
        if (help_sound_url) {
            const value = await this.playUsingAudio(help_sound_url)
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
    }

    async resetPresentation() {
        const response: any = await lastValueFrom(this.apiService.resetPresentation({}))

        if (response.err) {
            console.log('response err', response)
            // setTimeout(() => {
            //     this.startSpeechRecognition();
            // },2000)
        } else {
            this.currentSectionIndex = 0;
            this.currentSlideIndex = 0;
            this.currentObjectiveIndex = 0;
            this.setCurrentSection();
        }
    }

    playAudioChunk(chunk: Uint8Array) {
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(chunk.buffer, (audioBuffer) => {
            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioContext.destination);
            audioSource.start();

            audioSource.onended = () => {
                audioSource.disconnect();
            };
        }, (error) => {
            console.error('Error decoding audio:', error);
        });
    }

    playAudio() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mpeg' });
        const audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);
        audio.play();

        audio.onended = () => {
            this.audioChunks = [];
        };
    }

    handleOnStream(response: any) {
        const audioData = new Uint8Array(response);
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(audioData.buffer).then((decodedData) => {
            const source = audioContext.createBufferSource();
            source.buffer = decodedData;
            source.connect(audioContext.destination);
            source.start();
        });
    }

    async startRecording() {
        this.isRecording = true;
        // await this.audioRecordingService.startRecording();
    }

    async stopRecording() {
        this.isRecording = false;
        // const audioBlob = await this.audioRecordingService.stopRecording();
        // Send the audioBlob to the Django backend.
    }

    async startRecordingStream() {
        this.isRecording = true;
        // await this.audioRecordingService.startRecordingStream();
    }

    async stopRecordingStream() {
        this.isRecording = false;
        // const audioBlob = await this.audioRecordingService.stopRecordingStream();
        // console.log('audioBlob',audioBlob)
        // this.socket.complete(); // Close the WebSocket connection after recording is complete
    }

    ngOnDestroy() {
        // if (this.recognition) {
            this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
        // }
        // this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

}
