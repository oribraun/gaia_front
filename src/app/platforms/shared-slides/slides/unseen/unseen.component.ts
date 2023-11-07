import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {start} from "repl";

declare var $: any;

@Component({
    selector: 'app-unseen',
    templateUrl: './unseen.component.html',
    styleUrls: ['./unseen.component.less'],
    encapsulation: ViewEncapsulation.None,
})

export class UnseenComponent extends BaseSlideComponent implements OnInit {
    @ViewChild('unseen_text_box') unseen_text_box!: ElementRef;

    current_counter:any = {}
    question_index:number=0
    currentHint = '';
    currentHintAudio: any;
    unseenTextHtml = '';
    checked:any = {}

    // all_answers:any = {}
    private timers:any = {}
    private multiple_choice_answers:any = {}

    // currentUnseenWords: any[] = [{id: 'children_20', value: 'children'}, {id: 'the_24', value: 'the'}, {id: 'One_68', value: 'One'}];
    private currentUnseenWords: any[] = [];
    private excludeWords: string[] = []
    private wordLength = 3;

    unseenAnswers: any = {}

    submitInProgress = false;

    zoom: number = 1;
    zoomStep: number = .1;
    zoomLimits = {in: 2, out: .8}

    public questionTypes = {
        sentence_completion:'sentence_completion',
        multiple_choice: 'multiple_choice',
        open_question: 'open_question'
    }

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
    ) {
        super(config, lessonService)
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.question_index = this.currentSlide.question_index || 0

        this.initUnseenAnswers();
        this.handleCounter(this.question_index)
        this.resetUnseenHtml();

        this.listenToSlideEvents();

    }

    initUnseenAnswers() {
        for (let i = 0; i < this.currentSlide.all_questions.length; i++) {
            const q = this.currentSlide.all_questions[i];
            if (this.currentSlide.all_answers[q.question_id]) {
                this.unseenAnswers[q.question_id] = this.currentSlide.all_answers[q.question_id];
                this.unseenAnswers[q.question_id].explanation = "";
            } else {
                this.unseenAnswers[q.question_id] = {
                    "pace": 0,
                    "score": 0,
                    "hint_used": false,
                    "answer_text": "",
                    "explanation": "",
                    "question_idx": i,
                    "question_type": q.question_type,
                    "is_correct_answer": false
                }
                if(q.question_type == 'sentence_completion'){
                    this.unseenAnswers[q.question_id].answer_text = q.question
                }
            }
            if(q.question_type == "multiple_choice" && !this.isEmpty(q.question.answers)){
                this.initMultipleOptions(q);
            }
        }
    }

    initMultipleOptions(q: any) {
        this.multiple_choice_answers['_'+String(this.question_index)] = {}
        let options = q.question.answers
        for(let i in options){
            console.log('o', options[i])
            let is_correct = options[i].is_correct
            let answer_text = options[i].answer
            this.multiple_choice_answers['_'+String(this.question_index)][answer_text] = is_correct
            this.checked[answer_text + String(this.question_index)] = true
        }
    }

    setResponseAnswer(data: any) {
        const current_question = this.currentSlide.all_questions[this.question_index];
        this.unseenAnswers[current_question.question_id].explanation = data.explanation;
        this.unseenAnswers[current_question.question_id].is_correct_answer = data.is_correct_answer;
    }

    listenToSlideEvents() {
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            try {
                let resp_data = resp.data
                if (resp_data.source == "check_answer") {
                    this.setResponseAnswer(resp_data.answer);
                    this.submitInProgress = false;
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
        const tokens = this.currentSlide.unseen_text.split(/([\s.,!?;:]+)/);
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

    checkAnswer(){
        if (this.submitInProgress) {
            return;
        }
        const current_question = this.currentSlide.all_questions[this.question_index];
        this.unseenAnswers[current_question.question_id].pace = this.current_counter.counter;
        const data = {
            "source": 'check_answer',
            "answer": current_question.question_type == 'multiple_choice' ? this.multiple_choice_answers['_'+String(this.question_index)] : this.unseenAnswers[current_question.question_id].answer_text,
            "question":current_question.question_type == 'multiple_choice' ? current_question.question.question: current_question.question,
            "question_type":current_question.question_type,
            "question_idx":this.question_index,
            "question_id":current_question.question_id,
            "pace":this.unseenAnswers[current_question.question_id].pace,
            'hint_used':this.unseenAnswers[current_question.question_id].hint_used,
            'stopAudio': true
        }
        console.log('data', data);
        this.submitInProgress = true;
        this.current_counter.submited=true;
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    nextQuestion(){
        if(this.question_index+1<this.currentSlide.all_questions.length){
            this.question_index=this.question_index+1;
        }
    }
    prevQuestion(){
        if(this.question_index>0){
            this.question_index=this.question_index-1;
        }
    }

    goToQuestionNumber(number:number){
        if(number>-1 && number<this.currentSlide.all_questions.length){
            this.question_index=number;
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
        const current_question = this.currentSlide.all_questions[this.question_index];
        const correct_answer = current_question.hints['correct_answer'];
        const audio_path = current_question.hints['audio_path'];
        const guidance = current_question.hints['guidance'];
        const quotes = current_question.hints['quotes'];
        this.unseenAnswers[current_question.question_id].hint_used = true;
        if (audio_path) {
            this.playHint(audio_path)
        } else {
            this.currentHint = current_question.hints['guidance'];
            this.markHint()
        }
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
        const current_question = this.currentSlide.all_questions[this.question_index];
        const quotes = current_question.hints['quotes'];
        const startIndex = this.currentSlide.unseen_text.indexOf(quotes);
        const endIndex = startIndex + quotes.length;
        this.setUpUnseenTextHtml(startIndex, endIndex, this.currentUnseenWords)
        this.scrollToHint();
    }

    playHint(audio_path: string) {
        if (this.currentHintAudio) {
            this.currentHintAudio.pause();
            this.currentHintAudio = null;
        } else {
            const audio = new Audio()
            this.currentHintAudio = audio;
            audio.src = audio_path
            audio.play();
        }
    }

    scrollToHint() {
        setTimeout(() => {
            if (this.unseen_text_box) {
                const boxElement = this.unseen_text_box.nativeElement;
                const boxREct = boxElement.getBoundingClientRect();
                const hints = document.getElementsByClassName('hint')
                if (hints && hints.length) {
                    const hintElement: any = hints[0]
                    const hintRect = hintElement.getBoundingClientRect();
                    const isFullyVisible =
                        hintRect.top >= boxREct.top &&
                        hintRect.bottom <= boxREct.bottom;

                    if (!isFullyVisible) {
                        // Element is not fully visible within the container, so scroll to it.
                        boxElement.scrollTo({
                            top: hintElement.offsetTop - boxElement.offsetTop,
                            behavior: 'smooth',
                        });
                    }
                }
            }
        })
    }

    isEmpty(obj:any) {
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    handleCounter(question_idx:number){
        this.pauseAllCounters()
        if(!this.timers.hasOwnProperty(question_idx)) {
            this.timers[question_idx] = this.createTimer()
        } else {
            this.timers[question_idx].active = true
        }
        this.current_counter = this.timers[question_idx]
    }

    createTimer(){
        let Timer = Object()
        Timer.active = true
        Timer.counter = 0
        Timer.minutes = 0
        Timer.seconds = 0
        Timer.submited = false
        Timer.intervalId = setInterval(this.progressTimer, 1000,Timer);
        return Timer

    }

    pauseAllCounters(){
        for(const key in this.timers){
            this.timers[key].active = false
        }
    }

    progressTimer(self:any) {
        if (self.active && !self.submited){
            self.counter= self.counter+1
            self.minutes = Math.floor(self.counter/60)
            self.seconds = self.counter%60
        }
    }

    zoomIn() {
        if (this.zoom < this.zoomLimits.in) {
            this.zoom += this.zoomStep;
        }
    }
    zoomOut() {
        if (this.zoom > this.zoomLimits.out) {
            this.zoom -= this.zoomStep;
        }
    }
}
