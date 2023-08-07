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
    presentation: any = {
        "sections": [
            {
                "section_title": "Greetings",
                "section_topic": "Introduction and Lesson parts",
                "slides": [
                    {
                        "slide_title": "",
                        "slide_visual_description": "a slide with a teacher image and a text box with the teacher name and the topic of the lesson",
                        "slide_type": "greeting",
                        "slide_objectives": [
                            "say hi and introduce yourself",
                            "understand the student name if you are not aware of it",
                            "explain the topic and purpose of the lesson"
                        ],
                        "full_screen": false,
                        "estimated_duration": 90,
                        "teacher_name": "Jenny",
                        "teacher_image_path": "https://t3.ftcdn.net/jpg/00/63/41/20/360_F_63412065_tVAWzIWl9wE7l73MWUVieyGg1QlzhQCR.jpg",
                        "text": "Hello. I'm Jenny. \n                        Today we are going to learn about Colors and Animals for beginners. Let's get started!"
                    },
                    {
                        "slide_title": "Colors and Animals for beginners",
                        "slide_visual_description": "a slide with a list of the topics that will be covered in the lesson",
                        "slide_type": "agenda",
                        "slide_objectives": "go through the section of this lesson: ** Greetings** Volcubalry** Good Bye",
                        "full_screen": false,
                        "estimated_duration": 30,
                        "text": "Today we will cover the following topics:** Greetings** Volcubalry** Good ByeLet's get started!"
                    }
                ]
            },
            {
                "section_title": "Volcubalry",
                "section_topic": "Learn new words",
                "slides": [
                    {
                        "slide_title": "repeat after me:",
                        "slide_visual_description": "a slide with a picture and a text of a dog ",
                        "slide_type": "word_repeater",
                        "slide_objectives": [
                            "explain that this type of slide aim to enreach student vocabulary and pronunciation and he would need to repeat after you saying loudly the woed presented in the slide",
                            "make the student repeat after you saying loudly and correctly the word dog"
                        ],
                        "full_screen": true,
                        "estimated_duration": 15,
                        "word": "dog",
                        "image_path": "https://www.thesprucepets.com/thmb/wdb0SmPvT4IjVLM7TdztfD_KAUs=/2144x0/filters:no_upscale():strip_icc()/AmericanEskimo-4293b26f3e044165959f6dbfd70214b2.jpg",
                        "text": "dog"
                    },
                    {
                        "slide_title": "repeat after me:",
                        "slide_visual_description": "a slide with a picture and a text of a cat ",
                        "slide_type": "word_repeater",
                        "slide_objectives": [
                            "make the student repeat after you saying loudly and correctly the word cat"
                        ],
                        "full_screen": true,
                        "estimated_duration": 15,
                        "word": "cat",
                        "image_path": "https://images.ctfassets.net/cnu0m8re1exe/qDQgxOUG5DNKlKH5TXsbo/813fa629fe33794c7ff439070fc31b89/shutterstock_603117302.jpg?fm=jpg&fl=progressive&w=660&h=433&fit=fill",
                        "text": "cat"
                    },
                    {
                        "slide_title": "repeat after me:",
                        "slide_visual_description": "a slide with a picture and a text of a bird ",
                        "slide_type": "word_repeater",
                        "slide_objectives": [
                            "make the student repeat after you saying loudly and correctly the word bird"
                        ],
                        "full_screen": true,
                        "estimated_duration": 15,
                        "word": "bird",
                        "image_path": "https://cdn.britannica.com/23/188023-050-C1E4796B/cardinal-branch-songbird.jpg",
                        "text": "bird"
                    },
                    {
                        "slide_title": "repeat after me:",
                        "slide_visual_description": "a slide with a picture and a text of a white dog ",
                        "slide_type": "word_repeater",
                        "slide_objectives": [
                            "make the student repeat after you saying loudly and correctly the word white dog"
                        ],
                        "full_screen": true,
                        "estimated_duration": 15,
                        "word": "white dog",
                        "image_path": "https://www.thesprucepets.com/thmb/wdb0SmPvT4IjVLM7TdztfD_KAUs=/2144x0/filters:no_upscale():strip_icc()/AmericanEskimo-4293b26f3e044165959f6dbfd70214b2.jpg",
                        "text": "white dog"
                    },
                    {
                        "slide_title": "repeat after me:",
                        "slide_visual_description": "a slide with a picture and a text of a black cat ",
                        "slide_type": "word_repeater",
                        "slide_objectives": [
                            "make the student repeat after you saying loudly and correctly the word black cat"
                        ],
                        "full_screen": true,
                        "estimated_duration": 15,
                        "word": "black cat",
                        "image_path": "https://images.ctfassets.net/cnu0m8re1exe/qDQgxOUG5DNKlKH5TXsbo/813fa629fe33794c7ff439070fc31b89/shutterstock_603117302.jpg?fm=jpg&fl=progressive&w=660&h=433&fit=fill",
                        "text": "black cat"
                    },
                    {
                        "slide_title": "repeat after me:",
                        "slide_visual_description": "a slide with a picture and a text of a red bird ",
                        "slide_type": "word_repeater",
                        "slide_objectives": [
                            "make the student repeat after you saying loudly and correctly the word red bird"
                        ],
                        "full_screen": true,
                        "estimated_duration": 15,
                        "word": "red bird",
                        "image_path": "https://cdn.britannica.com/23/188023-050-C1E4796B/cardinal-branch-songbird.jpg",
                        "text": "red bird"
                    },
                    {
                        "slide_title": "read the text below:",
                        "slide_visual_description": "a slide with a text to be read by the student",
                        "slide_type": "reading",
                        "slide_objectives": [
                            "explain the student that he needs to read the text loudly and correctly sentence by sentense",
                            "the student read the text corrrectly"
                        ],
                        "full_screen": true,
                        "estimated_duration": 120,
                        "text": "\n                                Dogs say woof-woof. \n                                Cats say meow. \n                                Birds sing tweet-tweet.\n                            "
                    }
                ]
            },
            {
                "section_title": "Good Bye",
                "section_topic": "Say Good Bye",
                "slides": [
                    {
                        "slide_title": "",
                        "slide_visual_description": "a slide with a bye bye image that is related to the lesson",
                        "slide_type": "ending",
                        "slide_objectives": [
                            "review the lesson topics",
                            "say goodbye and thank the student for the lesson"
                        ],
                        "full_screen": false,
                        "estimated_duration": 15,
                        "image_path": "https://cdn2.vectorstock.com/i/1000x1000/72/36/basic-colors-educational-set-with-sea-animals-vector-22457236.jpg",
                        "text": "Bye Bye.\n                        We will meet again soon!"
                    }
                ]
            }
        ],
        "current_section_index": 0,
        "current_slide_index": 0,
        "current_objective_index": 0,
        "estimated_duration": 345,
        "teacher": {
            "name": "Jenny",
            "image_path": "https://t3.ftcdn.net/jpg/00/63/41/20/360_F_63412065_tVAWzIWl9wE7l73MWUVieyGg1QlzhQCR.jpg",
            "gender": "female",
            "age": 25
        },
        "presentation_title": "Colors and Animals",
        "presentation_topic": "Colors and Animals for beginners"
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
        this.getLessons();
        // this.setCurrentLesson();
        // this.setRandomCircleAnimation()
    }

    listenToSpeechRecognitionResults() {
        this.speechRecognitionService.onResults.subscribe((results) => {
            this.recognitionText = results.text;
            this.addCircle(this.user.nativeElement, this.recognitionCountWords)
            this.recognitionCountWords++;
            if (results.isFinal) {
                this.answer = this.recognitionText;
                console.log("End speech recognition EN", this.answer)
                if (this.answer) {
                    this.stopSpeechRecognition();
                    this.recognitionText = '';
                    this.recognitionCountWords = 0;
                    this.sendAnswerStream();
                } else {
                    // this.stopSpeechRecognition();
                    // this.startSpeechRecognition();
                }
            }
            console.log('results', results)
        })
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
                    if (!this.whiteBoardPage.help_sound_url) {
                        this.startSpeakInstructions()
                    } else {
                        this.playUsingAudio(this.whiteBoardPage.help_sound_url)
                    }
                })
            }
        }
    }

    startSpeakInstructions() {
        const t: any = this.currentInstructions.shift();
        if (t) {
            this.playUsingSpeechSynthesis(t);
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
        console.log('playing audion', src_url)
        const audio = new Audio();
        audio.src = src_url;
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

    async sendAnswerStream() {
        const answer = this.answer
        const obj: any = {
            "lesson_id": this.currentLesson.id,
            "white_board_item_id": this.whiteBoardPage.item_id,
            "module_type": this.whiteBoardPage.module_type,
            "help_native": this.whiteBoardPage.help_native,
            "instructions": this.whiteBoardPage.instructions,
            "repeat_value": this.whiteBoardPage.repeat_value,
            "repeat_failed": this.whiteBoardPage.repeat_failed,
            "repeat_success": this.whiteBoardPage.repeat_success,
            "answer": answer
        }
        this.audioChunks = []
        this.apiService.sendAnswerStream(obj).subscribe((event: any) => {
            if (event.type === HttpEventType.DownloadProgress) {
                // Append received chunk to audioChunks and play it
                console.log('event', event)
                // const chunk = new Uint8Array(event.loaded - this.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0));
                // console.log('chunk', chunk)
                // this.audioChunks.push(chunk);
                // this.playAudioChunk(chunk);
            } else if (event.type === HttpEventType.Response) {
                // Audio data fully received, play the whole audio
                // console.log('event 1', event)
                const audioData = new Uint8Array(event.body);
                this.audioChunks.push(audioData);
                this.playAudio();
            }
        })

        // if (response.err) {
        //     console.log('response err', response)
        //     // setTimeout(() => {
        //     //     this.startSpeechRecognition();
        //     // },2000)
        // } else {
        //     this.handleOnAnswer(response)
        //     // console.log('this.currentLesson', this.currentLesson)
        //     // const next_page_id = response.data.next_page_id;
        //     // const ids = this.currentLesson.white_board_pages.map((o: any) => o.id)
        //     // const index = ids.indexOf(next_page_id);
        //     // if (index > -1) {
        //     //     this.whiteBoardPage = this.currentLesson.white_board_pages[index];
        //     // }
        //     // console.log('response', response)
        // }
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

    handleOnAnswer(response: any) {
        if (this.whiteBoardPage.module_type == 'conversation') {
            this.whiteBoardPage.section_ended = response.data.section_ended;
            const text = response.data.text;
            this.answer = '';
            this.whiteBoardPage.display_text = text;
            if (response.data.help_sound_url) {
                this.playUsingAudio(response.data.help_sound_url)
            } else {
                this.textToVoice(text, !this.whiteBoardPage.section_ended);
            }
            if (this.whiteBoardPage.section_ended) {
                console.log('this.whiteBoardPage.section_ended', this.whiteBoardPage.section_ended)
            }
        }
        if (this.whiteBoardPage.module_type == 'repeater') {
            this.whiteBoardPage.section_ended = response.data.section_ended;
            this.answer = '';
            if (this.whiteBoardPage.section_ended) {
                const text = response.data.text;
                if (response.data.help_sound_url) {
                    this.playUsingAudio(response.data.help_sound_url)
                } else {
                    this.textToVoice(text, !this.whiteBoardPage.section_ended);
                }
                if (this.whiteBoardPage.section_ended) {
                    console.log('this.whiteBoardPage.section_ended', this.whiteBoardPage.section_ended)
                }
            } else {
                const text = response.data.text;
                if (response.data.help_sound_url) {
                    this.playUsingAudio(response.data.help_sound_url)
                } else {
                    this.textToVoice(text, !this.whiteBoardPage.section_ended);
                }
            }
        }
        if (this.whiteBoardPage.module_type == 'typewriter') {
            this.whiteBoardPage.section_ended = response.data.section_ended;
            this.answer = '';
            if (this.whiteBoardPage.section_ended) {
                const text = response.data.text;
                if (response.data.help_sound_url) {
                    this.playUsingAudio(response.data.help_sound_url)
                } else {
                    this.textToVoice(text, !this.whiteBoardPage.section_ended);
                }
                if (this.whiteBoardPage.section_ended) {
                    console.log('this.whiteBoardPage.section_ended', this.whiteBoardPage.section_ended)
                }
            } else {
                const text = response.data.text;
                if (response.data.help_sound_url) {
                    this.playUsingAudio(response.data.help_sound_url)
                } else {
                    this.textToVoice(text, !this.whiteBoardPage.section_ended);
                }
                console.log('this.whiteBoardPage', this.whiteBoardPage)
            }
        }
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
        if (this.recognition) {
            this.recognition.stop();
            this.recognition.removeEventListener('result', this.onResultRecognition);
            this.recognition.removeEventListener('end', this.onEndRecognition);
        }
        // this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

}
