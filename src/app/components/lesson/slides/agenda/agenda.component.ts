import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";

@Component({
    selector: 'app-agenda',
    templateUrl: './agenda.component.html',
    styleUrls: ['./agenda.component.less']
})
export class AgendaComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('slideData') slideData: any = {};

    imageSrc = ''

    constructor(
        private config: Config,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

}
