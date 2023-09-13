import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../../services/lesson/lesson.service";

@Component({
    selector: 'app-word-translator',
    templateUrl: './word-translator.component.html',
    styleUrls: ['./word-translator.component.less']
})
export class WordTranslatorComponent  extends BaseSlideComponent {
    submitAnswerPending:boolean =false;

    constructor(
        protected override config: Config,
        private lessonService: LessonService,
        
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
      if (this.currentSlide.mode == "word_to_picture" || this.currentSlide.mode == "word_to_native_text") {
        const data = {"source": "word_translator_ans", "answer": ans}
        this.submitAnswerPending = true
        this.lessonService.Broadcast("slideEventRequest", data)
      }
    }
    example_how_to_use_is_active() {
        if (this.slideData?.is_active) {
            console.log('asdf')
        }
    }

}
