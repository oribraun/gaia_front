import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {LessonService} from "../../../../services/lesson/lesson.service";
import {BaseSlideComponent} from "../base-slide.component";
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.less']
})
export class WritingComponent extends BaseSlideComponent implements OnInit{

    generateEssayTopicInProgress = false;
    selectEssayTopicInProgress = false;
    checkEssayInProgress = false;
    essayType:string = 'opinion';
    essayText = ''
    essay_title:string = ''
    essayTopic:string = ''
    modalActive = false
    grades:string = ''
    practice:string = ''

    constructor(
      protected override config: Config,
      private lessonService: LessonService,
      private sanitizer:DomSanitizer,
  ) {
      super(config)
  }

  override ngOnInit(): void {
      super.ngOnInit();
      console.log('daniel',this.currentSlide)
      this.essayTopic = this.currentSlide.topic
      this.essayText = this.currentSlide.writing
      this.grades = this.currentSlide.grades
      this.practice = this.currentSlide.practice
      if(this.currentSlide.essay_type){
        this.essayType = this.currentSlide.essay_type
      }
       
       
      this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
        try {
          let resp_data = resp.data
          console.log('RESP DATA', resp_data)
          if (resp_data.source == "check_essay_button_click") {
            this.checkEssayInProgress = false;
            console.log(resp_data.grades)
            this.grades = resp_data.grades
            this.openModel()
          }
          else if (resp_data.source == "generate_essay_topic_button_click") {
            this.generateEssayTopicInProgress = false;
               
          }
          else if (resp_data.source == "select_essay_topic_button_click") {
            this.selectEssayTopicInProgress = false;
          }

        } catch (e){
          console.error(e)
        }

        
    })
  }

  openModel(){
    this.modalActive = true
  }

  closeModel(){
    this.modalActive = false
  }
  generateEssayTopic() {
      if (this.generateEssayTopicInProgress){
          return;
      }
      const data = {
          "source": "generate_essay_topic_button_click",
          "essay_type": this.essayType,
          "essay_topic": this.essayTopic,
          'stopAudio': true
      }
      this.generateEssayTopicInProgress = true;
      this.lessonService.Broadcast("slideEventRequest", data)
  }

  selectEssayTopic() {
      if (this.selectEssayTopicInProgress){
          return;
      }
      const data = {
          "source": "select_essay_topic_button_click",
          "essay_type": this.essayType,
          "essay_topic": this.essayTopic,
          'stopAudio': true
      }
      this.selectEssayTopicInProgress = true;
      this.lessonService.Broadcast("slideEventRequest", data)
  }
  
  checkEssay() {
      if (this.checkEssayInProgress){
          return;
      }
      const data = {
          "source": "check_essay_button_click",
          "essay_type": this.essayType,
          "essay_text": this.essayText,
          "essay_topic":this.essayTopic,
          'stopAudio': true
      }
      this.checkEssayInProgress = true;
      this.lessonService.Broadcast("slideEventRequest", data)
  }

}