import { Component, Input, OnInit } from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.less']
})
export class VideoComponent implements OnInit{
  @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
  
  imageSrc = ''
  embeddedVideo: SafeHtml;

  constructor(
      private config: Config,
      private sanitizer: DomSanitizer,
  ) {
    this.imageSrc = this.config.staticImagePath
    this.embeddedVideo =""
  }
  ngOnInit() {
    this.createVideo()
  }
  createVideo() {
    const embedCode = '<iframe width="426" height="240" src="'+this.currentSlide.video_url +'" title="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    this.embeddedVideo = this.sanitizer.bypassSecurityTrustHtml(embedCode);
    return this.embeddedVideo
  }
}


// constructor(private sanitizer: DomSanitizer) {
//   // Paste the YouTube iframe code you copied here
//   const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  
//   // Sanitize and set the HTML
//   this.embeddedVideo = this.sanitizer.bypassSecurityTrustHtml(embedCode);

