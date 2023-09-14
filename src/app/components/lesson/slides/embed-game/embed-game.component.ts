import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { LessonService } from 'src/app/services/lesson/lesson.service';


@Component({
  selector: 'app-embed-game',
  templateUrl: './embed-game.component.html',
  styleUrls: ['./embed-game.component.less']
})

export class EmbedGameComponent extends BaseSlideComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('wrapper', { static: false }) wrapper!: ElementRef;
  @ViewChild('iframe', { static: false }) iframe!: ElementRef;

  iframe_url:SafeResourceUrl | undefined;
  isIframeFocused: boolean = false;

  constructor(
      protected override config: Config,
      private sanitizer: DomSanitizer,
      private lessonService: LessonService

  ) {
      super(config)
  }
 
  ngAfterViewInit() {
    // this.wrapper.nativeElement.focus();
    window.focus();
    let listener = window.addEventListener('blur', () => {
        if (document.activeElement === document.querySelector('iframe')) {
          console.log('clicked on iframe')
        }
        window.removeEventListener('blur',()=>{window.focus();});
    });
    // this.lessonService.Broadcast('endDoNotDisturb',{})
    // this.lessonService.Broadcast('DoNotDisturb',{})
  }

  ngOnInit(): void {
    console.log('embeding iframe', this.currentSlide['iframe_path'])
    this.updateSrc(this.currentSlide['iframe_path'])
  }

  updateSrc(url:string='') {
    this.iframe_url=this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  iframeFocus() {
    this.isIframeFocused = true;
    console.log('iframe focus')

  }

  iframeBlur() {
    this.isIframeFocused = false;
    console.log('iframe blur')
  }

  ngOnDestroy(){
    // this.lessonService.Broadcast('endDoNotDisturb',{})
  }
}
