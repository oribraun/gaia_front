import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../../services/lesson/lesson.service";

@Component({
    selector: 'app-random-selector',
    templateUrl: './random-selector.component.html',
    styleUrls: ['./random-selector.component.less']
})
export class RandomSelectorComponent extends BaseSlideComponent implements OnInit{

    imgSrc = ''
    constructor(
        protected override config: Config,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService)
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }
}
