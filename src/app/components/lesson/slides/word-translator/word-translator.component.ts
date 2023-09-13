import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
    selector: 'app-word-translator',
    templateUrl: './word-translator.component.html',
    styleUrls: ['./word-translator.component.less']
})
export class WordTranslatorComponent  extends BaseSlideComponent {

    constructor(
        protected override config: Config,
    ) {
        super(config)
    }

    example_how_to_use_is_active() {
        if (this.slideData?.is_active) {
            console.log('asdf')
        }
    }

}
