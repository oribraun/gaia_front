import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PresentationSection, PresentationSlide} from "../../../entities/presentation";
import {ApiService} from "../../../services/api.service";
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-white-board',
    templateUrl: './white-board.component.html',
    styleUrls: ['./white-board.component.less'],
})
export class WhiteBoardComponent {

    @Input('currentSection') currentSection: PresentationSection = new PresentationSection();
    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('sectionTitles') sectionTitles: any = {};
    @Output('onResetPresentation') onResetPresentation: EventEmitter<any> = new EventEmitter<any>();

    presentationResetIsInProgress = false;

    apiSubscriptions: any = {
        reset: null,
    }

    imageSrc = ''

    constructor(
        private apiService: ApiService,
    ) {
        if (environment.production) {
            this.imageSrc = 'client/'
        }
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
            },
            error: (error) => {
                console.log('resetPresentation error', error)
            },
        })
    }

}
