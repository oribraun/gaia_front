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
    texts_valid:boolean[]=[]
    correct_words:string[] = []
    target_words:string[] = []
    examples:string[] = []
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
      this.examples = this.currentSlide.examples
      for(let i=0; i<this.texts.length; i=i+1){
          this.texts_valid.push(false)
      }
      this.lessonService.ListenFor("currentObjectiveIndexChanged").subscribe((objective_index: any) => {
          this.handleObjectiveChanged(objective_index)
      })
      
       
  }

  remove_punct(text:string){
      let punctuationless = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      let finalString = punctuationless.replace(/\s{2,}/g," ");
      return finalString
  }

  handleObjectiveChanged(objective_index:number){
    // if(objective_index == 1){
      const data = {
          "source": "slide_intro_ended",
          "objective_index": objective_index,
          'stopAudio': true
      }
      this.lessonService.Broadcast("slideEventRequest", data)
      if(objective_index-1<this.texts_valid.length){
        this.texts_valid[objective_index-1] = true
      }
      
    // }
    // alert(objective_index)
  }
}