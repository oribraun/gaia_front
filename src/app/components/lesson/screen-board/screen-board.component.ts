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
    @Input('sectionTitles') sectionTitles: any = {};
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
        if (this.presentationResetIsInProgress) {
            return;
        }
        this.presentationResetIsInProgress = true;
        this.apiSubscriptions.reset = this.apiService.resetPresentation({
            app_data: {
                type: reason
            }
        }).subscribe({
            next: (response: any) => {
                this.onResetPresentation.emit(response)
                this.presentationResetIsInProgress = false;
            },
            error: (error) => {
                this.presentationResetIsInProgress = false;
                console.log('resetPresentation error', error)
            },
        })
    }

    toggleFullScreen() {
        // this.currentSlide.full_screen = !this.currentSlide.full_screen;
    }

}
