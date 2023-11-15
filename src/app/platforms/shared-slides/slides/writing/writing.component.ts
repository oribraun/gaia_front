import {Component, Input, OnInit} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {AngularEditorConfig} from '@kolkov/angular-editor';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

@Component({
    selector: 'app-writing',
    templateUrl: './writing.component.html',
    styleUrls: ['./writing.component.less']
})
export class WritingComponent extends BaseSlideComponent implements OnInit{

    checkEssayInProgress:boolean = false;
    spinnerEnabled:boolean = false
    endEssayInProgress:boolean = false;
    essayType:string = 'opinion';
    essayText = ''
    essay_title:string = ''
    loaded_text:string = ''
    essayTopic:string = ''
    modalActive = false
    grades:string = ''
    score:number = 0
    grades_html:any = ''
    practice:string = ''
    boostEssayInProgress:boolean =false;
    improveEssayInProgress:boolean =false;
    load_fields:string[] = []
    timer:any = null
    add_loaded_text_to_dynamic_text:boolean = false
    section_variables:any = {}
    editorConfig: AngularEditorConfig = {
        spellcheck: false,
        editable: true,
        showToolbar: false}

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
        private sanitizer:DomSanitizer,
    ) {
        super(config, lessonService)
    }



    override ngOnInit(): void {
        super.ngOnInit();
        this.spinnerEnabled  = false;
        this.essayTopic = this.currentSlide.topic
        this.essayText = this.currentSlide.writing
        this.grades = this.currentSlide.grades
        this.score = this.currentSlide.score
        this.grades_html = this.sanitizer.bypassSecurityTrustHtml(this.grades.replace(/(?:\r\n|\r|\n)/g, '<br/>'));
        this.practice = this.currentSlide.practice
        if(this.currentSlide.essay_type){
            this.essayType = this.currentSlide.essay_type
        }
        this.timer = this.createTimer()
        this.load_fields = this.currentSlide.load_fields
        this.add_loaded_text_to_dynamic_text = this.currentSlide.add_loaded_text_to_dynamic_text
        this.loaded_text = ''
        this.section_variables = this.currentSlide.section.section_variables
        console.log('section_variables_init',this.currentSlide.section.section_variables)
        console.log('section_variables_init2',this.currentSlide.section_variables)

        for (let i=0; i < this.load_fields.length; i++) {
            let field = this.load_fields[i]
            if (this.section_variables[field]!=undefined) {
                this.loaded_text += this.section_variables[field]
            }
        }
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            try {
                let resp_data = resp.data
                console.log('resp_data', resp_data)
                if (resp_data.source == "check_essay_button_click") {
                    this.checkEssayInProgress = false;
                    console.log(resp_data.grades)
                    this.grades = resp_data.grades
                    this.score = resp_data.score

                    if (resp_data.grades!=""){
                        this.grades_html = this.sanitizer.bypassSecurityTrustHtml(this.grades.replace(/(?:\r\n|\r|\n)/g, '<br/>'));
                        console.log(this.grades)
                        console.log(this.score)
                        this.openModal()
                    }
                }
                else if (resp_data.source == "improve_essay_button_click") {
                    this.improveEssayInProgress = false;
                    this.essayText = resp_data.essay
                }
                else if (resp_data.source == "boost_essay_button_click") {
                    this.boostEssayInProgress = false;
                    this.essayText = resp_data.essay
                }
                else if (resp_data.source == "continue_to_next_slide_click") {
                    console.log('section_variables_end_slide', resp_data.section_variables)
                    this.section_variables = resp_data.section_variables
                    this.currentSlide.section.section_variables = resp_data.section_variables
                    this.endEssayInProgress = false;
                }
                this.spinnerEnabled  = false;



            } catch (e){
                console.error(e)
            }


        })
    }

    openModal(){
        this.modalActive = true
    }

    closeModel(){
        this.modalActive = false
    }

    improveEssay() {
        if (this.improveEssayInProgress){
            return;
        }
        const data = {
            "source": "improve_essay_button_click",
            "essay_type": this.essayType,
            "essay_text": this.essayText,
            "essay_topic":this.essayTopic,
            'stopAudio': true
        }
        this.improveEssayInProgress = true;
        this.spinnerEnabled  = true;
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    boostEssay() {
        if (this.boostEssayInProgress){
            return;
        }
        const data = {
            "source": "boost_essay_button_click",
            "essay_type": this.essayType,
            "essay_text": this.essayText,
            "essay_topic":this.essayTopic,
            'stopAudio': true
        }
        this.boostEssayInProgress = true;
        this.spinnerEnabled  = true;
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
            "time_in_sec":this.timer.minutes*60 + this.timer.seconds,
            'stopAudio': true
        }
        this.checkEssayInProgress = true;
        this.spinnerEnabled  = true;
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    endSlide() {
        if (this.endEssayInProgress){
            return;
        }
        const data = {
            "source": "continue_to_next_slide_click",
            "essay_text": this.essayText,
            'stopAudio': true
        }
        this.endEssayInProgress = true;
        this.spinnerEnabled  = true;
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    createTimer(){
        let Timer = Object()
        Timer.active = true
        Timer.counter = 0
        Timer.minutes = 0
        Timer.minutesStr = '00'
        Timer.seconds = 0
        Timer.secondsStr = '00'
        Timer.submited = false
        Timer.intervalId = setInterval(this.progressTimer, 1000,Timer);
        return Timer
    }

    progressTimer(self:any) {
        if (self.active && !self.submited){
            self.counter= self.counter+1
            self.minutes = Math.floor(self.counter/60)
            self.minutesStr = self.minutes.toString().length < 2 ? '0' + self.minutes: self.minutes
            self.seconds = self.counter%60
            self.secondsStr = self.seconds.toString().length < 2 ? '0' + self.seconds: self.seconds
        }
    }

}
