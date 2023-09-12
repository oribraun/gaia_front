import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";

@Component({
    selector: 'app-word-repeater',
    templateUrl: './word-repeater.component.html',
    styleUrls: ['./word-repeater.component.less']
})
export class WordRepeaterComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('recognitionText') recognitionText: string = '';
    @Input('slideData') slideData: any = {};

    imageSrc = ''

    constructor(
        private config: Config,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

}
