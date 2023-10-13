import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../../services/lesson/lesson.service";

@Component({
    selector: 'app-agenda',
    templateUrl: './agenda.component.html',
    styleUrls: ['./agenda.component.less']
})
export class AgendaComponent extends BaseSlideComponent {

    constructor(
        protected override config: Config,
        protected override lessonService: LessonService,

    ) {
        super(config, lessonService)
    }

}
