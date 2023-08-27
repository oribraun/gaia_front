import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";

@Component({
    selector: 'app-greeting',
    templateUrl: './greeting.component.html',
    styleUrls: ['./greeting.component.less']
})
export class GreetingComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();

    imageSrc = ''

    constructor(
        private config: Config,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

}
