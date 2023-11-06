import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {BaseSlideComponent} from "../base-slide.component";
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ChatMessage} from "../../../main/entities/chat_message";
import {environment} from "../../../../../environments/environment";
import {SpeechRecognitionService} from "../../../main/services/speech-recognition/speech-recognition.service";

declare var $: any;

@Component({
    selector: 'app-speaking',
    templateUrl: './speaking.component.html',
    styleUrls: ['./speaking.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class SpeakingComponent extends BaseSlideComponent implements OnInit {
    unseen_headline:string = 'Dummy Headline'
    unseen_text:string =''
    answer_text:string =''
    question_text:string =''
    all_questions:any[] = []
    all_answers:any = {}
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

    currentHint = '';
    currentUnseenWords: any[] = [{id: 'children_20', value: 'children'}, {id: 'the_24', value: 'the'}, {id: 'One_68', value: 'One'}];
    excludeWords: string[] = []
    wordLength = 3;
    unseenTextHtml = '';

    public questionTypes = {
        sentence_completion:'sentence_completion',
        multiple_choice: 'multiple_choice',
        open_question: 'open_question'
    }
    unseen_questions: any;

    messages: ChatMessage[] = [];

    disableButton = false;

    recognitionPPTSubscribe: any

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService,
        private sanitizer: DomSanitizer
    ) {
        super(config, lessonService)

        if (environment.is_mock) {
            this.messages = [
                new ChatMessage({type: 'computer', message: 'Hi! Can you please fill in the blanks to complete the sentence? ____ is Danny, he is here'}),
                new ChatMessage({type: 'user', message: 'im good how are you?'}),
                new ChatMessage({type: 'computer', message: 'fine'}),
                new ChatMessage({type: 'user', message: 'hi'}),
            ]
        }
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.unseen_headline = this.currentSlide.slide_title
        this.unseen_text = this.currentSlide.unseen_text
        this.all_questions = this.currentSlide.all_questions || []
        this.all_answers = this.currentSlide.all_answers || {}
        this.question_index = this.currentSlide.question_index || 0
        this.question_index_str = String(this.question_index)
        console.log('all_questions', this.all_questions)
        console.log('all_answers', this.all_answers)
        console.log('all_question_index', this.question_index)
        if(this.all_questions.length==0){
            this.generateAllQuestions()
        } else {
            this.active_question=this.all_questions[this.question_index]
            if(this.active_question.question_type == 'sentence_completion'){
                this.answer_text = this.active_question.question
            }
        }
        this.handleAnswers()
        this.getCheckedAnswer()
        this.resetUnseenHtml();

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
                } else  if (resp_data.source == "get_hints") {
                    console.log('get_hints', resp_data)
                }

            } catch (e) {
                console.error(e)
            }

        })

    }

    setUpUnseenTextHtml(startIndex: any = null, endIndex: any = null, words: any[] = []) {
        // const words = this.unseen_text.split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/);
        const word_ids = words.map(o => o.id);
        const tokens = this.unseen_text.split(/([\s.,!?;:]+)/);
        // console.log('tokens', tokens)
        const spanList = [];
        let wordCount = 0;
        let currentIndex = 0;
        let startedHighlight: any;
        for (const token of tokens) {
            if (startIndex && endIndex) {
                if (currentIndex >= startIndex && currentIndex <= endIndex) {
                    if (!startedHighlight) {
                        startedHighlight = document.createElement('span')
                        startedHighlight.classList.add('hint');
                        startedHighlight.classList.add('highlight');
                    }
                } else {
                    if (startedHighlight) {
                        spanList.push(startedHighlight.outerHTML);
                    }
                    startedHighlight = null;
                }
            }
            if (/\w+/.test(token)
                && token.length >= this.wordLength
                && this.excludeWords.indexOf(token.toLowerCase()) == -1) {
                // Create a <span> element for words
                const span = document.createElement('span');
                span.textContent = token;
                span.id = token + '_' + wordCount;
                span.classList.add('word');
                if (word_ids.indexOf(span.id) > -1) {
                    span.classList.add('highlight-word');
                }
                if (startedHighlight) {
                    startedHighlight.appendChild(span)
                } else {
                    spanList.push(span.outerHTML);
                }
            } else {
                // Append punctuation as it is (without wrapping in <span>)
                if (startedHighlight) {
                    startedHighlight.appendChild(document.createTextNode(token))
                } else {
                    const span = document.createElement('span');
                    span.textContent = token;
                    spanList.push(token);
                }
            }
            wordCount++;
            currentIndex += token.length
        }
        // console.log('spanList', spanList)
        this.unseenTextHtml = spanList.join('')
        // console.log('this.unseenTextHtml', this.unseenTextHtml)
        setTimeout(() => {
            $('.word').on('click', (e: any) => {
                // console.log('e.target', e.target)
                const id = e.target.id;
                const value = e.target.innerText;
                console.log('value', value)
                const ids = this.currentUnseenWords.map(o => o.id);
                const index = ids.indexOf(id);
                if (index > -1) {
                    this.currentUnseenWords.splice(index, 1);
                } else {
                    this.currentUnseenWords.push({id: id, value: value})
                }
                this.resetUnseenHtml();
            })
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
        if(this.active_question.question_type == 'sentence_completion'){
            this.answer_text = this.active_question.question
        }

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

    setCheckedAnswer(checkedAnswer:any={'explanation':'','is_correct_answer':false, 'answer_text_or_options':{}, 'question_type':''}, question_index=-1){
        if(question_index == -1){
            question_index = this.question_index
        }
        this.checked_answer = checkedAnswer
        this.checked_answer_text = this.checked_answer.explanation
        this.is_correct_answer = this.checked_answer.is_correct_answer
        this.checked_answers['_'+String(question_index)] = checkedAnswer
        if(this.answers_texts.hasOwnProperty('_'+String(question_index))){
            this.answer_text = this.answers_texts['_'+String(question_index)]
        } else {
            this.answer_text = ''
            if(this.active_question.question_type == 'sentence_completion'){
                this.answer_text = this.active_question.question
            }

        }
        if(checkedAnswer.question_type == "multiple_choice" && !this.isEmpty(checkedAnswer.answer_text_or_options)){
            this.multiple_choice_answers['_'+String(question_index)] = {}
            let options = checkedAnswer['answer_text_or_options']
            for(let answer_text in options){
                let is_correct = options[answer_text]
                this.multiple_choice_answers['_'+String(question_index)][answer_text] = is_correct
                this.checked[answer_text + String(question_index)] = true
            }
        }
        this.submited= this.submited_answers.hasOwnProperty('_'+String(question_index)) ? true : false
    }

    handleAnswers(){
        for(let key in this.all_answers){
            let answer = this.all_answers[key]
            let question_index = answer['question_idx']
            this.answers_texts[key] = answer['answer_text']
            this.submited_answers[key] = true
            let checkedAnswer:any = {'explanation':answer['explanation'],'is_correct_answer':answer['is_correct_answer'],'answer_text_or_options':answer['answer_text'], 'question_type':answer['question_type']}
            this.setCheckedAnswer(checkedAnswer,question_index)
        }
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
            "answer": this.active_question.question_type == 'multiple_choice' ? this.multiple_choice_answers['_'+String(this.question_index)] : this.answer_text,
            "question":this.active_question.question_type == 'multiple_choice' ? this.active_question.question.question: this.active_question.question,
            "question_type":this.active_question.question_type,
            "question_idx":this.question_index,
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

    goToQuestionNumber(number:number){
        if(number>-1 && number<this.all_questions.length){
            this.question_index=number
            this.question_index_str = String(this.question_index)
            this.active_question = this.all_questions[this.question_index]
            this.getCheckedAnswer()
        }
    }
    onMultipleChoiceQuestionChange(answer:any){

        if(this.multiple_choice_answers.hasOwnProperty('_'+String(this.question_index))){
            let ans = this.multiple_choice_answers['_'+String(this.question_index)]
            if(ans.hasOwnProperty(answer.answer)){
                delete ans[answer.answer]
                delete this.checked[answer.answer + String(this.question_index)]
                if(this.isEmpty(ans)){
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

    nextSlide(){
        const data = {
            "source": "continue_to_next_slide_click",
            'stopAudio': true
        }
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    getHints(){
        this.currentHint = this.active_question.hints['guidance'];
        const correct_answer = this.active_question.hints['correct_answer'];
        const guidance = this.active_question.hints['guidance'];
        const quotes = this.active_question.hints['quotes'];
        // console.log('correct_answer', correct_answer)
        // console.log('guidance', guidance)
        // console.log('quotes', quotes)
        this.markHint()
        // alert(this.active_question.hints['guidance'])
        // const data = {
        //   "source": "get_hints",
        //   "question":this.active_question.question_type == 'multiple_choice' ? this.active_question.question.question: this.active_question.question,
        //   "question_type":this.active_question.question_type,
        //   "question_idx":this.question_index
        // }
        // this.lessonService.Broadcast("slideEventRequest", data)
    }

    closeHints() {
        this.currentHint = '';
        this.resetUnseenHtml();
    }

    resetUnseenHtml() {
        if (this.currentHint) {
            this.markHint();
        } else {
            this.setUpUnseenTextHtml(null, null, this.currentUnseenWords)
        }
    }

    markHint() {
        const quotes = this.active_question.hints['quotes'];
        const startIndex = this.unseen_text.indexOf(quotes);
        const endIndex = startIndex + quotes.length;
        this.setUpUnseenTextHtml(startIndex, endIndex, this.currentUnseenWords)
    }

    isEmpty(obj:any) {
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    translate(index: number) {
        if (!this.messages[index].translatedMessage) {
            this.translateGoogle(this.messages[index]).then((translated_text: string) => {
                this.messages[index].translatedMessage = translated_text;
                this.messages[index].showTranslated = true;
            }).catch((e) => {
                console.log('translateGoogle e', e)
            })
        } else {
            this.messages[index].showTranslated = !this.messages[index].showTranslated;
        }
    }

    translateGoogle(currentMessage: ChatMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            var sourceLang = 'en';
            var targetLang = 'he';

            var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(currentMessage.message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('')
                    resolve(translated_text);
                } catch (e) {
                    reject(e)
                }
            });
        })
    }

    onRecognitionPTTResults = (results: any) => {
        console.log("onRecognitionPTTResults results",results)
        const recognitionText = results.text;
        if (results.isFinal) {
            console.log('onRecognitionPTTResults final', recognitionText)
            // this.onButtonClick(recognitionText);
            this.messages.push(
                new ChatMessage({type: 'user', message: recognitionText}),
            )
        }
    }

    onButtonClick(ans: string) {
        // mode can be "word_to_picture" or "word_to_native_text" or "word_to_native_audio"
        // const data = {"source": "word_translator_ans", "answer": ans}
        // this.submitAnswerPending = true
        // this.lessonService.Broadcast("slideEventRequest", data)
    }

    onPTTPressDown() {
        if (!this.disableButton) {
            this.speechRecognitionService.PTTInProgress = true;
            this.recognitionPPTSubscribe = this.speechRecognitionService.onPTTResults.subscribe(this.onRecognitionPTTResults);
            this.speechRecognitionService.startListening();
            // this.speechRecognitionService.activateNativeLang(true);
        }
    }
    onPTTPressUp () {
        if (!this.disableButton) {
            // this.speechRecognitionService.resetToOrigLang();
            if (this.recognitionPPTSubscribe) {
                setTimeout(() => {
                    this.speechRecognitionService.PTTInProgress = false;
                    this.speechRecognitionService.stopListening();
                    this.recognitionPPTSubscribe.unsubscribe(this.onRecognitionPTTResults);
                }, 500)
            }
        }
    }
}
