import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../../services/lesson/lesson.service";

@Component({
    selector: 'app-word-repeater',
    templateUrl: './word-repeater.component.html',
    styleUrls: ['./word-repeater.component.less']
})
export class WordRepeaterComponent  extends BaseSlideComponent {

    @Input('recognitionText') recognitionText: string = '';

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService)
    }

    example_how_to_use_is_active() {
        if (this.slideData?.is_active) {
            console.log('asdf')
        }
    }

}
