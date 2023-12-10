import {Component, Input, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

@Component({
    selector: 'app-random-selector',
    templateUrl: './random-selector.component.html',
    styleUrls: ['./random-selector.component.less']
})
export class RandomSelectorComponent extends BaseSlideComponent implements OnInit {

    imgSrc = '';
    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }
}
