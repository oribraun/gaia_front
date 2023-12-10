import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../entities/presentation";
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

@Component({
    selector: 'app-greeting',
    templateUrl: './greeting.component.html',
    styleUrls: ['./greeting.component.less']
})
export class GreetingComponent extends BaseSlideComponent {

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService);
    }

}
