import { Component, OnInit } from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-embed-game',
  templateUrl: './embed-game.component.html',
  styleUrls: ['./embed-game.component.less']
})

export class EmbedGameComponent extends BaseSlideComponent implements OnInit {

  iframe_url:SafeResourceUrl | undefined;

  constructor(
      protected override config: Config,
      private sanitizer: DomSanitizer

  ) {
      super(config)
  }

  ngOnInit(): void {
    console.log('embeding iframe', this.currentSlide['iframe_path'])
    this.updateSrc(this.currentSlide['iframe_path'])
  }

  updateSrc(url:string='') {
    this.iframe_url=this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }
}
