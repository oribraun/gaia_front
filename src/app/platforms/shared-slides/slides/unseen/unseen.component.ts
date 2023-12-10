import {
    Component,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {start} from "repl";
import {HelperService} from "../../../main/services/helper.service";

declare let $: any;

@Component({
    selector: 'app-unseen',
    templateUrl: './unseen.component.html',
    styleUrls: ['./unseen.component.less'],
    encapsulation: ViewEncapsulation.None
})

export class UnseenComponent extends BaseSlideComponent implements OnInit, OnDestroy {
    @ViewChild('unseen_text_box') unseen_text_box!: ElementRef;
    @ViewChild('unseen_text') unseen_text!: ElementRef;
    @ViewChild('questions') questions!: ElementRef;

    current_counter:any = {};
    question_index:number = 0;
    currentHint = '';
    showHint = false;
    currentHintAudio: any;
    unseenTextHtml = '';

    paginationMaxItems = 5;
    pagination = {
        start: 0,
        end: this.paginationMaxItems,
        current: 0
    };

    disableMultipleOptionWhenSubmitted = false;
    disableAllMultipleOptionsWhenSubmitted = false;

    // all_answers:any = {}
    private timers:any = {};

    // currentUnseenWords: any[] = [{id: 'children_20', value: 'children'}, {id: 'the_24', value: 'the'}, {id: 'One_68', value: 'One'}];
    private currentUnseenWords: any[] = [];
    private excludeWords: string[] = [];
    private wordLength = 3;

    unseenAnswers: any = {};

    submitInProgress = false;

    zoom: number = 1;
    zoomStep: number = .1;
    zoomLimits = {in: 2, out: .8};

    contextMenuPosition = { top: '0px', left: '0px' };
    isContextMenuOpen = false;
    contextMenuTarget: any;
    currentMenuWord = {word: '', translate: ''};

    markups = [
        {startIndex: 0, endIndex: 15}
    ];

    markedCharIds: number[] = [];

    public questionTypes = {
        sentence_completion:'sentence_completion',
        multiple_choice: 'multiple_choice',
        open_question: 'open_question'
    };

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,
        protected helperService: HelperService
    ) {
        super(config, lessonService);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.question_index = this.currentSlide.question_index || 0;
        this.markedCharIds = this.currentSlide.marked_chars;

        this.initUnseenAnswers();
        this.handleCounter(this.question_index);
        this.resetUnseenHtml();

        this.listenToSlideEvents();
        // this.currentSlide.all_questions = this.currentSlide.all_questions.concat(this.currentSlide.all_questions).concat(this.currentSlide.all_questions).concat(this.currentSlide.all_questions)
        // console.log('this.currentSlide.all_questions', this.currentSlide.all_questions)
        setTimeout(() => {
            this.calcPaginationMaxItems();
        });
    }


    openContextMenu(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const targetContainWord = target.closest('.word') as HTMLElement;
        if (targetContainWord) {
            event.preventDefault();
            this.removeMenuHighLight();
            this.contextMenuTarget = targetContainWord;
            this.currentMenuWord.word = targetContainWord.innerText;
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
            this.closeContextMenu();
        }
    };

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
        });
    }
    handleMenuAddVocabClick() {
        this.helperService.translateGoogle(this.currentMenuWord.word).then((translate_word) => {
            this.currentMenuWord.translate = translate_word;
            this.lessonService.Broadcast("slideAddToVocab", {word: this.currentMenuWord.word, translate: translate_word });
            this.closeContextMenu();
        });
    }

    initUnseenAnswers() {
        for (let i = 0; i < this.currentSlide.all_questions.length; i++) {
            const q = this.currentSlide.all_questions[i];
            if (this.currentSlide.all_answers[q.question_id]) {
                this.unseenAnswers[q.question_id] = JSON.parse(JSON.stringify(this.currentSlide.all_answers[q.question_id]));
                this.unseenAnswers[q.question_id].explanation = "";
                if (!this.unseenAnswers[q.question_id].multiple_answers) {
                    this.unseenAnswers[q.question_id].multiple_answers = {};
                }
            } else {
                this.unseenAnswers[q.question_id] = {
                    "pace": 0,
                    "score": 0,
                    "hint_used": false,
                    "answer_text": "",
                    "multiple_answers": {},
                    "explanation": "",
                    "question_idx": i,
                    "question_type": q.question_type,
                    "is_correct_answer": null
                };
                if(q.question_type == 'sentence_completion') {
                    // this.unseenAnswers[q.question_id].answer_text = q.question
                }
            }
        }
    }

    setResponseAnswer(data: any) {
        const current_question = this.currentSlide.all_questions[this.question_index];
        this.unseenAnswers[current_question.question_id].explanation = data.explanation;
        this.unseenAnswers[current_question.question_id].is_correct_answer = data.is_correct_answer;
        if(current_question.question_type == "multiple_choice" && !this.isEmpty(current_question.question.answers)) {
            this.currentSlide.all_answers[current_question.question_id] = JSON.parse(JSON.stringify(this.unseenAnswers[current_question.question_id]));
        }
    }

    listenToSlideEvents() {
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            try {
                const resp_data = resp.data;
                if (resp_data.source == "check_answer") {
                    this.setResponseAnswer(resp_data.answer);
                    this.submitInProgress = false;
                } else  if (resp_data.source == "get_hints") {
                    console.log('get_hints', resp_data);
                }

            } catch (e) {
                console.error(e);
            }
        });
        this.lessonService.ListenFor("slideEventReplyError").subscribe((resp:any) => {
            if (this.submitInProgress) {
                this.submitInProgress = false;
            }
        });
    }

    clearSlideEvents() {
        this.lessonService.ClearEvent("slideEventReply");
        this.lessonService.ClearEvent("slideEventReplyError");
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
                        startedHintHighlight = document.createElement('span');
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

                const tokenSpan = [];
                let letterCount = 0;
                for (const t of token) {
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
                    startedHintHighlight.appendChild(span);
                } else {
                    spanList.push(span.outerHTML);
                }
            } else {
                // Append punctuation as it is (without wrapping in <span>)
                let letterCount = 0;
                const tokenSpan = [];
                if (startedHintHighlight) {
                    for (const t of token) {
                        const span = document.createElement('span');
                        span.textContent = t;
                        span.id = 'char_' + (currentIndex + letterCount);
                        if (this.markedCharIds.indexOf(currentIndex + letterCount) > -1) {
                            span.classList.add('char-highlight');
                        }
                        startedHintHighlight.appendChild(span);
                        letterCount++;
                    }
                } else {
                    // const span = document.createElement('span');
                    // span.textContent = token;
                    for (const t of token) {
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
            currentIndex += token.length;
        }
        // console.log('spanList', spanList)
        this.unseenTextHtml = spanList.join('');
        // console.log('this.unseenTextHtml', this.unseenTextHtml)
        setTimeout(() => {
            // this.listenToWordClick();
        });
    }

    listenToWordClick() {
        $('.word').on('click', (e: any) => {
            // console.log('e.target', e.target)
            const word = e.target.closest('.word');
            const id = word.id;
            const value = word.innerText;
            console.log('value', value);
            const ids = this.currentUnseenWords.map(o => o.id);
            const index = ids.indexOf(id);
            if (index > -1) {
                this.currentUnseenWords.splice(index, 1);
            } else {
                this.currentUnseenWords.push({id: id, value: value});
            }
            this.resetUnseenHtml();
        });
    }

    getSelection(e: any) {
        console.log('e', e);
        let refreshHtml = false;
        const selection = window.getSelection();
        console.log('selection', selection);
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
                        this.markedCharIds.push(i);
                        refreshHtml = true;
                    }
                }
            }
            console.log('refreshHtml', refreshHtml);
            console.log('this.markedCharIds', this.markedCharIds);
            if (refreshHtml) {
                this.resetUnseenHtml();
            }
        }
    }

    checkAnswer() {
        if (this.submitInProgress) {
            return;
        }
        if (this.is_test_mode && this.unseenAnswers[this.currentSlide.all_questions[this.question_index].question_id].is_correct_answer !== null) {
            return;
        }
        const current_question = this.currentSlide.all_questions[this.question_index];
        this.unseenAnswers[current_question.question_id].pace = this.current_counter.counter;
        const data = {
            "source": 'check_answer',
            "answer": this.unseenAnswers[current_question.question_id].answer_text,
            "multiple_answers": this.unseenAnswers[current_question.question_id].multiple_answers,
            "question":current_question.question_type == 'multiple_choice' ? current_question.question.question : current_question.question,
            "question_type":current_question.question_type,
            "question_idx":this.question_index,
            "question_id":current_question.question_id,
            "slide_id":this.currentSlide.slide_uid,
            "pace":this.unseenAnswers[current_question.question_id].pace,
            'hint_used':this.unseenAnswers[current_question.question_id].hint_used,
            'marked_chars': this.markedCharIds,
            'stopAudio': true
        };
        console.log('data', data);
        this.submitInProgress = true;
        this.current_counter.submited = true;
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    nextQuestion() {
        this.goToQuestionNumber(this.question_index + 1);
    }
    prevQuestion() {
        this.goToQuestionNumber(this.question_index - 1);
    }

    goToQuestionNumber(number:number) {
        if(number > -1 && number < this.currentSlide.all_questions.length) {
            this.closeHints();
            this.setUpPagination(number);
            this.question_index = number;
            this.handleCounter(this.question_index);
        }
    }

    setUpPagination(number: number) {
        const avg = Math.floor((this.pagination.start + this.pagination.end) / 2);
        const avgItems = this.paginationMaxItems / 2;
        const stepAvg = Math.floor(avgItems);
        const extra = Math.ceil(avgItems) - stepAvg;
        console.log('here', extra);
        this.pagination.start = number - stepAvg;
        this.pagination.end = number + stepAvg + extra;
        if (this.pagination.start < 0) {
            this.pagination.start = 0;
            this.pagination.end = this.paginationMaxItems;
        }
        if (this.pagination.end > this.currentSlide.all_questions.length) {
            this.pagination.end = this.currentSlide.all_questions.length;
            this.pagination.start = this.pagination.end - this.paginationMaxItems;
            if (this.pagination.start < 0) {
                this.pagination.start = 0;
            }
        }
    }

    calcPaginationMaxItems() {
        if (this.questions) {
            const questionsElement = this.questions.nativeElement;
            const questionsBoxWidth = questionsElement.clientWidth;
            const circle = questionsElement.querySelector('.pagination .circle');
            if (circle) {
                const circleComputed = getComputedStyle(circle, null);
                const circleWidth = parseFloat(circleComputed.getPropertyValue('width'));
                const circleHeight = parseFloat(circleComputed.getPropertyValue('height'));
                const circleMarginRight = parseFloat(circleComputed.getPropertyValue('margin-right'));
                const circleMarginLeft = parseFloat(circleComputed.getPropertyValue('margin-left'));

                const totalWidth = circleWidth + circleMarginRight + circleMarginLeft;
                let maxItemsForWidth = Math.floor(questionsBoxWidth / totalWidth) - 4; // right and left arrows
                if (maxItemsForWidth <= 0) {
                    // set minimum of one item
                    maxItemsForWidth = 1;
                }
                this.paginationMaxItems = maxItemsForWidth;
                this.pagination.end = this.paginationMaxItems;
                this.pagination.start = 0;
                console.log('this.question_index', this.question_index);
                this.goToQuestionNumber(this.question_index);

                console.log('questions maxItemsForWidth', maxItemsForWidth);
            }
        }
    }
    onMultipleChoiceQuestionChange(option:any, event: any) {
        const current_question = this.currentSlide.all_questions[this.question_index];
        this.unseenAnswers[current_question.question_id].multiple_answers[option.answer] = event.target.checked;

        // allow to change if not disabled and reset original answer
        if(!this.disableMultipleOptionWhenSubmitted
            && this.currentSlide.all_answers[current_question.question_id]
            && this.currentSlide.all_answers[current_question.question_id].multiple_answers[option.answer]
            && !event.target.checked) {
            delete this.currentSlide.all_answers[current_question.question_id].multiple_answers[option.answer];
        }
    }

    nextSlide() {
        const data = {
            "source": "continue_to_next_slide_click",
            'stopAudio': true
        };
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    getHints() {
        if (this.currentHint) {
            return;
        }
        const current_question = this.currentSlide.all_questions[this.question_index];
        const correct_answer = current_question.hints['correct_answer'];
        let audio_path = current_question.hints['audio_path'];
        const guidance = current_question.hints['guidance'];
        const quotes = current_question.hints['quotes'];
        this.unseenAnswers[current_question.question_id].hint_used = true;
        if (audio_path) {
            if (audio_path && !this.checkIsFullUrl(audio_path)) {
                audio_path = (this.currentHost + audio_path).replace(/(https?:\/\/)|(\/)+/g, "$1$2");
            }
        } else {
            this.currentHint = current_question.hints['guidance'];
            this.showHint = true;
            this.markHint();
        }
    }

    closeHints(e: any = null) {
        if (this.currentHint) {
            let isPopup = false;
            if (e) {
                isPopup = e.target.closest('.hint-popup-main');
            }
            if (!isPopup || !e) {
                this.showHint = false;
                this.resetUnseenHtml();
                setTimeout(() => {
                    this.currentHint = '';
                }, 300);
            }
        }
    }

    resetUnseenHtml() {
        if (this.showHint) {
            this.markHint();
        } else {
            this.setUpUnseenTextHtml(null, null, this.currentUnseenWords);
        }
    }

    markHint() {
        const current_question = this.currentSlide.all_questions[this.question_index];
        const quotes = current_question.hints['quotes'];
        const startIndex = this.currentSlide.unseen_text.indexOf(quotes);
        const endIndex = startIndex + quotes.length;
        this.setUpUnseenTextHtml(startIndex, endIndex, this.currentUnseenWords);
        this.scrollToHint();
    }

    playHint(audio_path: string) {
        if (this.currentHintAudio) {
            this.currentHintAudio.pause();
            this.currentHintAudio = null;
        } else {
            const audio = new Audio();
            this.currentHintAudio = audio;
            audio.src = audio_path;
            audio.play();
        }
    }

    scrollToHint() {
        setTimeout(() => {
            if (this.unseen_text_box) {
                const boxElement = this.unseen_text_box.nativeElement;
                const boxREct = boxElement.getBoundingClientRect();
                const hints = document.getElementsByClassName('hint');
                if (hints && hints.length) {
                    const hintElement: any = hints[0];
                    const hintRect = hintElement.getBoundingClientRect();
                    const isFullyVisible =
                        hintRect.top >= boxREct.top &&
                        hintRect.bottom <= boxREct.bottom;

                    if (!isFullyVisible) {
                        // Element is not fully visible within the container, so scroll to it.
                        boxElement.scrollTo({
                            top: hintElement.offsetTop - boxElement.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    }

    isEmpty(obj:any) {
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }

        return true;
    }

    handleCounter(question_idx:number) {
        if (this.slideData.is_test_mode) {
            return;
        }
        this.pauseAllCounters();
        if(!this.timers.hasOwnProperty(question_idx)) {
            this.timers[question_idx] = this.createTimer();
        } else {
            this.timers[question_idx].active = true;
        }
        this.current_counter = this.timers[question_idx];
    }

    createTimer() {
        const Timer = Object();
        Timer.active = true;
        Timer.counter = 0;
        Timer.minutes = 0;
        Timer.minutesStr = '00';
        Timer.seconds = 0;
        Timer.secondsStr = '00';
        Timer.submited = false;
        Timer.intervalId = setInterval(this.progressTimer, 1000, Timer);
        return Timer;

    }

    pauseAllCounters() {
        for(const key in this.timers) {
            this.timers[key].active = false;
        }
    }

    progressTimer(self:any) {
        if (self.active && !self.submited) {
            self.counter = self.counter + 1;
            self.minutes = Math.floor(self.counter / 60);
            self.minutesStr = self.minutes.toString().length < 2 ? '0' + self.minutes : self.minutes;
            self.seconds = self.counter % 60;
            self.secondsStr = self.seconds.toString().length < 2 ? '0' + self.seconds : self.seconds;
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
    }

    @HostListener('window:resize', ['$event'])
    onWindowResize(e: any) {
        this.calcPaginationMaxItems();
    }

    override ngOnDestroy(): void {
        this.clearSlideEvents();
        super.ngOnDestroy();
    }
}
