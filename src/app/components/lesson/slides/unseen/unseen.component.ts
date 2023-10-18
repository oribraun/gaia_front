import {Component, Input, OnInit} from '@angular/core';
import {LessonService} from "../../../../services/lesson/lesson.service";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'app-unseen',
  templateUrl: './unseen.component.html',
  styleUrls: ['./unseen.component.less']
})
export class UnseenComponent extends BaseSlideComponent implements OnInit{
  unseen_headline:string = 'Dummy Headline'
  unseen_text:string =''
  answer_text:string =''
  question_text:string =''
  all_questions:any[] = []
  multiple_choice_questions:any[] = []
  sentence_completion_questions:any[] = []
  open_questions:any[] = []
  question_index:number=0
  question_index_str:string='0'
  active_question:any=false
  checked_answer_text:string = ''
  checked_answer:any={}
  is_correct_answer:boolean=false
  checked_answers:any  = {}
  answers_texts:any  = {}
  multiple_choice_answers:any = {}
  submited_answers:any = {}
  checked:any = {}
  submited:boolean = false
 
  public questionTypes = {
    sentence_completion:'sentence_completion',
    multiple_choice: 'multiple_choice',
    open_question: 'open_question'
  }
  unseen_questions: any;
 
  constructor(
        protected override config: Config,
        private lessonService: LessonService,
        private sanitizer: DomSanitizer
    ) {
        super(config)
    }

  override ngOnInit(): void {
      super.ngOnInit();
      this.unseen_headline = this.currentSlide.slide_title
      this.unseen_text = this.currentSlide.unseen_text
      this.all_questions = this.currentSlide.all_questions || []
      console.log('all_questions', this.all_questions)
      if(this.all_questions.length==0){
        this.generateAllQuestions()
      } else {
        this.active_question=this.all_questions[this.question_index]
        console.log('active_question', this.active_question)
      }
      
      
      this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
        try {
          let resp_data = resp.data
          if (resp_data.source == "generate_multiple_choice_questions") {
            this.multiple_choice_questions = resp_data.questions
            this.addQuestionsToList(this.multiple_choice_questions,'multiple_choice')
          } else  if (resp_data.source == "generate_open_questions") {
            this.open_questions = resp_data.questions
            this.addQuestionsToList(this.open_questions,'open_question')
          } else  if (resp_data.source == "generate_sentence_completion_questions") {
            this.sentence_completion_questions = resp_data.questions
            this.addQuestionsToList(this.sentence_completion_questions,'sentence_completion')
          } else  if (resp_data.source == "check_answer") {
            this.setCheckedAnswer(resp_data.answer)
          } 
          
        } catch (e) {
          console.error(e)
        }

      })
 
    }

  addQuestionsToList(questions:any[], qType:string){
    for(let q of questions){
      let qq = Object()
      qq.question_type = qType
      qq.question = q
      this.all_questions.push(qq)
    }
    this.active_question = this.all_questions.shift()

    // this.all_questions.sort( () => Math.random() - 0.5 )
    this.all_questions.unshift(this.active_question)
    console.log('addQuestionsToList : ' +String(qType), this.all_questions)
    console.log('active', this.active_question)
    const save_questions_data = {
      "source": 'save_all_questions',
      "all_questions": this.all_questions ,
      "background":true,
      'stopAudio': true
    }
    this.lessonService.Broadcast("slideEventRequest", save_questions_data)
  }

  setCheckedAnswer(checkedAnswer:object={'explanation':'','is_correct_answer':false}){
    this.checked_answer = checkedAnswer
    this.checked_answer_text = this.checked_answer.explanation
    this.is_correct_answer = this.checked_answer.is_correct_answer
    this.checked_answers['_'+String(this.question_index)] = checkedAnswer
    this.answer_text = this.answers_texts.hasOwnProperty('_'+String(this.question_index)) ? this.answers_texts['_'+String(this.question_index)] : ''
    this.submited= this.submited_answers.hasOwnProperty('_'+String(this.question_index)) ? true : false
    console.log('submited',this.submited)
  }

  getCheckedAnswer(){
    if(this.checked_answers.hasOwnProperty('_'+String(this.question_index))){
      this.setCheckedAnswer(this.checked_answers['_'+String(this.question_index)])
    } else {
      this.setCheckedAnswer()
    }
  }

  async generateAllQuestions(){
    const open_questions_data = {
      "source": 'generate_open_questions',
      "n_questions": 5,
      "background":true,
      'stopAudio': true
    }
    this.lessonService.Broadcast("slideEventRequest", open_questions_data)
    console.log('generate_open_questions called')
    const multiple_choice_data = {
      "source": 'generate_multiple_choice_questions',
      "n_questions": 5,
      "background":true,
      'stopAudio': true
    }
    this.lessonService.Broadcast("slideEventRequest", multiple_choice_data)
    console.log('generate_multiple_choice_questions called')
    const sentence_completion_data = {
      "source": 'generate_sentence_completion_questions',
      "n_questions": 5,
      "background":true,
      'stopAudio': true
    }
    this.lessonService.Broadcast("slideEventRequest", sentence_completion_data)
    console.log('generate_sentence_completion_questions called')

  }
  
  sanitizeHtmlContent(htmlContnet:string){
      return this.sanitizer.bypassSecurityTrustHtml(htmlContnet)
    }
    
  checkAnswer(){
       const data = {
        "source": 'check_answer',
        "answer": this.answer_text,
        "question":this.active_question.question_type == 'multiple_choice' ? this.active_question.question.question: this.active_question.question,
        "question_type":this.active_question.question_type,
        'stopAudio': true
      }
      this.answers_texts['_'+String(this.question_index)] = this.answer_text
      this.submited_answers['_'+String(this.question_index)] = true
      this.submited=true
      this.lessonService.Broadcast("slideEventRequest", data)
    }

    nextQuestion(){
      if(this.question_index+1<this.all_questions.length){
        this.question_index=this.question_index+1
        this.question_index_str = String(this.question_index)
        this.active_question = this.all_questions[this.question_index]
        this.getCheckedAnswer()
      }
    }
    prevQuestion(){
      if(this.question_index>0){
        this.question_index=this.question_index-1
        this.question_index_str = String(this.question_index)
        this.active_question = this.all_questions[this.question_index]
        this.getCheckedAnswer()
      }
    }

    onMultipleChoiceQuestionChange(answer:any){
      function isEmpty(obj:any) {
        for (const prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
          }
        }

        return true;
      }
      if(this.multiple_choice_answers.hasOwnProperty('_'+String(this.question_index))){
        let ans = this.multiple_choice_answers['_'+String(this.question_index)]
        if(ans.hasOwnProperty(answer.answer)){
          delete ans[answer.answer]
          delete this.checked[answer.answer + String(this.question_index)] 
          if(isEmpty(ans)){
            delete this.multiple_choice_answers['_'+String(this.question_index)]
          }
        } else {
          ans[answer.answer] = answer.is_correct
          this.checked[answer.answer + String(this.question_index)] = true
        }
      } else {
        this.multiple_choice_answers['_'+String(this.question_index)] = {}
        this.multiple_choice_answers['_'+String(this.question_index)][answer.answer] = answer.is_correct
        this.checked[answer.answer + String(this.question_index)] = true
      }      
    }
    
}
