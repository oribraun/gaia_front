import {Component, Input, OnInit} from '@angular/core';
import {LessonService} from "../../../../services/lesson/lesson.service";
import {Config} from "../../../../config";
import {BaseSlideComponent} from "../base-slide.component";
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'app-unseen',
  templateUrl: './unseen.component.html',
  styleUrls: ['./unseen.component.less']
})
export class UnseenComponent extends BaseSlideComponent implements OnInit{
    constructor(
        protected override config: Config,
        private lessonService: LessonService,
        private sanitizer: DomSanitizer
    ) {
        super(config)
    }

    override ngOnInit(): void {
      super.ngOnInit();
      this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
        try {

        } catch (e) {
          console.error(e)
        }

      })
 
    }
    
    sanitizeHtmlContent(htmlContnet:string){
      return this.sanitizer.bypassSecurityTrustHtml(htmlContnet)
    }
  
}
