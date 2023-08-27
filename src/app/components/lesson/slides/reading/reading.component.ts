import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";

@Component({
    selector: 'app-reading',
    templateUrl: './reading.component.html',
    styleUrls: ['./reading.component.less']
})
export class ReadingComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();

    imageSrc = ''

    constructor(
        private config: Config,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

}
