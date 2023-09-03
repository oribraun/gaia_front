import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {PresentationSlide} from "../../../entities/presentation";
import {LessonService} from "../../../services/lesson/lesson.service";
import {ChatMessage} from "../../../entities/chat_message";
import {fromEvent, interval, Subscription} from "rxjs";
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-chat-board',
    templateUrl: './chat-board.component.html',
    styleUrls: ['./chat-board.component.less']
})
export class ChatBoardComponent implements OnInit {

    @ViewChild('scroller') scroller!: ElementRef;

    private scrollSubscription!: Subscription;

    messages: ChatMessage[] = [
        // new ChatMessage({type: 'computer', message: 'hi how are you?'}),
        // new ChatMessage({type: 'user', message: 'im good how are you?'}),
        // new ChatMessage({type: 'computer', message: 'fine'}),
        // new ChatMessage({type: 'user', message: 'hi'}),
    ];
    started = false;

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();

    constructor(
        private lessonService: LessonService
    ) {
    }

    ngOnInit(): void {
        this.lessonService.ListenFor('newChatMessage').subscribe((obj: ChatMessage) =>{
            if (obj.message) {
                obj.message = this.cleanMessage(obj.message)
                if (obj.isFinal) {
                    if (!this.started) {
                        this.messages.push(obj);
                    } else {
                        this.messages[this.messages.length - 1].message = obj.message;
                    }
                    this.started = false;
                } else {
                    if (!this.started) {
                        this.started = true;
                        // this.messages.push(new ChatMessage({type: 'user', message: this.currentChatMessage.message}));
                        this.messages.push(obj);
                    }
                    this.messages[this.messages.length - 1].message = obj.message;
                }
                this.scrollToBottom2()
            }
        })
        this.lessonService.ListenFor('resetChatMessages').subscribe(() =>{
            this.messages = []
        })
    }
    cleanMessage(message: string): string {
        let msg = message.replace('PAUSE1SEC','').replace('PAUSE3SEC','')
        return msg
    }

    scrollToBottom2(animate=false, timeout=0){
        if (this.scroller) {
            setTimeout(() => {
                const element = this.scroller.nativeElement;
                element.scrollTop = element.scrollHeight
            }, timeout)
        }
    }

    scrollToBottom(animate = false, timeout = 0) {
        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe();
        }

        if (this.scroller) {
            if (animate) {
                this.animateScroll()
            } else {
                setTimeout(() => {
                    const element = this.scroller.nativeElement;
                    element.scrollTop = element.scrollHeight;
                }, timeout);
            }
        }
    }

    animateScroll(animationDuration=200) {
        if (this.scrollSubscription) {
            this.scrollSubscription.unsubscribe();
        }
        const element = this.scroller.nativeElement;

        const scrollObservable = interval(10).pipe(
            takeUntil(fromEvent(element, 'scroll')),
        );

        this.scrollSubscription = scrollObservable.subscribe((_) => {
            const element = this.scroller.nativeElement;
            const startPosition = element.scrollTop;
            const endPosition = element.scrollHeight;
            const currentTime = Math.min(1, (Date.now() - startTime) / animationDuration);
            element.scrollTop = startPosition + (endPosition - startPosition) * currentTime;

            if (currentTime === 1) {
                this.scrollSubscription.unsubscribe();
            }
        });

        const startTime = Date.now();

    }
}
