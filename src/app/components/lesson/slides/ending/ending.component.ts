import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../../services/lesson/lesson.service";

@Component({
    selector: 'app-ending',
    templateUrl: './ending.component.html',
    styleUrls: ['./ending.component.less']
})
export class EndingComponent extends BaseSlideComponent {

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService)
    }

}
