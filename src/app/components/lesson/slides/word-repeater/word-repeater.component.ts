import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
    selector: 'app-word-repeater',
    templateUrl: './word-repeater.component.html',
    styleUrls: ['./word-repeater.component.less']
})
export class WordRepeaterComponent  extends BaseSlideComponent {

    @Input('recognitionText') recognitionText: string = '';

    constructor(
        protected override config: Config,
    ) {
        super(config)
    }

}
