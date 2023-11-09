import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {BaseSlideComponent} from "../base-slide.component";
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ChatMessage} from "../../../main/entities/chat_message";
import {environment} from "../../../../../environments/environment";
import {SpeechRecognitionService} from "../../../main/services/speech-recognition/speech-recognition.service";

declare var $: any;

@Component({
    selector: 'app-speaking',
    templateUrl: './speaking.component.html',
    styleUrls: ['./speaking.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class SpeakingComponent extends BaseSlideComponent implements OnInit {

    messages: ChatMessage[] = [];

    studentActiveASR:string[] = [];
    disableButton = false;

    recognitionPPTSubscribe: any
    recognitionResultsSubscribe: any
    question: any;
    all_questions_answered: any;

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

        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            try {
                let resp_data = resp.data
                if (resp_data.source == "check_answer") {
                    console.log('check_answer', resp_data)
                } else if (resp_data.source == "get_hints") {
                    console.log('get_hints', resp_data)
                } else if (resp_data.source == "fix_asr") {
                    this.messages[this.messages.length-1] =  new ChatMessage({type: 'user', message: resp_data.llm_reply['corrected_text']})
                    console.log('fix_asr', resp_data)
                } else if (resp_data.source  == 'next_question'){
                    if(resp_data.need_to_generate_questions) {
                        const data = {
                            "source": "generate_questions",
                            'stopAudio': true
                        }
                        this.lessonService.Broadcast("slideEventRequest", data)
                    }
                     
                    this.question = resp_data.question 
                    this.all_questions_answered =  resp_data.all_questions_answered 
                    if (!this.all_questions_answered) {
                        this.messages.push(new ChatMessage({type: 'computer', message: resp_data.question }))
                    }
                } else if (resp_data.source  == 'generate_questions'){
                    console.log(resp_data)
                } else if (resp_data.source == 'restart_session'){
                    console.log(resp_data)
                    this.nextQuestion()
                }

            } catch (e) {
                console.error(e)
            }

        })

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
        this.studentActiveASR = []
        this.recognitionResultsSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
        this.speechRecognitionService.startListening();
    }

    stopAsr(){
        this.speechRecognitionService.stopListening();
        this.recognitionResultsSubscribe.unsubscribe(this.onRecognitionResults);
        const data = {
            "source": "fix_asr",
            'stopAudio': true,
            "student_response":this.studentActiveASR.join('. ')
        }
        this.lessonService.Broadcast("slideEventRequest", data)
        this.studentActiveASR = []
    }

    // === End Asr Daniel

    nextQuestion(){
        const data = {
            "source": "next_question",
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
}