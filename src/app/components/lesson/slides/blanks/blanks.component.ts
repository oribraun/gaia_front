import {Component, Input} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";

@Component({
  selector: 'app-blanks',
  templateUrl: './blanks.component.html',
  styleUrls: ['./blanks.component.less']
})
export class BlanksComponent {

  @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();

  imageSrc = ''

  constructor(
      private config: Config,
  ) {
      this.imageSrc = this.config.staticImagePath
  }
}
