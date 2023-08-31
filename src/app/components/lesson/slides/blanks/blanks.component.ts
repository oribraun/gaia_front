import {Component, Input, OnInit } from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {LessonService} from "../../../../services/lesson/lesson.service";

@Component({
  selector: 'app-blanks',
  templateUrl: './blanks.component.html',
  styleUrls: ['./blanks.component.less']
})
export class BlanksComponent implements OnInit{

  @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
   imageSrc = ''
   optionIdx = Object()
   answers= Object()

  constructor(
      private config: Config,
      private lessonService: LessonService,

    ) {
      this.imageSrc = this.config.staticImagePath
  }

  ngOnInit(): void {
    let j = 0
    this.currentSlide.blanked_sentence.split(' ').forEach((word, index) => {
      if(word ==='________'){
        this.optionIdx[index]=j
        this.answers[j] = this.currentSlide.blanks_options[j][0]
        j+=1
      }
    })
    console.log(this.optionIdx)
  }
 
  onSelectChange(event: any, idx:number) {
    if (event.target){
      this.answers[idx] = event.target.value
       console.log(event.target.value, idx);
    }
  }

  submitAnswer(){
    let answer_arr:any = []
    let j = 0
    this.currentSlide.blanked_sentence.split(' ').forEach((word, index) => {
      if(word ==='________'){
        answer_arr.push(this.answers[j])
        j+=1
      } else {
        answer_arr.push(word)
      }
    })
    let answer = answer_arr.join(' ');
    this.lessonService.Broadcast("blanksSubmitEvent", answer)
  }

}
 
