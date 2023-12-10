 import {Component, Input, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.less']
})
export class TemplateComponent extends BaseSlideComponent implements OnInit{

    texts:string[] = [];
    texts_valid:boolean[] = [];
    correct_words:string[] = [];
    target_words:string[] = [];
    examples:string[] = [];
    currentSentenceIndex = 0;

    constructor(
      protected override config: Config,
      protected override lessonService: LessonService
  ) {
      super(config, lessonService);
  }

  override ngOnInit(): void {
      super.ngOnInit();
      console.log(this.currentSlide);
      this.texts = this.currentSlide.texts;
      this.examples = this.currentSlide.examples;
      for(let i = 0; i < this.texts.length; i = i + 1){
          this.texts_valid.push(false);
      }
      this.lessonService.ListenFor("currentObjectiveIndexChanged").subscribe((objective_index: any) => {
          this.handleObjectiveChanged(objective_index);
      });


  }

  remove_punct(text:string){
      const punctuationless = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      const finalString = punctuationless.replace(/\s{2,}/g," ");
      return finalString;
  }

  handleObjectiveChanged(objective_index:number){
      const data = {
          "source": (objective_index <= this.texts_valid.length) ? "run_next_objective" : "run_final_objective",
          "objective_index": objective_index,
          'stopAudio': true
      };
    //   alert('objective_index: ' + String(objective_index) + ' total text len = ' + String(this.texts_valid.length))
      this.lessonService.Broadcast("slideEventRequest", data);
      if(objective_index - 1 < this.texts_valid.length){
        this.texts_valid[objective_index - 1] = true;
      }
  }
}
