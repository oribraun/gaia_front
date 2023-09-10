import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {LessonService} from "../../../../services/lesson/lesson.service";

@Component({
    selector: 'app-reading',
    templateUrl: './reading.component.html',
    styleUrls: ['./reading.component.less']
})
export class ReadingComponent implements OnInit{

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();

    imageSrc = ''
    text_to_present = ''
    correct_words:string[] = []
    target_words:string[] = []
    sentences:string[] = []
    currentSentenceIndex = 0

    constructor(
        private config: Config,
        private lessonService: LessonService,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

    ngOnInit(): void {
        this.text_to_present = this.currentSlide.text
        this.sentences = []
        for (let sentence of this.text_to_present.split('\n')){
            if (sentence.trim()){
                this.sentences.push(sentence.trim())
            }
        }
        this.target_words = this.remove_punct(this.text_to_present).toLowerCase().split(' ')
        this.lessonService.ListenFor("student_reply_request").subscribe((message:any) => {
            this.mark_correct_words(message)
        })
        this.lessonService.ListenFor("student_reply_response").subscribe((response:any) => {
            try{
                if(response.data.text.toLowerCase().includes('try the next sentence') && response.data.text.toLowerCase().includes('good job, you read')){
                    this.currentSentenceIndex+=1
                }
            } catch (error) {
                console.error(error);
            }
            
            console.log('in reading student_reply_response' ,response.data.text)
        })
    }

    remove_punct(text:string){
        let punctuationless = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        let finalString = punctuationless.replace(/\s{2,}/g," ");
        return finalString
    }

    mark_correct_words(message: string) {
        let message_words:string[] = this.remove_punct(message).toLowerCase().split(' ')
        for(let word of message_words){
            if(this.target_words.includes(word)){
                this.correct_words.push(word)
            }
        }
    }
}
