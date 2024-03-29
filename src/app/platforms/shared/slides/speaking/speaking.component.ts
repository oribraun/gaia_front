import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {BaseSlideComponent} from "../base-slide.component";
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ChatMessage} from "../../entities/chat_message";
import {environment} from "../../../../../environments/environment";
import {SpeechRecognitionService} from "../../../main/services/speech-recognition/speech-recognition.service";
import { NONE_TYPE } from '@angular/compiler';
import {User} from "../../entities/user";

declare let $: any;

@Component({
    selector: 'app-speaking',
    templateUrl: './speaking.component.html',
    styleUrls: ['./speaking.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class SpeakingComponent extends BaseSlideComponent implements OnInit, OnDestroy {

    @ViewChild('scroller') scroller!: ElementRef;

    messages: ChatMessage[] = [];
    detailedQuestionsReviewList:any[] = [];
    spinnerEnabled:boolean = false;
    studentActiveASR:string[] = [];
    disableButton = false;
    showDetailedQuestionReviewActive = false;
    grades:string = '';
    score:any = 0;
    gradeConversationInProgress:boolean = false;
    recognitionPPTSubscribe: any;
    recognitionResultsSubscribe: any;
    question: any;
    title_text: string = '';
    hint_used:boolean = false;
    pace:number = 0;
    question_idx:number | undefined;
    all_questions_answered: any;
    recordingIsActive:boolean = false;
    asrResultsInProgress:boolean = false;
    needToStopAsrOnFinal:boolean = false;

    userAudioBuffer: any;
    audioChunks: any[] = [];
    mediaRecorder: MediaRecorder | null;

    modalActive: boolean = false;
    session_started: boolean = false;
    endSpeakingInProgress: boolean = false;
    current_counter:any = {};
    private timers:any = {};
    replayInProgress = false;
    showSpinner = false;
    speakInProgress = false;
    user: User = new User();

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService,
        private sanitizer: DomSanitizer
    ) {
        super(config, lessonService);

        if (environment.is_mock) {
            this.messages = [
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'computer', audio_path: 'https://wavesurfer.xyz/wavesurfer-code/examples/audio/audio.wav'}),
                new ChatMessage({type: 'user', audio_path: 'https://wavesurfer.xyz/wavesurfer-code/examples/audio/audio.wav'}),
                new ChatMessage({type: 'computer', audio_path: 'https://wavesurfer.xyz/wavesurfer-code/examples/audio/audio.wav'}),
                new ChatMessage({type: 'user', audio_path: 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3'})
            ];
        }
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.getUser();
        if (!environment.is_mock) {
            this.buildChat();
        }
        this.grades = this.currentSlide.grades;
        this.score = this.currentSlide.score;
        this.pace = this.currentSlide.pace;
        this.hint_used = this.currentSlide.hint_used;
        this.title_text = this.currentSlide.slide_title;
        this.all_questions_answered = this.currentSlide.all_questions_answered;
        this.initQnaReview(this.currentSlide.qna_review);
        this.handleCounter(1, this.pace);
        this.pauseAllCounters();
        this.listenToSlideEvents();
        this.recognitionPPTSubscribe = this.speechRecognitionService.onPTTResults.subscribe(this.onRecognitionPTTResults);

    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
    }

    listenToSlideEvents() {
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            try {
                const resp_data = resp.data;
                if (resp_data.source == "check_answer") {
                    console.log('check_answer', resp_data);
                } else if (resp_data.source == "get_hints") {
                    console.log('get_hints', resp_data);
                } else if (resp_data.source == "fix_asr") {
                    // this.handleStudentResponse(resp_data.llm_reply['corrected_text']);
                    // this.messages[this.messages.length - 1] =  new ChatMessage({type: 'user', message: resp_data.llm_reply['corrected_text']});
                    // this.question = resp_data.question;
                    // this.question_idx = resp_data.question_idx;
                    // this.all_questions_answered =  resp_data.all_questions_answered;
                    // if (!this.all_questions_answered) {
                    //     this.messages.push(new ChatMessage({type: 'computer', message: resp_data.question }));
                    //     this.scrollToBottom2();
                    // } else {
                    //     // alert('Session Ended');
                    //     // this.restartSession();
                    // }
                } else if (resp_data.source  == 'next_question') {
                    this.onNextQuestion(resp_data);
                } else if (resp_data.source  == 'next_question_blob') {
                    this.onNextQuestion(resp_data);
                } else if (resp_data.source  == 'generate_questions') {
                    console.log(resp_data);
                } else if (resp_data.source == 'restart_session') {
                    console.log(resp_data);
                    this.onNextQuestion(resp_data);
                    // this.nextQuestion();
                } else if(resp_data.source == 'student_response') {
                    const response_review_obj:any = {};
                    response_review_obj['student_response'] = resp_data.student_response;
                    response_review_obj['teacher_question'] = resp_data.teacher_question;
                    response_review_obj['alternative_response'] = resp_data.llm_reply.alternative_response;
                    response_review_obj['student_response_review'] = resp_data.llm_reply.student_response_review;

                    this.updateDetailedQuestionReview(response_review_obj);
                } else if(resp_data.source == 'grade_conversation') {
                    this.gradeConversationInProgress = false;
                    this.grades = resp_data.llm_reply.conversation_review;
                    this.score = resp_data.llm_reply.score;
                } else if(resp_data.source == 'continue_to_next_slide_click') {
                    this.endSpeakingInProgress = false;
                }
                this.spinnerEnabled  = false;

            } catch (e) {
                console.error(e);
            }

        });
        this.lessonService.ListenFor("slideEventReplyError").subscribe((resp:any) => {
            if (this.spinnerEnabled) {
                this.spinnerEnabled = false;
            }
            if (this.recordingIsActive) {
                this.lessonService.Broadcast('stopListenToAsr');
            }
        });
        this.lessonService.ListenFor("blockAllSlideEvents").subscribe((resp:any) => {
            if (this.spinnerEnabled) {
                this.spinnerEnabled = false;
            }
        });

        this.lessonService.ListenFor("speakInProgress").subscribe((val: boolean) => {
            this.speakInProgress = val;
        });
    }

    onNextQuestion(resp_data: any) {
        if(resp_data.need_to_generate_questions) {
            const data = {
                "source": "generate_questions",
                'stopAudio': true
            };
            this.lessonService.Broadcast("slideEventRequest", data);
        }

        this.question = resp_data.question;
        this.question_idx = resp_data.question_idx;
        this.all_questions_answered =  resp_data.all_questions_answered;
        console.log('this.all_questions_answered', this.all_questions_answered);
        if (!this.all_questions_answered) {
            if (resp_data.question_audio_path) {
                this.messages.push(
                    new ChatMessage({type: 'computer', audio_path: resp_data.question_audio_path})
                );
            } else {
                this.messages.push(
                    new ChatMessage({type: 'computer', message: resp_data.question})
                );
            }
            this.scrollToBottom2(false, 900);
        } else {
            // alert('Session Ended');
            // this.restartSession();
        }

    }

    clearSlideEvents() {
        this.lessonService.ClearEvent("slideEventReply");
        this.lessonService.ClearEvent("slideEventReplyError");
        this.lessonService.ClearEvent("blockAllSlideEvents");
        this.lessonService.ClearEvent("recognitionText");
    }

    updateDetailedQuestionReview(obj:any) {
        this.detailedQuestionsReviewList.push(obj);
    }

    buildChat() {
        this.messages = [];
        const slideChat = this.currentSlide.slide_chat;
        this.question = '';
        for(const el of  slideChat) {
            if(el.speaker == 'student') {
                if (el.content) {
                    this.messages.push(new ChatMessage({type: 'user', message: el.content}));
                } else {
                    this.messages.push(new ChatMessage({type: 'user', audio_path: el.audio_path, audio_text: el.audio_text}));
                }
            } else if(el.speaker == 'teacher') {
                if (el.content) {
                    this.messages.push(new ChatMessage({type: 'computer', message: el.content}));
                } else {
                    this.messages.push(new ChatMessage({type: 'computer', audio_path: el.audio_path, audio_text: el.audio_text}));
                }
                this.question = el.content;
            }

        }
        if (this.messages.length) {
            this.session_started = true;
        }
        setTimeout(() => {
            this.scrollToBottom2();
        });
    }

    isEmpty(obj:any) {
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    translate(index: number) {
        if (!this.messages[index].translatedMessage) {
            this.translateGoogle(this.messages[index]).then((translated_text: string) => {
                this.messages[index].translatedMessage = translated_text;
                this.messages[index].showTranslated = true;
            }).catch((e) => {
                console.log('translateGoogle e', e);
            });
        } else {
            this.messages[index].showTranslated = !this.messages[index].showTranslated;
        }
    }

    translateGoogle(currentMessage: ChatMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            const sourceLang = 'en';
            const targetLang = 'he';

            const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(currentMessage.message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('');
                    resolve(translated_text);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    initQnaReview(qna_review_list:any[] = []) {
        this.detailedQuestionsReviewList = [];

        for(const qna of qna_review_list) {
            const response_review_obj:any = {};
            response_review_obj['student_response'] = qna.response;
            response_review_obj['teacher_question'] = qna.question;
            response_review_obj['alternative_response'] = qna.alternative_response;
            response_review_obj['student_response_review'] = qna.response_review;
            this.updateDetailedQuestionReview(response_review_obj);
        }
    }

    async startRecording() {
        if (this.recordingIsActive || this.speakInProgress) {
            return;
        }
        const startTime = Date.now();
        this.recordingIsActive = true;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        // if (this.mediaRecorder.state == 'inactive') {
        //
        // }
        this.mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            this.messages.push(
                new ChatMessage({type: 'user', audioBlob: audioBlob})
            );
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                if (fileReader.result) {
                    const results: any = fileReader.result;
                    console.log('results', results);
                    const audioBase64 = results.split(',')[1]; // Extract the base64 data
                    this.userAudioBuffer = audioBase64;
                    this.sendUserAudioBuffer();
                }
            };
            fileReader.readAsDataURL(audioBlob);
        };

        this.mediaRecorder.start();
    }

    onAudioLoaded(val: boolean) {
        this.scrollToBottom2();
    }

    stopRecording() {
        if (!this.recordingIsActive || this.speakInProgress) {
            return;
        }
        if (this.mediaRecorder) {
            this.recordingIsActive = false;
            this.mediaRecorder.stop();
            this.mediaRecorder = null;
        }
    }


    startAsr() {
        if (this.asrResultsInProgress || this.speakInProgress) {
            return;
        }
        this.recordingIsActive = true;
        this.speechRecognitionService.PTTInProgress = true;
        this.lessonService.Broadcast('startListenToAsr');
    }

    stopAsr() {
        if (!this.asrResultsInProgress) {
            this.recordingIsActive = false;
            this.lessonService.Broadcast('stopListenToAsr');
            this.speechRecognitionService.PTTInProgress = false;
            this.sendUserReplay();
        } else {
            this.needToStopAsrOnFinal = true;
        }
    }

    onRecognitionPTTResults = (results: any) => {
        console.log("onRecognitionPTTResults results", results);
        const recognitionText = results.text;
        this.asrResultsInProgress = true;
        if (results.isFinal) {
            console.log('this.studentActiveASR.length', this.studentActiveASR.length);
            if(!this.studentActiveASR.length) {
                this.messages.push(
                    new ChatMessage({type: 'user', message:''})
                );
            }
            this.studentActiveASR.push(recognitionText);
            this.messages[this.messages.length - 1]['message'] = this.studentActiveASR.join('. ');
            this.scrollToBottom2();
            if (this.needToStopAsrOnFinal) {
                this.needToStopAsrOnFinal = false;
                this.lessonService.Broadcast('stopListenToAsr');
                this.recordingIsActive = false;
                this.sendUserReplay();
            }
            this.asrResultsInProgress = false;
        }
    };

    startSession() {
        if(!this.session_started) {
            // this.nextQuestion();
            // this.speakTheText();
            this.session_started = true;
            this.restartSession();
        }
    }

    sendUserReplay() {
        const srudent_resp = this.studentActiveASR.join('. ').trim();
        if(srudent_resp.length) {
            const data = {
                "source": "fix_asr",
                'stopAudio': true,
                'background':true,
                "student_response":srudent_resp
            };
            this.spinnerEnabled  = true;
            this.replayInProgress = true;
            this.lessonService.Broadcast("slideEventRequest", data);
        }
        this.studentActiveASR = [];
        this.recordingIsActive = false;
        this.pauseAllCounters();
    }

    sendUserAudioBuffer() {
        if (this.userAudioBuffer) {
            // console.log('this.userAudioBuffer', this.userAudioBuffer);
            const data = {
                "source": "next_question_blob",
                "question_index":this.question_idx,
                'stopAudio': true,
                "student_response_base64":this.userAudioBuffer
            };
            this.spinnerEnabled  = true;
            this.replayInProgress = true;
            this.lessonService.Broadcast("slideEventRequest", data);
            this.recordingIsActive = false;
            this.userAudioBuffer = null;
            this.audioChunks = [];
            this.pauseAllCounters();
        }
    }

    // === End Asr Daniel
    gradeConversation() {
        this.gradeConversationInProgress = true;
        const data = {
            "source": "grade_conversation",
            "pace":this.current_counter.counter,
            "backgroun":true,
            'stopAudio': true
        };
        this.spinnerEnabled  = true;
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    nextQuestion() {
        const data = {
            "source": "next_question",
            "question_index":this.question_idx,
            // "background":true,
            'stopAudio': true
        };
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    endSlide() {
        if (this.endSpeakingInProgress) {
            return;
        }
        const data = {
            "source": "continue_to_next_slide_click",
            'stopAudio': true
        };
        this.endSpeakingInProgress = true;
        // this.spinnerEnabled  = true;
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    restartSession() {
        const data = {
            "source": "restart_session",
            'stopAudio': true
        };
        this.lessonService.Broadcast("slideEventRequest", data);
        this.clearBlackBoard();
    }

    handleStudentResponse(student_reply:string) {
        const data = {
            "source": "student_response",
            "teacher_question": this.question,
            "student_response":student_reply,
            'background':true,
            'stopAudio': true
        };
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    clearBlackBoard() {
        this.messages = [];
        this.detailedQuestionsReviewList = [];
        this.score = 0;
        this.grades = '';
        this.pace = 0;
        this.hint_used = false;
        this.session_started = true;
        this.timers = [];
        this.handleCounter(1, this.pace);
        this.pauseAllCounters();
    }

    toggleAsr() {
        if(!this.recordingIsActive) {
            this.startAsr();
        } else {
            this.stopAsr();
        }
    }

    speakTheText(text:string = '') {
        text = text.trim();
        if(!text.length) {
            text = this.question;
        }
        if(text.length) {
            const data = {
                "source": "speak_the_text",
                "text": text,
                'background':true,
                'stopAudio': true
            };
            this.lessonService.Broadcast("slideEventRequest", data);
        }
        this.session_started = true;
    }

    onButtonClick(ans: string) {
        // mode can be "word_to_picture" or "word_to_native_text" or "word_to_native_audio"
        // const data = {"source": "word_translator_ans", "answer": ans}
        // this.submitAnswerPending = true
        // this.lessonService.Broadcast("slideEventRequest", data)
    }

    onPTTPressDown() {
        if (!this.disableButton) {
            this.startAsr();
        }
    }
    onPTTPressUp () {
        if (!this.disableButton) {
            this.stopAsr();
        }
    }
    showDetailedQuestionReview() {
        this.showDetailedQuestionReviewActive = true;
    }

    openModal() {
        this.modalActive = true;
    }


    closeModel() {
        this.modalActive = false;
        this.showDetailedQuestionReviewActive = false;
    }

    handleCounter(question_idx:number, pace = 0) {
        this.pauseAllCounters();
        if(!this.timers.hasOwnProperty(question_idx)) {
            this.timers[question_idx] = this.createTimer(pace);
        } else {
            this.timers[question_idx].active = true;
        }
        this.current_counter = this.timers[question_idx];
    }

    createTimer(initial_value = 0) {
        const Timer = Object();
        Timer.active = true;
        Timer.counter = initial_value;
        Timer.minutes =  Math.floor(initial_value / 60);
        Timer.minutesStr = Timer.minutes.toString().length < 2 ? '0' + Timer.minutes : Timer.minutes;
        Timer.seconds = Timer.counter % 60;
        Timer.secondsStr = Timer.seconds.toString().length < 2 ? '0' + Timer.seconds : Timer.seconds;
        Timer.submited = false;
        Timer.intervalId = setInterval(this.progressTimer, 1000, Timer);
        return Timer;

    }

    pauseAllCounters() {
        for(const key in this.timers) {
            this.timers[key].active = false;
        }
    }

    progressTimer(self:any) {
        if (self.active && !self.submited) {
            self.counter = self.counter + 1;
            self.minutes = Math.floor(self.counter / 60);
            self.minutesStr = self.minutes.toString().length < 2 ? '0' + self.minutes : self.minutes;
            self.seconds = self.counter % 60;
            self.secondsStr = self.seconds.toString().length < 2 ? '0' + self.seconds : self.seconds;
        }
    }

    scrollToBottom2(animate = false, timeout = 0) {
        if (this.scroller) {
            setTimeout(() => {
                const element = this.scroller.nativeElement;
                element.scrollTop = element.scrollHeight;
            }, timeout);
        }
    }

    override ngOnDestroy(): void {
        this.clearSlideEvents();
        if (this.recognitionPPTSubscribe) {
            this.recognitionPPTSubscribe.unsubscribe(this.onRecognitionPTTResults);
        }
        super.ngOnDestroy();
    }
}
