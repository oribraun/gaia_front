import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {AudioRecordingService} from "../../services/audio-recorder/audio-recording.service";
import { webSocket } from 'rxjs/webSocket';
import {ApiService} from "../../services/api.service";
import {lastValueFrom} from "rxjs";
import { DOCUMENT } from '@angular/common';

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

    lessons = {
        "objective": {
            "topic": "Messi Lesson",
            "vocab": "",
            "grammar": "",
        },
        "lesson_parts": [
            {
                "id": 1,
                "title": "title 1",
                "desc": "desc 1",
                "placeholder_image": "",
                "vocab": "",
                "duration": "3:01",
                "white_board_pages": [
                    {
                        "id": 0,
                        "headline": "Introduction",
                        "text": "Text",
                        "image": "",
                        "video": "",
                        "question": "do you know who messi is?",
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_page_id": "1"},
                            "b": {"next_page_id": "2"}
                        }
                    },
                    {
                        "id": 1,
                        "headline": "Introduction 1",
                        "text": "Text 1",
                        "image": "",
                        "video": "",
                        "question": "do you know who messi is?",
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_page_id": "1"},
                            "b": {"next_page_id": "2"}
                        }
                    },
                    {
                        "id": 2,
                        "headline": "Introduction 2",
                        "text": "Text 2",
                        "image": "",
                        "video": "",
                        "question": "do you know who messi is?",
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_page_id": "1"},
                            "b": {"next_page_id": "2"}
                        }
                    }
                ]
            },
            {
                "id": 2,
                "title": "title 2",
                "desc": "desc 2",
                "placeholder_image": "",
                "vocab": "",
                "duration": "3:02",
                "white_board_pages": [
                    {
                        "id": 0,
                        "headline": "Introduction",
                        "text": "Text",
                        "image": "",
                        "video": "",
                        "question": "do you know who messi is?",
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_page_id": "1"},
                            "b": {"next_page_id": "2"}
                        }
                    }
                ]
            },
            {
                "id": 3,
                "title": "title 3",
                "desc": "desc 3",
                "placeholder_image": "",
                "vocab": "",
                "duration": "3:03",
                "white_board_pages": [
                    {
                        "id": 0,
                        "headline": "Introduction",
                        "text": "Text",
                        "image": "",
                        "video": "",
                        "question": "do you know who messi is?",
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_page_id": "1"},
                            "b": {"next_page_id": "2"}
                        }
                    }
                ]
            },
            {
                "id": 4,
                "title": "title 4",
                "desc": "desc 4",
                "placeholder_image": "",
                "vocab": "",
                "duration": "3:04",
                "white_board_pages": [
                    {
                        "id": 0,
                        "headline": "Introduction",
                        "text": "Text",
                        "image": "",
                        "video": "",
                        "question": "do you know who messi is?",
                        "answers_options": ["a", "b"],
                        "answers_map": {
                            "a": {"next_page_id": "1"},
                            "b": {"next_page_id": "2"}
                        }
                    }
                ]
            }
        ]
    }
    currentLessonIndex: number = -1;
    currentLesson: any = null;
    whiteBoardPage: any = null;
    answer: string = '';
    lang: string = 'en-US';
    recognition: any;

    private socket!: WebSocket;
    private audioStreamSubscription: any;

    isRecording = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private audioRecordingService: AudioRecordingService,
        private apiService: ApiService,
        private renderer: Renderer2,
    ) {
        this.socket = new WebSocket('ws://127.0.0.1:8000/ws/audio-upload/');
        this.socket.onopen = () => {
            console.log('WebSocket connection established.')
        };
        this.socket.onerror = (err: any) => {
            console.log('WebSocket err', err)
        }
    }

    ngOnInit(): void {
        this.startVideo()
        this.getLessons();
        // this.setCurrentLesson();
        // this.setRandomCircleAnimation()
        this.speechRecognition()
        // this.speechRecognitionHe()
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

    speechRecognition() {
        this.recognition =  new webkitSpeechRecognition();
        let text = '';
        let active = false;
        let tempWords: any;
        this.recognition.interimResults = true;
        this.recognition.lang = this.lang;
        let countWords = 0
        let last_text = ''
        this.recognition.addEventListener('result', (e: any) => {
            const transcript = Array.from(e.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');
            text = transcript;
            if (last_text !== text) {
                last_text = text;
                this.addCircle(this.user.nativeElement, countWords)
                countWords++;
                console.log('transcript ' + this.lang, text);
            }
        });
        this.recognition.addEventListener('end', (condition: any) => {
            if (active) {
                this.recognition.stop();
                active = false;
                countWords = 0;
                last_text = '';
                this.answer = text;
                console.log("End speech recognition EN")
                this.recognition.start();
                active = true;
            } else {
                // this.wordConcat()
                const text = tempWords + '.';
                console.log('text EN', text)
                this.recognition.start();
            }
        });
        this.recognition.start();
        active = true;
    }

    stopRecognition() {
        if (this.recognition) {
            this.recognition.lang = this.lang;
            this.recognition.stop();
        }

    }

    speechRecognitionHe() {
        const recognition =  new webkitSpeechRecognition();
        let active = false;
        let tempWords: any;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.addEventListener('result', (e: any) => {
            const transcript = Array.from(e.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');
            tempWords = transcript;
            console.log('transcript HE', transcript);
        });
        recognition.addEventListener('end', (condition: any) => {
            if (active) {
                recognition.stop();
                console.log("End speech recognition HE")
                recognition.start();
            } else {
                // this.wordConcat()
                const text = tempWords + '.';
                console.log('text HE', text)
                recognition.start();
            }
        });
        recognition.start();
        active = true;
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

// loop(c: number) {
//     const delay = this.randomIntFromInterval(0, 20)
//     console.log('delay', delay)
//     setTimeout(() => {
//         this.addCircle(ele, c)
//         c++;
//         this.loop(c)
//     }, delay * 1000)
// }

    addCircle(elm: any, unique_num: number) {
        if (elm) {
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
            child.style.border = "1px solid #000";
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
                e.style.transform = 'scale(1.8)';
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

    async getLessons() {
        const response: any = await lastValueFrom(this.apiService.getLessons({
            "type": "messi",
        }))

        if (response.err) {
            console.log('response err', response)
        } else {
            this.lessons = response.lessons;
            this.setCurrentLesson();
        }
    }

    setCurrentLesson(index: number = 0) {
        this.currentLessonIndex = index;
        this.currentLesson = this.lessons.lesson_parts[this.currentLessonIndex];
        this.whiteBoardPage = this.currentLesson.white_board_pages[0];
    }

    selectLesson(index: number) {
        if (this.currentLessonIndex !== index) {
            this.setCurrentLesson(index)
        }
    }

    async sendAnswer() {
        const answer = this.answer
        this.answer = '';
        const response: any = await lastValueFrom(this.apiService.sendAnswer({
            "lesson_id": this.currentLesson.id,
            "white_board_page_id": this.whiteBoardPage.id,
            "question": this.whiteBoardPage.question,
            "answer": answer
        }))

        if (response.err) {
            console.log('response err', response)
        } else {
            console.log('this.currentLesson', this.currentLesson)
            const next_page_id = response.data.next_page_id;
            const ids = this.currentLesson.white_board_pages.map((o: any) => o.id)
            const index = ids.indexOf(next_page_id);
            if (index > -1) {
                this.whiteBoardPage = this.currentLesson.white_board_pages[index];
            }
            console.log('response', response)
        }
    }

    async startRecording() {
        this.isRecording = true;
        await this.audioRecordingService.startRecording();
    }

    async stopRecording() {
        this.isRecording = false;
        const audioBlob = await this.audioRecordingService.stopRecording();
        // Send the audioBlob to the Django backend.
    }

    async startRecordingStream() {
        this.isRecording = true;
        await this.audioRecordingService.startRecordingStream();
    }

    async stopRecordingStream() {
        this.isRecording = false;
        const audioBlob = await this.audioRecordingService.stopRecordingStream();
        console.log('audioBlob',audioBlob)
        // this.socket.complete(); // Close the WebSocket connection after recording is complete
    }

    ngOnDestroy() {
        this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

}
