import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../../services/lesson/lesson.service";
import {SpeechRecognitionService} from "../../../../services/speech-recognition/speech-recognition.service";

@Component({
    selector: 'app-word-translator',
    templateUrl: './word-translator.component.html',
    styleUrls: ['./word-translator.component.less']
})
export class WordTranslatorComponent  extends BaseSlideComponent {
    submitAnswerPending:boolean =false;

    selectedImage = '';
    selectedText = '';

    disableButton = false;

    recognitionPPTSubscribe: any

    constructor(
        protected override config: Config,
        private lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService,

    ) {
        super(config)
    }
    override ngOnInit(): void {
        super.ngOnInit();
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            if (resp.data.source == "word_translator_button_reply") {
                this.submitAnswerPending = false
            }
        })
    }
    onButtonClick(ans: string) {
        // mode can be "word_to_picture" or "word_to_native_text" or "word_to_native_audio"
        const data = {"source": "word_translator_ans", "answer": ans}
        this.submitAnswerPending = true
        this.lessonService.Broadcast("slideEventRequest", data)
    }
    example_how_to_use_is_active() {
        if (this.slideData?.is_active) {
            console.log('asdf')
        }
    }

    selectImage(index: number) {
        this.selectedImage = this.currentSlide.answer_options[index];
        this.onButtonClick(this.selectedImage);
        if (this.selectedImage === this.currentSlide.correct_answer) {
            console.log('current')
        } else {
            console.log('incorrect')
        }
    }



    selectText(index: number) {
        this.selectedText = this.currentSlide.answer_options[index];
        this.onButtonClick(this.selectedText);
        if (this.selectedText === this.currentSlide.correct_answer) {
            console.log('current')
        } else {
            console.log('incorrect')
        }
    }

    onRecognitionPTTResults = (results: any) => {
        console.log("results",results)
        const recognitionText = results.text;
        if (results.isFinal) {
            console.log('final', recognitionText)
            this.onButtonClick(recognitionText);
        }
    }

    onPTTPressDown() {
        if (!this.disableButton) {
            this.recognitionPPTSubscribe = this.speechRecognitionService.onPTTResults.subscribe(this.onRecognitionPTTResults);
            this.speechRecognitionService.activateNativeLang(true);
        }
    }
    onPTTPressUp () {
        if (!this.disableButton) {
            this.speechRecognitionService.resetToOrigLang();
            if (this.recognitionPPTSubscribe) {
                this.recognitionPPTSubscribe.unsubscribe(this.onRecognitionPTTResults);
            }
        }
    }
}
