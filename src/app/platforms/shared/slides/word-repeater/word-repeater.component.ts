import {Component, Input} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

@Component({
    selector: 'app-word-repeater',
    templateUrl: './word-repeater.component.html',
    styleUrls: ['./word-repeater.component.less']
})
export class WordRepeaterComponent  extends BaseSlideComponent {

    @Input() recognitionText: string = '';

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService);
    }

    example_how_to_use_is_active() {
        if (this.slideData?.is_active) {
            console.log('asdf');
        }
    }

}
