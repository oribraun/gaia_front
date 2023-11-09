import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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
export class SpeakingComponent extends BaseSlideComponent implements OnInit, OnDestroy {
    @ViewChild('scroller') scroller!: ElementRef;

    messages: ChatMessage[] = [];

    disableButton = false;

    ASRInProgress = false;

    recognitionPPTSubscribe: any

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
        public speechRecognitionService: SpeechRecognitionService,
        private sanitizer: DomSanitizer
    ) {
        super(config, lessonService)

        if (environment.is_mock) {
            this.messages = [
                new ChatMessage({type: 'computer', message: 'Hi! Can you please fill in the blanks to complete the sentence? ____ is Danny, he is here'}),
                new ChatMessage({type: 'user', message: 'im good how are you?'}),
                new ChatMessage({type: 'computer', message: 'fine'}),
                new ChatMessage({type: 'user', message: 'hi'}),
            ]
        }
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            try {
                let resp_data = resp.data
                if (resp_data.source == "get_ptt_response") {

                }

            } catch (e) {
                console.error(e)
            }

        })

        this.speechRecognitionService.startListening();
        this.recognitionPPTSubscribe = this.speechRecognitionService.onPTTResults.subscribe(this.onRecognitionPTTResults);

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
        if (this.speechRecognitionService.PTTInProgress) {
            this.ASRInProgress = true;
            console.log("onRecognitionPTTResults results", results)
            const recognitionText = results.text;
            if (results.isFinal) {
                console.log('onRecognitionPTTResults final', recognitionText)
                // this.onButtonClick(recognitionText);
                this.messages.push(
                    new ChatMessage({type: 'user', message: recognitionText}),
                )
                setTimeout(() => {
                    this.scrollToBottom2()
                })
                if (this.ASRInProgress) {
                    if (this.speechRecognitionService.PTTInProgress) {
                        this.speechRecognitionService.PTTInProgress = false;
                    }
                    this.ASRInProgress = false;
                }
            }
        }
    }

    onButtonClick(ans: string) {
        if (this.speechRecognitionService.PTTInProgress) {
            this.speechRecognitionService.PTTInProgress = false;
        } else {
            this.speechRecognitionService.PTTInProgress = true;
        }
        // mode can be "word_to_picture" or "word_to_native_text" or "word_to_native_audio"
        // const data = {"source": "word_translator_ans", "answer": ans}
        // this.submitAnswerPending = true
        // this.lessonService.Broadcast("slideEventRequest", data)
    }

    onPTTPressDown() {
        if (!this.disableButton) {
            this.speechRecognitionService.PTTInProgress = true;
            // this.recognitionPPTSubscribe = this.speechRecognitionService.onPTTResults.subscribe(this.onRecognitionPTTResults);
            // this.speechRecognitionService.startListening();
            // this.speechRecognitionService.activateNativeLang(true);
        }
    }
    onPTTPressUp () {
        if (!this.disableButton) {
            // this.speechRecognitionService.resetToOrigLang();
            if (this.recognitionPPTSubscribe) {
                if (!this.ASRInProgress) {
                    this.speechRecognitionService.PTTInProgress = false;
                }
            }
        }
    }

    scrollToBottom2(animate=false, timeout=0){
        if (this.scroller) {
            setTimeout(() => {
                const element = this.scroller.nativeElement;
                element.scrollTop = element.scrollHeight
            }, timeout)
        }
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.recognitionPPTSubscribe.unsubscribe(this.onRecognitionPTTResults);
    }
}
