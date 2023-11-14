import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {BaseSlideComponent} from "../base-slide.component";
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ChatMessage} from "../../entities/chat_message";
import {environment} from "../../../../../environments/environment";
import {SpeechRecognitionService} from "../../../main/services/speech-recognition/speech-recognition.service";
import { NONE_TYPE } from '@angular/compiler';

declare var $: any;

@Component({
    selector: 'app-speaking',
    templateUrl: './speaking.component.html',
    styleUrls: ['./speaking.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class SpeakingComponent extends BaseSlideComponent implements OnInit {

    messages: ChatMessage[] = [];
    detailedQuestionsReviewList:any[] = []
    spinnerEnabled:boolean = false;
    studentActiveASR:string[] = [];
    disableButton = false;
    showDetailedQuestionReviewActive=false;
    grades:string = ''
    score:any = 0
    gradeConversationInProgress:boolean = false;
    recognitionPPTSubscribe: any
    recognitionResultsSubscribe: any
    question: any;
    question_idx:number | undefined;
    all_questions_answered: any;
    recordingIsActive:boolean = false
    modalActive: boolean = false;
    session_started: boolean = false;
    current_counter:any = {}
    private timers:any = {}

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService,
        private sanitizer: DomSanitizer
    ) {
        super(config, lessonService)

        if (environment.is_mock) {
            this.messages = [
                new ChatMessage({type: 'computer', message: 'Hi'})
            ]
        }
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.buildChat()
        this.grades = this.currentSlide.grades
        this.score = this.currentSlide.score
        this.initQnaReview(this.currentSlide.qna_review)
        this.handleCounter(1)
        this.pauseAllCounters()
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            try {
                let resp_data = resp.data
                if (resp_data.source == "check_answer") {
                    console.log('check_answer', resp_data)
                } else if (resp_data.source == "get_hints") {
                    console.log('get_hints', resp_data)
                } else if (resp_data.source == "fix_asr") {
                    this.handleStudentResponse(resp_data.llm_reply['corrected_text'])
                    this.messages[this.messages.length-1] =  new ChatMessage({type: 'user', message: resp_data.llm_reply['corrected_text']})
                    this.question = resp_data.question 
                    this.question_idx = resp_data.question_idx 
                    this.all_questions_answered =  resp_data.all_questions_answered 
                    if (!this.all_questions_answered) {
                        this.messages.push(new ChatMessage({type: 'computer', message: resp_data.question }))
                    } else {
                        alert('Session Ended')
                        this.restartSession()
                    }
                } else if (resp_data.source  == 'next_question'){
                    if(resp_data.need_to_generate_questions) {
                        const data = {
                            "source": "generate_questions",
                            'stopAudio': true
                        }
                        this.lessonService.Broadcast("slideEventRequest", data)
                    }

                    this.question = resp_data.question
                    this.question_idx = resp_data.question_idx
                    this.all_questions_answered =  resp_data.all_questions_answered
                    if (!this.all_questions_answered) {
                        this.messages.push(new ChatMessage({type: 'computer', message: resp_data.question }))
                    } else {
                        alert('Session Ended')
                        this.restartSession()
                    }
                } else if (resp_data.source  == 'generate_questions'){
                    console.log(resp_data)
                } else if (resp_data.source == 'restart_session'){
                    console.log(resp_data)
                    this.nextQuestion()
                } else if(resp_data.source =='student_response') {
                    let response_review_obj:any = {}
                    response_review_obj['student_response'] = resp_data.student_response
                    response_review_obj['teacher_question'] = resp_data.teacher_question
                    response_review_obj['alternative_response'] = resp_data.llm_reply.alternative_response
                    response_review_obj['student_response_review'] = resp_data.llm_reply.student_response_review
 
                    this.updateDetailedQuestionReview(response_review_obj)
                } else if(resp_data.source =='grade_conversation'){
                    this.gradeConversationInProgress = false
                    console.log(resp_data)
                    this.grades = resp_data.llm_reply.conversation_review
                    this.score = resp_data.llm_reply.score
                }
                this.spinnerEnabled  = false;

            } catch (e) {
                console.error(e)
            }

        })

    }
 
    updateDetailedQuestionReview(obj:any){
        this.detailedQuestionsReviewList.push(obj)
    }

    buildChat(){
        this.messages = []
        const slideChat = this.currentSlide.slide_chat
        this.question = ''
        for(let el of  slideChat){
            if(el.speaker == 'student') {
                this.messages.push(new ChatMessage({type: 'user', message: el.content}))
            } else if(el.speaker == 'teacher'){
                this.messages.push(new ChatMessage({type: 'computer', message: el.content}))
                this.question = el.content
            }

        }
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
                console.log('translateGoogle e', e)
            })
        } else {
            this.messages[index].showTranslated = !this.messages[index].showTranslated;
        }
    }

    translateGoogle(currentMessage: ChatMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            var sourceLang = 'en';
            var targetLang = 'he';

            var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(currentMessage.message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('')
                    resolve(translated_text);
                } catch (e) {
                    reject(e)
                }
            });
        })
    }

    onRecognitionPTTResults = (results: any) => {
        console.log("onRecognitionPTTResults results",results)
        const recognitionText = results.text;
        if (results.isFinal) {
            console.log('onRecognitionPTTResults final', recognitionText)
            // this.onButtonClick(recognitionText);
            this.messages.push(
                new ChatMessage({type: 'user', message: recognitionText}),
            )
        }
    }

    initQnaReview(qna_review_list:any[]){
        this.detailedQuestionsReviewList = []
        
        for(let qna of qna_review_list){
            let response_review_obj:any = {}
            response_review_obj['student_response'] = qna.response
            response_review_obj['teacher_question'] = qna.question
            response_review_obj['alternative_response'] = qna.alternative_response
            response_review_obj['student_response_review'] = qna.response_review
            this.updateDetailedQuestionReview(response_review_obj)
        }
    }

    //===== ASR Daniel
    onRecognitionResults= (results: any) => {
        if(results.isFinal){
            if(!this.studentActiveASR.length){
                this.messages.push(
                    new ChatMessage({type: 'user', message:''}),
                )
            }
            this.studentActiveASR.push(results.text)
            this.messages[this.messages.length-1]['message'] = this.studentActiveASR.join('. ')

        }
    }

    startAsr(){
        if(!this.session_started){
            this.speakTheText()
            this.session_started = true
            return
        }
        this.studentActiveASR = []
        this.recognitionResultsSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
        this.speechRecognitionService.startListening();
        this.recordingIsActive = true
        this.handleCounter(1)
    }

    stopAsr(){
        this.speechRecognitionService.stopListening();
        this.recognitionResultsSubscribe.unsubscribe(this.onRecognitionResults);
        const srudent_resp = this.studentActiveASR.join('. ').trim()
        if(srudent_resp.length){
            const data = {
                "source": "fix_asr",
                'stopAudio': true,
                'background':true,
                "student_response":srudent_resp
            }
            this.spinnerEnabled  = true;
            this.lessonService.Broadcast("slideEventRequest", data)
        }
        this.studentActiveASR = []
        this.recordingIsActive = false
        this.pauseAllCounters()
    }

    // === End Asr Daniel
    gradeConversation(){
        if (this.gradeConversationInProgress){
            return;
        }
        this.gradeConversationInProgress = true
        const data = {
            "source": "grade_conversation",
            'stopAudio': true
        }
        this.spinnerEnabled  = true;
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    nextQuestion(){
        const data = {
            "source": "next_question",
            "question_index":this.question_idx,
            // "background":true,
            'stopAudio': true
        }
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    restartSession(){
        const data = {
            "source": "restart_session",
            'stopAudio': true
        }
        this.lessonService.Broadcast("slideEventRequest", data)
        this.clearBlackBoard()
    }

    handleStudentResponse(student_reply:string){
        const data = {
            "source": "student_response",
            "teacher_question": this.question,
            "student_response":student_reply,
            'background':true,
            'stopAudio': true
        }
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    clearBlackBoard(){
        this.messages = []
        this.detailedQuestionsReviewList = []
        this.score=0
        this.grades=''
        this.session_started = true
    }

    toggleAsr(){
        if(!this.recordingIsActive){
            this.startAsr()
        } else {
            this.stopAsr()
        }
    }

    speakTheText(text:string = ''){
        text = text.trim()
        if(!text.length){
            text = this.question 
        }
        if(text.length){
            const data = {
                "source": "speak_the_text",
                "text": text,
                'background':true,
                'stopAudio': true
            }
            this.lessonService.Broadcast("slideEventRequest", data)
        }
        this.session_started = true
    }

    onButtonClick(ans: string) {
        // mode can be "word_to_picture" or "word_to_native_text" or "word_to_native_audio"
        // const data = {"source": "word_translator_ans", "answer": ans}
        // this.submitAnswerPending = true
        // this.lessonService.Broadcast("slideEventRequest", data)
    }

    onPTTPressDown() {
        if (!this.disableButton) {
            this.speechRecognitionService.PTTInProgress = true;
            this.recognitionPPTSubscribe = this.speechRecognitionService.onPTTResults.subscribe(this.onRecognitionPTTResults);
            this.speechRecognitionService.startListening();
            // this.speechRecognitionService.activateNativeLang(true);
        }
    }
    onPTTPressUp () {
        if (!this.disableButton) {
            // this.speechRecognitionService.resetToOrigLang();
            if (this.recognitionPPTSubscribe) {
                setTimeout(() => {
                    this.speechRecognitionService.PTTInProgress = false;
                    this.speechRecognitionService.stopListening();
                    this.recognitionPPTSubscribe.unsubscribe(this.onRecognitionPTTResults);
                }, 500)
            }
        }
    }
    showDetailedQuestionReview(){
        this.showDetailedQuestionReviewActive = true
    }
        
    openModal(){
        this.modalActive = true
    }


    closeModel(){
        this.modalActive = false
        this.showDetailedQuestionReviewActive = false
    }

    handleCounter(question_idx:number){
        this.pauseAllCounters()
        if(!this.timers.hasOwnProperty(question_idx)) {
            this.timers[question_idx] = this.createTimer()
        } else {
            this.timers[question_idx].active = true
        }
        this.current_counter = this.timers[question_idx]
    }

    createTimer(){
        let Timer = Object()
        Timer.active = true
        Timer.counter = 0
        Timer.minutes = 0
        Timer.minutesStr = '00'
        Timer.seconds = 0
        Timer.secondsStr = '00'
        Timer.submited = false
        Timer.intervalId = setInterval(this.progressTimer, 1000,Timer);
        return Timer

    }

    pauseAllCounters(){
        for(const key in this.timers){
            this.timers[key].active = false
        }
    }

    progressTimer(self:any) {
        if (self.active && !self.submited){
            self.counter= self.counter+1
            self.minutes = Math.floor(self.counter/60)
            self.minutesStr = self.minutes.toString().length < 2 ? '0' + self.minutes: self.minutes
            self.seconds = self.counter%60
            self.secondsStr = self.seconds.toString().length < 2 ? '0' + self.seconds: self.seconds
        }
    }
 }
