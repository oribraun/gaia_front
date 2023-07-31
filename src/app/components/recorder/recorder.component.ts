import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {AudioRecordingService} from "../../services/audio-recorder/audio-recording.service";
import { webSocket } from 'rxjs/webSocket';
import {ApiService} from "../../services/api.service";
import {fromEvent, lastValueFrom} from "rxjs";
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

    speech = 'speechSynthesis' // speechSynthesis, audio
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
    currentLessonIndex: number = -1;
    currentLesson: any = null;
    whiteBoardPage: any = null;
    currentInstructions = [];
    answer: string = '';
    lang: string = 'en-US';
    recognition: any;
    recognitionCountWords = 0;
    recognitionText = '';

    speakInProgress = false;

    private socket!: WebSocket;
    private audioStreamSubscription: any;

    isRecording = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private audioRecordingService: AudioRecordingService,
        private apiService: ApiService,
        private renderer: Renderer2,
    ) {
        this.lessons = null;
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
        this.setUpSpeechRecognition()
        // this.speechRecognitionHe()w
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

    setUpSpeechRecognition() {
        this.recognitionText = '';
        this.recognitionCountWords = 0;
        this.recognition =  new webkitSpeechRecognition();
        let text = '';
        let active = false;
        let tempWords: any;
        this.recognition.interimResults = true;
        this.recognition.lang = this.lang;
        let countWords = 0
        this.recognition.addEventListener('result', this.onResultRecognition);
        this.recognition.addEventListener('end', this.onEndRecognition);
    }

    startSpeechRecognition() {
        this.recognition.start();
    }

    stopSpeechRecognition() {
        this.recognition.stop();
    }

    onEndRecognition = (condition: any) => {
        if (this.speakInProgress) {
            return;
        }
        this.answer = this.recognitionText;
        console.log("End speech recognition EN", this.answer)
        if (this.answer) {
            this.stopSpeechRecognition();
            this.recognitionText = '';
            this.recognitionCountWords = 0;
            this.sendAnswer();
        } else {
            this.stopSpeechRecognition();
            this.startSpeechRecognition();
        }
    }

    onResultRecognition = (e: any) => {
        if (this.speakInProgress) {
            return;
        }
        const transcript = Array.from(e.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');
        const text = transcript;
        if (this.recognitionText !== text) {
            this.recognitionText = text;
            this.addCircle(this.user.nativeElement, this.recognitionCountWords)
            this.recognitionCountWords++;
            console.log('transcript ' + this.lang, text);
        }
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
        if (this.currentInstructions && this.currentInstructions.length) {
            const delay_s = this.whiteBoardPage.delay * 1000;
            setTimeout(() => {
                const t: any = this.currentInstructions.shift();
                this.textToVoice(t);
            }, delay_s)
        } else {
            const handled_module_type = this.handleWhiteBoardModuleType();
            if (!handled_module_type) {
                this.speakInProgress = false;
                this.stopSpeechRecognition()
                if (startRecognition) {
                    if (this.whiteBoardPage.module_type != 'typewriter') {
                        this.startSpeechRecognition()
                    }
                }
            }
        }
    }

    handleWhiteBoardModuleType() {
        if (this.whiteBoardPage.section_ended) {
            if (this.whiteBoardPage.module_type === 'displayer') {
                const next_white_board_id = this.whiteBoardPage.next_item_id;
                const map = this.currentLesson.white_board_pages.map((o: any) => o.item_id)
                const index = map.indexOf(next_white_board_id);
                if (index > -1) {
                    this.setCurrentWhiteBoard(index);
                } else {
                    // what to do when no next item id.
                }
                return true;
            }
            if (this.whiteBoardPage.module_type === 'repeater') {
                const next_white_board_id = this.whiteBoardPage.next_item_id;
                const map = this.currentLesson.white_board_pages.map((o: any) => o.item_id)
                const index = map.indexOf(next_white_board_id);
                if (index > -1) {
                    this.setCurrentWhiteBoard(index);
                } else {
                    // what to do when no next item id.
                }
                return true;
            }
        }
        return false;
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
        this.setCurrentWhiteBoard(0);
    }

    setCurrentWhiteBoard(index: number) {
        if (this.currentLesson.white_board_pages[index]) {
            this.whiteBoardPage = this.currentLesson.white_board_pages[index];
            this.currentInstructions = this.whiteBoardPage.instructions;
            if (this.currentInstructions && this.currentInstructions.length) {
                setTimeout(() => {
                    this.startSpeakInstructions()
                })
            }
        }
    }

    startSpeakInstructions() {
        const t: any = this.currentInstructions.shift();
        if (t) {
            if (this.speech === 'speechSynthesis') {
                if (window.speechSynthesis.getVoices().length) {
                    this.textToVoice(t);
                } else {
                    fromEvent(speechSynthesis, 'voiceschanged').subscribe((event) => {
                        this.speakInProgress = true;
                        this.textToVoice(t);
                    })
                }
            } else if (this.speech === 'audio') {
                const audio = new Audio();
                audio.src = this.whiteBoardPage.help_sound_url;
                audio.load();
                audio.play();
                audio.addEventListener('ended', (e) => {
                    const handled_module_type = this.handleWhiteBoardModuleType();
                    if (!handled_module_type) {
                        this.speakInProgress = false;
                        this.stopSpeechRecognition()
                        this.startSpeechRecognition()
                    }
                })
            }
        }
    }

    selectLesson(index: number) {
        if (this.currentLessonIndex !== index) {
            this.setCurrentLesson(index)
        }
    }

    async sendAnswer() {
        const answer = this.answer
        const response: any = await lastValueFrom(this.apiService.sendAnswer({
            "lesson_id": this.currentLesson.id,
            "white_board_item_id": this.whiteBoardPage.item_id,
            "module_type": this.whiteBoardPage.module_type,
            "help_native": this.whiteBoardPage.help_native,
            "instructions": this.whiteBoardPage.instructions,
            "repeat_value": this.whiteBoardPage.repeat_value,
            "repeat_failed": this.whiteBoardPage.repeat_failed,
            "repeat_success": this.whiteBoardPage.repeat_success,
            "answer": answer
        }))

        if (response.err) {
            console.log('response err', response)
            // setTimeout(() => {
            //     this.startSpeechRecognition();
            // },2000)
        } else {
            this.handleOnAnswer(response)
            // console.log('this.currentLesson', this.currentLesson)
            // const next_page_id = response.data.next_page_id;
            // const ids = this.currentLesson.white_board_pages.map((o: any) => o.id)
            // const index = ids.indexOf(next_page_id);
            // if (index > -1) {
            //     this.whiteBoardPage = this.currentLesson.white_board_pages[index];
            // }
            // console.log('response', response)
        }
    }

    handleOnAnswer(response: any) {
        if (this.whiteBoardPage.module_type == 'conversation') {
            this.whiteBoardPage.section_ended = response.data.section_ended;
            const text = response.data.text;
            this.answer = '';
            this.whiteBoardPage.display_text = text;
            this.textToVoice(text, !this.whiteBoardPage.section_ended);
            if (this.whiteBoardPage.section_ended) {
                console.log('this.whiteBoardPage.section_ended', this.whiteBoardPage.section_ended)
            }
        }
        if (this.whiteBoardPage.module_type == 'repeater') {
            this.whiteBoardPage.section_ended = response.data.section_ended;
            this.answer = '';
            if (this.whiteBoardPage.section_ended) {
                const text = response.data.text;
                this.textToVoice(text, !this.whiteBoardPage.section_ended);
                if (this.whiteBoardPage.section_ended) {
                    console.log('this.whiteBoardPage.section_ended', this.whiteBoardPage.section_ended)
                }
            } else {
                const text = response.data.text;
                this.textToVoice(text, !this.whiteBoardPage.section_ended);
            }
        }
        if (this.whiteBoardPage.module_type == 'typewriter') {
            this.whiteBoardPage.section_ended = response.data.section_ended;
            this.answer = '';
            if (this.whiteBoardPage.section_ended) {
                const text = response.data.text;
                this.textToVoice(text, !this.whiteBoardPage.section_ended);
                if (this.whiteBoardPage.section_ended) {
                    console.log('this.whiteBoardPage.section_ended', this.whiteBoardPage.section_ended)
                }
            } else {
                const text = response.data.text;
                this.textToVoice(text, !this.whiteBoardPage.section_ended);
                console.log('this.whiteBoardPage', this.whiteBoardPage)
            }
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
        if (this.recognition) {
            this.recognition.stop();
            this.recognition.removeEventListener('result', this.onResultRecognition);
            this.recognition.removeEventListener('end', this.onEndRecognition);
        }
        // this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

}
