import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../entities/presentation";

@Component({
  selector: 'app-chat-board',
  templateUrl: './chat-board.component.html',
  styleUrls: ['./chat-board.component.less']
})
export class ChatBoardComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();

}
