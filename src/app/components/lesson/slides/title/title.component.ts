import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.less']
})
export class TitleComponent extends BaseSlideComponent implements OnInit{

    imgSrc = ''
    constructor(
        protected override config: Config,
    ) {
        super(config)
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }
}
