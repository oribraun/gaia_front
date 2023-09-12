import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
    selector: 'app-greeting',
    templateUrl: './greeting.component.html',
    styleUrls: ['./greeting.component.less']
})
export class GreetingComponent extends BaseSlideComponent {

    constructor(
        protected override config: Config,
    ) {
        super(config)
    }

}
