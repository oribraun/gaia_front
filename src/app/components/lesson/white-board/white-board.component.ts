import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PresentationSection, PresentationSlide} from "../../../entities/presentation";
import {ApiService} from "../../../services/api.service";
import {environment} from "../../../../environments/environment";
import {Config} from "../../../config";

@Component({
    selector: 'app-white-board',
    templateUrl: './white-board.component.html',
    styleUrls: ['./white-board.component.less'],
})
export class WhiteBoardComponent {

    @Input('currentSection') currentSection: PresentationSection = new PresentationSection();
    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('sectionTitles') sectionTitles: any = {};
    @Input('recognitionText') recognitionText: string = '';
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
                this.presentationResetIsInProgress = false;
                this.onResetPresentation.emit(response)
            },
            error: (error) => {
                console.log('resetPresentation error', error)
            },
        })
    }

}
