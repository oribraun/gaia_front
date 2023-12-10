import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

@Component({
    selector: 'app-reading',
    templateUrl: './reading.component.html',
    styleUrls: ['./reading.component.less']
})
export class ReadingComponent extends BaseSlideComponent implements OnInit, OnDestroy {

    text_to_present = '';
    correct_words:string[] = [];
    target_words:string[] = [];
    sentences:string[] = [];
    currentSentenceIndex = 0;

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.text_to_present = this.currentSlide.text;
        this.sentences = [];
        for (const sentence of this.text_to_present.split('\n')){
            if (sentence.trim()){
                this.sentences.push(sentence.trim());
            }
        }
        this.target_words = this.remove_punct(this.text_to_present).toLowerCase().split(' ');
        this.listenToSlideEvents();
    }

    listenToSlideEvents() {
        this.lessonService.ListenFor("student_reply_request").subscribe((message:any) => {
            this.mark_correct_words(message);
        });
        this.lessonService.ListenFor("student_reply_response").subscribe((response:any) => {
            try{
                if(response.data.text.toLowerCase().includes('try the next sentence') && response.data.text.toLowerCase().includes('good job, you read')){
                    this.currentSentenceIndex += 1;
                }
            } catch (error) {
                console.error(error);
            }

            console.log('in reading student_reply_response' ,response.data.text);
        });
    }

    clearSlideEvents() {
        this.lessonService.ClearEvent("student_reply_request");
        this.lessonService.ClearEvent("student_reply_response");
    }

    remove_punct(text:string){
        const punctuationless = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        const finalString = punctuationless.replace(/\s{2,}/g," ");
        return finalString;
    }

    mark_correct_words(message: string) {
        const message_words:string[] = this.remove_punct(message).toLowerCase().split(' ');
        for(const word of message_words){
            if(this.target_words.includes(word)){
                this.correct_words.push(word);
            }
        }
    }

    override ngOnDestroy(): void {
        this.clearSlideEvents();
        super.ngOnDestroy();
    }
}
