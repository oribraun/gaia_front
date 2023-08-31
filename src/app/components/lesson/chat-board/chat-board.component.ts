import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {PresentationSlide} from "../../../entities/presentation";
import {LessonService} from "../../../services/lesson/lesson.service";
import {ChatMessage} from "../../../entities/chat_message";

@Component({
    selector: 'app-chat-board',
    templateUrl: './chat-board.component.html',
    styleUrls: ['./chat-board.component.less']
})
export class ChatBoardComponent implements OnInit {

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
                if (obj.isFinal) {
                    if (!this.started) {
                        this.messages.push(obj);
                    } else {
                        this.messages[this.messages.length].message = obj.message;
                    }
                    this.started = false;
                } else {
                    if (!this.started) {
                        this.started = true;
                        // this.messages.push(new ChatMessage({type: 'user', message: this.currentChatMessage.message}));
                        this.messages.push(obj);
                    }
                    this.messages[this.messages.length].message = obj.message;
                }
            }
        })
    }
}
