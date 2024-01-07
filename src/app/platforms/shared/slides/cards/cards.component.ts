import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {TimersHelper} from "../../helpers/timers";
import {ChatMessage} from "../../entities/chat_message";

@Component({
    selector: 'app-cards',
    templateUrl: './cards.component.html',
    styleUrls: ['./cards.component.less']
})
export class CardsComponent extends BaseSlideComponent implements OnInit, OnDestroy {
    cards_type: string;
    cards: any[];
    shuffle: boolean;
    enable_audio: boolean;
    show_envelope: boolean;

    right_answers: string[];

    currentCardIndex!: number;
    currentCard!: Card;
    showBackCard: boolean = false;
    disableFlipAnimation: boolean = false;

    blockAllQuestionEvents: boolean = false;

    timersHelper = new TimersHelper();
    timer_id = 1001101;
    loop_timer_timeout: any;

    timerInterval: any;
    timerTotal: number;
    totalRoundPercent: number = 157;
    timerCirclePercent: number = this.totalRoundPercent;
    cardAnswers: any = {};


    submitInProgress = false;
    recordingIsActive:boolean = false;
    speakInProgress:boolean = false;

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.cards_type = this.currentSlide.cards_type;
        this.cards = this.convertCardsToClass(this.currentSlide.cards);
        this.right_answers = this.cards.map((o) => o.b);
        this.shuffle = this.currentSlide.shuffle;
        this.enable_audio = this.currentSlide.enable_audio;
        this.show_envelope = this.currentSlide.show_envelope;
        this.initCardsAnswers();
        if (this.shuffle) {
            this.shuffleArray(this.cards);
        }
        if (this.cards.length) {
            this.currentCardIndex = 0;
            this.currentCard = this.cards[this.currentCardIndex];
        }
        if (this.currentCard) {
            this.shuffleMultipleChoice();
        }

        window.speechSynthesis.addEventListener("voiceschanged", () => {});

        // this.setTimer(35);
        this.setQuestionTimer();
        this.watchTimers();

        this.listenToSlideEvents();
    }

    initCardsAnswers() {
        for (let i = 0; i < this.cards.length; i++) {
            const q = this.cards[i];
            if (this.currentSlide.all_answers[q.id]) {
                this.cardAnswers[q.id] = JSON.parse(JSON.stringify(this.currentSlide.all_answers[q.id]));
                this.cardAnswers[q.id].explanation = "";
            } else {
                this.cardAnswers[q.id] = {
                    "pace": 0,
                    "score": 0,
                    "hint_used": false,
                    "answer_text": "",
                    "explanation": "",
                    "card_idx": i,
                    "cards_type": this.cards_type,
                    "is_correct_answer": null
                };
            }
        }
        console.log('this.cardAnswers', this.cardAnswers);
    }

    setResponseAnswer(data: any) {
        this.cardAnswers[this.currentCard.id].explanation = data.explanation;
        this.cardAnswers[this.currentCard.id].is_correct_answer = data.is_correct_answer;
    }    

    listenToSlideEvents() {
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            console.log('slideEventReply', resp);
            this.submitInProgress = false;
            // ** for multiple choice: 
            // if not test mode: 
            //    if correct - mark correct answer with v and green, and after 3 sec move to next card
            //    if wrong - mark wrong answer with x, and correct answer with v, and add button [continue]
            // if test mode:
            //    mark the selected answer and add button [continue]
            // ** for input text:
            // remember the text that was entered.
            // if not test mode: 
            //    if correct - mark correct text box with v and green background color and after 3 sec move to next card
            //    if wrong - mark the text box with x and red background color, and and add button [continue]
            // if test mode:
            //    mark the text box and add button [continue]
            try {
                const resp_data = resp.data;
                if (resp_data.source == "check_answer") {
                    this.setResponseAnswer(resp_data.answer);
                }
            } catch (e) {
                console.error(e);
            }



        });
        this.lessonService.ListenFor("slideEventReplyError").subscribe((resp:any) => {
            console.log('slideEventReplyError', resp);
            this.submitInProgress = false;
        });
        this.lessonService.ListenFor("blockAllSlideEvents").subscribe((resp:any) => {
            if (this.submitInProgress) {
                this.submitInProgress = false;
            }
        });
        this.lessonService.ListenFor("speakInProgress").subscribe((val: boolean) => {
            this.speakInProgress = val;
        });
        this.lessonService.ListenFor("recognitionText").subscribe((val: string) => {
            this.sendUserReplay(val);
        });
    }

    clearSlideEvents() {
        this.lessonService.ClearEvent("slideEventReply");
        this.lessonService.ClearEvent("slideEventReplyError");
        this.lessonService.ClearEvent("blockAllSlideEvents");
        this.lessonService.ClearEvent("speakInProgress");
        this.lessonService.ClearEvent("recognitionText");
    }

    shuffleMultipleChoice() {
        const count = 4;
        if (this.currentCard && !this.currentCard.options) {
            const answersWithout = this.right_answers.filter(item => item !== this.currentCard.b);

            const selectedItems = answersWithout.slice(0, count - 1);

            selectedItems.push(this.currentCard.b);

            const shuffledArray = selectedItems.sort(() => Math.random() - 0.5);

            this.currentCard.options = shuffledArray;
        }

    }

    setQuestionTimer() {
        const total_test_time = 60;
        const current_test_time_sec = total_test_time - this.currentSlide.timer_sec;
        this.timersHelper.handleTimer(this.timer_id, current_test_time_sec, total_test_time, true);
        this.timersHelper.stopTimer(this.timer_id);

        this.timerTotal = total_test_time;
    }

    watchTimers(loop_counter = 1) {
        const timeout = 1; // every 15 seconds
        if(this.checkTimer()) {
            this.loop_timer_timeout = setTimeout(() => {
                if (this.checkTimer()) {
                    if (loop_counter >= timeout) {
                        // this.sendTimersToDb();
                        loop_counter = 1;
                    } else {
                        loop_counter++;
                    }
                    this.watchTimers(loop_counter);
                }
            }, 1000);
        }
    }

    checkTimer() {
        let shouldContinue = true;
        const timer = this.timersHelper.getTimer(this.timer_id);
        if (timer) {
            this.setCircleTimerFromTimerHelper();
            if (timer.counter_sec <= 0) {
                shouldContinue = false;
            }
            if (shouldContinue) {
                this.timersHelper.startTimer(this.timer_id);
            } else {
                this.clearTimerInterval();
                this.clearCircleTimer();
                this.blockAllQuestionEvents = true;
            }
        }
        return shouldContinue;
    }

    clearTimerInterval() {
        if (this.loop_timer_timeout) {
            clearTimeout(this.loop_timer_timeout);
        }
    }

    convertCardsToClass(cards: any[]) {
        const new_cards = [];
        for (const i in cards) {
            new_cards.push(new Card(cards[i]));
        }
        return new_cards;
    }

    shuffleArray(array: Card[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    onNextCard(event: Event) {
        if (this.showBackCard) {
            this.disableFlipAnimation = true;
            this.showBackCard = false;
        }
        this.renewQuestionTimers();
        if (this.currentCardIndex < this.cards.length) {
            this.currentCardIndex++;
            this.currentCard = this.cards[this.currentCardIndex];
            this.shuffleMultipleChoice();
            setTimeout(() => {
                this.disableFlipAnimation = false;
            });
        }
    }

    onPrevCard(event: Event) {
        if (this.showBackCard) {
            this.disableFlipAnimation = true;
            this.showBackCard = false;
        }
        this.renewQuestionTimers();
        if (this.currentCardIndex  > 0) {
            this.currentCardIndex--;
            this.currentCard = this.cards[this.currentCardIndex];
            this.shuffleMultipleChoice();
            setTimeout(() => {
                this.disableFlipAnimation = false;
            });
        }
    }

    renewQuestionTimers() {
        this.clearTimerInterval();
        this.removeTimer();
        this.clearCircleTimer();
        this.setCircleTimer(0);

        this.setQuestionTimer();
        this.watchTimers();
    }

    speak(text: string) {
        if (!text) {
            return;
        }
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = "en-US";
        const voices = speechSynthesis.getVoices();
        if (voices && voices.length > 1) {
            msg.voice = voices[1];
        }
        window.speechSynthesis.speak(msg);
    }

    moveBar(event: any) {
        const target: any = event.target;
        if (target && target.classList.contains('inner-bar')) {
            // console.log('inner bar click do nothing');
        } else {
            const clickXPos = event.clientX;
            const child = target.querySelector('.inner-bar');
            if (this.slideData.lang !== 'he') {
                const childLeftPosition = child.getBoundingClientRect().left;
                const childRightPosition = childLeftPosition + child.clientWidth;
                if (clickXPos < childLeftPosition && clickXPos < childRightPosition) {
                    this.onPrevCard(event);
                } else if (clickXPos > childLeftPosition && clickXPos > childRightPosition) {
                    this.onNextCard(event);
                }
            } else {
                const childLeftPosition = child.getBoundingClientRect().left;
                const childRightPosition = childLeftPosition + child.clientWidth;
                if (clickXPos < childLeftPosition && clickXPos < childRightPosition) {
                    this.onNextCard(event);
                } else if (clickXPos > childLeftPosition && clickXPos > childRightPosition) {
                    this.onPrevCard(event);
                }
            }
        }
    }

    // percent is between 0 and 100
    setCircleTimer(percent: number) {
        const normalizePercent = this.totalRoundPercent - (percent * (this.totalRoundPercent / 100));
        this.timerCirclePercent = normalizePercent;
    }

    clearCircleTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    removeTimer() {
        const timer = this.timersHelper.getTimer(this.timer_id);
        this.timersHelper.removeTimer(this.timer_id);
    }

    setCircleTimerFromTimerHelper() {
        const timer = this.timersHelper.getTimer(this.timer_id);
        if (timer) {
            const total = timer.total_sec;
            const sec = timer.total_sec - timer.counter_sec;
            const percent = sec / total * 100;
            this.setCircleTimer(percent);
        }
    }

    sendUserReplay(answer: string) {
        if (this.submitInProgress) {
            return;
        }
        // if (this.is_test_mode) {
        //     return;
        // }
        // this.cardAnswers[this.currentCard.id].answer_text = answer
        const data = {
            "source": 'check_answer',
            "answer": answer,
            "card_idx": this.currentCardIndex,
            "card_id": this.currentCard.id,
            "multiple_answers": [],
            'stopAudio': true
        };
        console.log('data', data);
        this.submitInProgress = true;
        const timer = this.timersHelper.getTimer(this.timer_id);
        timer.submited = true;
        this.lessonService.Broadcast("slideEventRequest", data);
    }

    startAsr() {
        if (this.speakInProgress) {
            return;
        }
        this.recordingIsActive = true;
        this.lessonService.Broadcast('startListenToAsr');
    }

    stopAsr() {
        this.recordingIsActive = false;
        this.lessonService.Broadcast('stopListenToAsr');
    }

    override ngOnDestroy(): void {
        this.clearSlideEvents();

        this.clearTimerInterval();
        this.clearCircleTimer();
        this.removeTimer();

        super.ngOnDestroy();
    }

}

class Card {
    id: number;
    a: string;
    a_image_path: string;
    b: string;
    b_image_path: string;
    wrong_values: string[];
    options: string[];

    public constructor(obj?:Partial<Card>) {
        Object.assign(this, obj);
    }
}
