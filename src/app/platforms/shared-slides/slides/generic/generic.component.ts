import {Renderer2,Component, Inject,Input, OnInit, OnDestroy} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {DynamicScriptLoaderService} from "../../../main/services/dynamic-js-loader/dynamic-js-loader.service";

declare function rx_doorbell(data:any): any;
declare let txData:any;

@Component({
  selector: 'app-generic',
  templateUrl: './generic.component.html',
  styleUrls: ['./generic.component.less']
})


export class GenericComponent extends BaseSlideComponent implements OnInit, OnDestroy{
  displayHTML:any = '';

  constructor(
      protected override config: Config,
      protected override lessonService: LessonService,
      private jsLoaderService: DynamicScriptLoaderService,
      private sanitizer: DomSanitizer,
      private _renderer2: Renderer2,
      @Inject(DOCUMENT) private _document: Document
  ) {
      super(config, lessonService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
      try {
        const data = resp.data;
        switch(data.source){
          case 'core_function_1':
            break;
          default:
            rx_doorbell(data);
        }


      } catch (e) {
        console.error(e);
      }

    });
    this.loadSlideResources();

  }

  loadSlideResources(){
    this.loadScripts();
    const html = this.currentSlide.html;
    this.displayHTML = this.sanitizeHtmlContent(html);
  }

  loadScripts() {

    const scriptSrc = this.currentSlide.js;
    if (scriptSrc.endsWith('.js') || scriptSrc.startsWith('http')){
      const scriptName = 'customScript';
      this.jsLoaderService.addScript(scriptName, scriptSrc);
      // You can load multiple scripts by just providing the key as argument into load method of the service
      this.jsLoaderService.load(scriptName).then(data => {
        // Script Loaded Successfully

      }).catch(error => console.log(error));
    } else {
      this.loadExternalJavaScriptFromStr(scriptSrc);
    }

  }

  loadExternalJavaScriptFromStr(script: string) {
    const scriptElement = this._renderer2.createElement('script');
    scriptElement.text = script;
    scriptElement.type = 'application/javascript';
    this._renderer2.appendChild(this._document.body, scriptElement);
  }

  sanitizeHtmlContent(htmlContnet:string){
    return this.sanitizer.bypassSecurityTrustHtml(htmlContnet);
  }

  tx(){
    const txdata = txData;
    switch(txdata.event){
      case 'disable_asr':
        break;
      default:

        const data = {
            "source": txdata.event,
            "data":txdata.data,
            'stopAudio': true
        };
        this.lessonService.Broadcast("slideEventRequest", data);
    }
    console.log('daniel',txData);
  }

  override ngOnDestroy(): void {
      super.ngOnDestroy();
  }
}
