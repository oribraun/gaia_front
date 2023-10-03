import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {LessonService} from "../../../../services/lesson/lesson.service";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.less']
})
export class WritingComponent extends BaseSlideComponent implements OnInit{

    texts:string[] = []
    correct_words:string[] = []
    target_words:string[] = []
    sentences:string[] = []
    currentSentenceIndex = 0
    htmlContent = ''
    constructor(
      protected override config: Config,
      private lessonService: LessonService,
  ) {
      super(config)
  }

  override ngOnInit(): void {
      super.ngOnInit();
      console.log(this.currentSlide)
      this.texts = this.currentSlide.texts
      this.sentences = []
       
  }

}