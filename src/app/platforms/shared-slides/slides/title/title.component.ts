import {Component, Input, OnInit} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.less']
})
export class TitleComponent extends BaseSlideComponent implements OnInit{

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
