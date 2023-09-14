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

    constructor(
        protected override config: Config,
        private lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService,

    ) {
        super(config)
    }
    ngOnInit(): void {
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

    onPTTPressDown() {
        if (!this.disableButton) {
            if (this.speechRecognitionService.englishRecognition) {
                if (this.speechRecognitionService.ASR_recognizing) {
                    this.speechRecognitionService.stopListening().then(() => {
                        this.speechRecognitionService.changeLang('he-IL');
                        this.speechRecognitionService.startListening();
                    })
                } else {
                    this.speechRecognitionService.changeLang('he-IL');
                    this.speechRecognitionService.startListening();
                }
            }
        }
    }
    onPTTPressUp () {
        if (!this.disableButton) {
            if (this.speechRecognitionService.englishRecognition) {
                if (this.speechRecognitionService.ASR_recognizing) {
                    this.speechRecognitionService.stopListening().then(() => {
                        this.speechRecognitionService.resetLang();
                        this.speechRecognitionService.startListening();
                    })
                } else {
                    this.speechRecognitionService.resetLang();
                    this.speechRecognitionService.startListening();
                }
            }
        }
    }

}
