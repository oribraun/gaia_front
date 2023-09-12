import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";

@Component({
    selector: 'app-ending',
    templateUrl: './ending.component.html',
    styleUrls: ['./ending.component.less']
})
export class EndingComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('slideData') slideData: any = {};

    imageSrc = ''

    constructor(
        private config: Config,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

}
