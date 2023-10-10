import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
    selector: 'app-random-selector',
    templateUrl: './random-selector.component.html',
    styleUrls: ['./random-selector.component.less']
})
export class RandomSelectorComponent extends BaseSlideComponent implements OnInit{

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
