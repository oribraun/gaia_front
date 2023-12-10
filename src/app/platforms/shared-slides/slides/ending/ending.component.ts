import {Component, Input} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

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
        super(config, lessonService);
    }

}
