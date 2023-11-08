import {Component, ElementRef, HostListener, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {start} from "repl";
import {HelperService} from "../../../main/services/helper.service";

declare var $: any;

@Component({
    selector: 'app-unseen',
    templateUrl: './unseen.component.html',
    styleUrls: ['./unseen.component.less'],
    encapsulation: ViewEncapsulation.None,
})

export class UnseenComponent extends BaseSlideComponent implements OnInit {
    @ViewChild('unseen_text_box') unseen_text_box!: ElementRef;
    @ViewChild('unseen_text') unseen_text!: ElementRef;

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

    contextMenuPosition = { top: '0px', left: '0px' };
    isContextMenuOpen = false;
    contextMenuTarget: any;
    currentMenuWord = {word: '', translate: ''};

    markups = [
        {startIndex: 0, endIndex: 15}
    ]

    markedCharIds: number[] = []

    public questionTypes = {
        sentence_completion:'sentence_completion',
        multiple_choice: 'multiple_choice',
        open_question: 'open_question'
    }

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
        protected helperService: HelperService,
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

    openContextMenu(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const targetContainWord = target.closest('.word') as HTMLElement;
        if (targetContainWord) {
            event.preventDefault();
            this.removeMenuHighLight();
            this.contextMenuTarget = targetContainWord;
            this.currentMenuWord.word = targetContainWord.innerText
            if (!this.contextMenuTarget.classList.contains('word-highlight')) {
                this.contextMenuTarget.classList.add('word-highlight');
                this.contextMenuTarget.classList.add('highlight-remove');
            }
            this.contextMenuPosition = {
                top: `${event.clientY}px`,
                left: `${event.clientX}px`
            };
            this.isContextMenuOpen = true;
            document.addEventListener('click', this.closeContextMenuOnOutsideClick);
        } else {
            if (this.isContextMenuOpen) {
                this.closeContextMenu();
            }
        }
    }

    closeContextMenuOnOutsideClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const contextMenu = target.closest('#contextMenu');
        if (!contextMenu) {
            this.closeContextMenu()
        }
    }

    removeMenuHighLight() {
        if (this.contextMenuTarget && this.contextMenuTarget.classList.contains('highlight-remove')) {
            this.contextMenuTarget.classList.remove('word-highlight');
            this.contextMenuTarget.classList.remove('highlight-remove');
        }
    }

    closeContextMenu() {
        this.isContextMenuOpen = false;
        this.currentMenuWord.word = '';
        this.currentMenuWord.translate = '';

        this.removeMenuHighLight();
        this.contextMenuTarget = null;

        document.removeEventListener('click', this.closeContextMenuOnOutsideClick);
    }

    handleMenuTranslateClick() {
        console.log(`handleMenuTranslateClick Clicked on ${this.currentMenuWord.word}`);
        this.helperService.translateGoogle(this.currentMenuWord.word).then((translate_word) => {
            this.currentMenuWord.translate = translate_word;
            // this.closeContextMenu();
        })
    }
    handleMenuAddVocabClick() {
        this.helperService.translateGoogle(this.currentMenuWord.word).then((translate_word) => {
            this.currentMenuWord.translate = translate_word;
            this.lessonService.Broadcast("slideAddToVocab", {word: this.currentMenuWord.word, translate: translate_word });
            this.closeContextMenu();
        })
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
                this.initMultipleOptions(q, i);
            }
        }
    }

    initMultipleOptions(q: any, question_index: number) {
        console.log('this.unseenAnswers[q.question_id]', this.unseenAnswers[q.question_id])
        if (this.unseenAnswers[q.question_id].answer_text) {
            this.multiple_choice_answers['_' + String(question_index)] = {}
            let options = q.question.answers
            for (let i in options) {
                let is_correct = options[i].is_correct
                let answer_text = options[i].answer
                this.multiple_choice_answers['_' + String(question_index)][answer_text] = is_correct
                this.checked[answer_text + String(question_index)] = true;
            }
        }
    }

    setResponseAnswer(data: any) {
        const current_question = this.currentSlide.all_questions[this.question_index];
        this.unseenAnswers[current_question.question_id].explanation = data.explanation;
        this.unseenAnswers[current_question.question_id].is_correct_answer = data.is_correct_answer;
        if(current_question.question_type == "multiple_choice" && !this.isEmpty(current_question.question.answers)){
            this.unseenAnswers[current_question.question_id].answer_text = this.multiple_choice_answers['_'+String(this.question_index)];
            this.currentSlide.all_answers[current_question.question_id] = this.unseenAnswers[current_question.question_id]
            this.initMultipleOptions(current_question, this.question_index);
        }
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
        let startedHintHighlight: any;
        for (const token of tokens) {
            if (startIndex && endIndex) {
                if (currentIndex >= startIndex && currentIndex <= endIndex) {
                    if (!startedHintHighlight) {
                        startedHintHighlight = document.createElement('span')
                        startedHintHighlight.classList.add('hint');
                        startedHintHighlight.classList.add('highlight');
                    }
                } else {
                    if (startedHintHighlight) {
                        spanList.push(startedHintHighlight.outerHTML);
                    }
                    startedHintHighlight = null;
                }
            }
            if (/\w+/.test(token)
                && token.length >= this.wordLength
                && this.excludeWords.indexOf(token.toLowerCase()) == -1) {
                // Create a <span> element for words

                const tokenSpan = []
                let letterCount = 0;
                for (let t of token) {
                    const span = document.createElement('span');
                    span.textContent = t;
                    span.id = 'char_' + (currentIndex + letterCount);
                    span.classList.add(t + '_' + letterCount);
                    if (!letterCount) {
                        span.classList.add('word-char-first');
                    }
                    if (letterCount === token.length - 1) {
                        span.classList.add('word-char-last');
                    }
                    if (this.markedCharIds.indexOf(currentIndex + letterCount) > -1) {
                        span.classList.add('char-highlight');
                    }
                    tokenSpan.push(span.outerHTML);
                    letterCount++;
                }
                const span = document.createElement('span');
                span.innerHTML = tokenSpan.join('');
                span.id = token + '_' + wordCount;
                span.classList.add('word');
                if (word_ids.indexOf(span.id) > -1) {
                    span.classList.add('word-highlight');
                }
                if (startedHintHighlight) {
                    startedHintHighlight.appendChild(span)
                } else {
                    spanList.push(span.outerHTML);
                }
            } else {
                // Append punctuation as it is (without wrapping in <span>)
                let letterCount = 0;
                const tokenSpan = []
                if (startedHintHighlight) {
                    for (let t of token) {
                        const span = document.createElement('span');
                        span.textContent = t;
                        span.id = 'char_' + (currentIndex + letterCount);
                        if (this.markedCharIds.indexOf(currentIndex + letterCount) > -1) {
                            span.classList.add('char-highlight');
                        }
                        startedHintHighlight.appendChild(span)
                        letterCount++;
                    }
                } else {
                    // const span = document.createElement('span');
                    // span.textContent = token;
                    for (let t of token) {
                        const span = document.createElement('span');
                        span.textContent = t;
                        span.id = 'char_' + (currentIndex + letterCount);
                        if (this.markedCharIds.indexOf(currentIndex + letterCount) > -1) {
                            span.classList.add('char-highlight');
                        }
                        tokenSpan.push(span.outerHTML);
                        letterCount++;
                    }
                    spanList.push(tokenSpan.join(''));
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
                const word = e.target.closest('.word');
                const id = word.id;
                const value = word.innerText;
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

    getSelection(e: any) {
        console.log('e', e)
        let refreshHtml = false;
        const selection = window.getSelection();
        console.log('selection', selection)
        if (selection && selection.toString() !== '' && selection.focusNode?.parentElement?.closest('.unseen_text')) {
            console.log('Selected Text:', selection.toString());
            const range = selection.getRangeAt(0);
            const startContainer = range.startContainer;
            const startOffset = range.startOffset;
            const endContainer = range.endContainer;
            const endOffset = range.endOffset;

            const start_id = startContainer?.parentElement?.id.replace(/[^0-9]/g, '');
            const end_id = endContainer?.parentElement?.id.replace(/[^0-9]/g, '');
            if (start_id && end_id) {
                for (let i = parseInt(start_id); i <= parseInt(end_id); i++) {
                    if (this.markedCharIds.indexOf(i) === -1) {
                        this.markedCharIds.push(i)
                        refreshHtml = true;
                    }
                }
            }
            console.log('refreshHtml', refreshHtml)
            console.log('this.markedCharIds', this.markedCharIds)
            if (refreshHtml) {
                this.resetUnseenHtml()
            }
        }
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
            'markedChars': this.markedCharIds,
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

    eraseMarks() {
        this.markedCharIds = [];
        this.resetUnseenHtml();
    }

    printUnseen() {
        window.print();
        return;
        // if (this.unseen_text_box) {
        //     const myWindow = window.open('', 'my div', 'height=400,width=600');
        //     if (myWindow) {
        //         var style = window.getComputedStyle(this.unseen_text_box.nativeElement);
        //         console.log('style', style)
        //         myWindow.document.write(`
        //             <html><head><style>
        //                 h2 {
        //                     font-size: calc(1.325rem + .9vw);
        //                 }
        //                 .box {
        //                     position: relative;
        //                     background: #ccc;
        //                     padding: 1em;
        //                     height: 100%;
        //                     overflow: hidden;
        //                     overflow-y: auto;
        //                     scrollbar-color: #4285F4 #F5F5F5;
        //                 }
        //                 @media print {
        //                     .box {
        //                         position: relative;
        //                         background: #ccc;
        //                         padding: 1em;
        //                         height: 100%;
        //                         overflow: hidden;
        //                         overflow-y: auto;
        //                         scrollbar-color: #4285F4 #F5F5F5;
        //                     }
        //                 }
        //             </style></head><body>
        //         `);
        //         myWindow.document.write(this.unseen_text_box.nativeElement.outerHTML);
        //         myWindow.document.close();
        //         myWindow.focus(); // necessary for IE >= 10
        //         myWindow.print();
        //         // myWindow.close();
        //     }
        // }
    }
}
