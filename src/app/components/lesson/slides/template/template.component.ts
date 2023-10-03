 import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {LessonService} from "../../../../services/lesson/lesson.service";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.less']
})
export class TemplateComponent extends BaseSlideComponent implements OnInit{

    texts:string[] = []
    correct_words:string[] = []
    target_words:string[] = []
    sentences:string[] = []
    currentSentenceIndex = 0

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

  remove_punct(text:string){
      let punctuationless = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      let finalString = punctuationless.replace(/\s{2,}/g," ");
      return finalString
  }

 
}