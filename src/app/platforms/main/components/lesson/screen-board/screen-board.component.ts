import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PresentationSection, PresentationSlide} from "../../../entities/presentation";
import {Config} from "../../../config";
import {ApiService} from "../../../services/api.service";

@Component({
  selector: 'app-screen-board',
  templateUrl: './screen-board.component.html',
  styleUrls: ['./screen-board.component.less']
})
export class ScreenBoardComponent {

    @Input('currentSection') currentSection: PresentationSection = new PresentationSection();
    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('recognitionText') recognitionText: string = '';
    @Input('isPause') isPause: boolean = false;
    @Input('isMobile') isMobile: boolean = false;
    @Output('onResetPresentation') onResetPresentation: EventEmitter<any> = new EventEmitter<any>();

    presentationResetIsInProgress = false;

    apiSubscriptions: any = {
        reset: null,
    }

    imageSrc = ''

    constructor(
        private config: Config,
        private apiService: ApiService,
    ) {
        this.imageSrc = this.config.staticImagePath
    }
    async resetPresentation(reason: string = '') {
        this.onResetPresentation.emit()
    }

    toggleFullScreen() {
        this.currentSlide.full_screen = !this.currentSlide.full_screen;
    }
}
