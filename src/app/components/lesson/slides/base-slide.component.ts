import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../entities/presentation";
import {Config} from "../../../config";

@Component({
    selector: 'app-base-slide',
    template: ''
})
export class BaseSlideComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('slideData') slideData: any = {};

    imageSrc = ''

    constructor(
        protected config: Config,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

}
