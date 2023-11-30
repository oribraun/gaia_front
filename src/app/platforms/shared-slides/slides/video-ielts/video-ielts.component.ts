import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener, Inject,
    Input, OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {ChatMessage} from "../../entities/chat_message";
import {environment} from "../../../../../environments/environment";
import {SpeechRecognitionService} from "../../../main/services/speech-recognition/speech-recognition.service";
import {HelperService} from "../../../main/services/helper.service";

export enum PlayerState
{
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
}
export interface OnStateChangeEvent
{
    /**
     * New player state.
     */
    data: PlayerState;
    target:any;
}

declare var $: any;

@Component({
    selector: 'app-video-ielts',
    templateUrl: './video-ielts.component.html',
    styleUrls: ['./video-ielts.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class VideoIeltsComponent extends BaseSlideComponent implements OnInit, AfterViewInit, OnDestroy {
    private document!: Document;
    @ViewChild('youtube_player', { static: false }) youtube_player!: ElementRef;
    @ViewChild('teacher', { static: false }) teacher!: ElementRef;
    @ViewChild('scroller', { static: false }) scroller!: ElementRef;

    embeddedVideo: SafeHtml;

    loading_player = false;

    videoHeight: any;
    videoWidth: any;

    currentState: number = -1;
    currentStateTimeout: any = null;
    stateTimeout = 150;

    messages: ChatMessage[] = [];

    message = "";

    notes = "";

    showPanel = false;

    recognitionSubscribe: any

    replayInProgress = false;

    drag: any = {
        mousedown: false,
        startPos: null,
        width: 300,
        maxWidth: 500,
        minWidth: 200
    }

    dragStarted = false;

    constructor(
        protected override config: Config,
        private sanitizer: DomSanitizer,
        protected override lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService,
        private helperService: HelperService,
        @Inject(DOCUMENT) document?: any
    ) {
        super(config, lessonService)
        this.document = document;
        this.embeddedVideo =""

        if (environment.is_mock) {
            this.messages = [
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
            ]
        }
    }
    override ngOnInit(): void {
        super.ngOnInit();
        this.showPanel = true;
        setTimeout(() => {
            this.scrollToBottom2();
        });
        // this.createVideo();

        this.lessonService.ListenFor("student_reply_response").subscribe((resp:any) => {
            try {
                let resp_data = resp.data
                if (resp_data && resp_data.text) {
                    this.messages.push(
                        new ChatMessage({type: 'user', message: resp_data.text})
                    );
                    this.scrollToBottom2();
                }
                console.log('resp_data', resp_data)
                // if (resp_data.source == "fix_asr") {
                //     this.messages.push(
                //         new ChatMessage({type: 'user', message: resp_data.llm_reply['corrected_text']})
                //     );
                // }
            } catch (e) {
            }
        })
        this.lessonService.ListenFor("audio_finished").subscribe((resp:any) => {
            console.log('audio_finished')
            if (!this.recognitionSubscribe) {
                this.startListenToAsr();
            }
            this.replayInProgress = false;
        })

        this.startListenToAsr();
    }

    ngAfterViewInit(): void {
        this.setUpYoutubePlayer();
        this.setUpTeacherSize();
    }

    startListenToAsr() {
        this.recognitionSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
        this.speechRecognitionService.startListening();
    }

    onRecognitionResults = (results: any) => {
        console.log("onRecognitionResults results", results)
        const recognitionText = results.text;
        if (results.isFinal) {
            console.log('onRecognitionResults final', recognitionText)
            this.messages.push(
                new ChatMessage({type: 'user', message: recognitionText}),
            )
            this.sendUserReplay(recognitionText);
            this.scrollToBottom2();
        }
    }

    stopListenToAsr() {
        if (this.recognitionSubscribe) {
            this.speechRecognitionService.stopListening();
            this.recognitionSubscribe.unsubscribe(this.onRecognitionResults);
            this.recognitionSubscribe = null;
        }
    }

    sendUserReplay(student_response: string) {
        if (this.replayInProgress) {
            return;
        }
        this.replayInProgress = true;
        this.stopListenToAsr();
        const data = {
            "source": "video-ielts",
            'stopAudio': true,
            'background':true,
            "student_response":student_response
        }
        this.lessonService.Broadcast("PresentationReplayRequest", data)
    }

    setUpYoutubePlayer() {
        this.loading_player = true;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        this.youtube_player.nativeElement.appendChild(tag);
        setTimeout(() => {
            this.onWindowResize();
        })
    }

    setUpTeacherSize() {
        const parent = this.teacher.nativeElement.parentElement;
        const parentHeight = parent.clientHeight;
        const parentWidth = parent.clientWidth;
        if (parentHeight > parentWidth) {
            this.teacher.nativeElement.style.height = parentWidth + 'px';
            this.teacher.nativeElement.style.width = parentWidth + 'px'
        } else {
            this.teacher.nativeElement.style.height = parentHeight + 'px';
            this.teacher.nativeElement.style.width = parentHeight + 'px'
        }
        // if (this.teacher.nativeElement.clientHeight > this.teacher.nativeElement.clientWidth) {
        //     this.teacher.nativeElement.style.height = this.teacher.nativeElement.clientWidth + 'px';
        //     this.teacher.nativeElement.style.width = null;
        // } else {
        //     this.teacher.nativeElement.style.width = this.teacher.nativeElement.clientHeight + 'px';
        //     this.teacher.nativeElement.style.height = null;
        // }
    }

    onPlayerReady(e: any) {
        this.loading_player = false;
        console.log('onPlayerReady e', e)
    }

    onPlayerStateChange(e: OnStateChangeEvent) {
        console.log('YouTube event: ', e)
        console.log('YouTube event target - current time : ', e.target.getCurrentTime())
        this.currentState = e.data;
        clearTimeout(this.currentStateTimeout);
        this.currentStateTimeout = setTimeout(() => {
            const data: any = {"source": "video_player"}
            if (e.data == PlayerState.ENDED) {
                this.currentState = PlayerState.ENDED;
                console.log('video ended')
                data['video_event'] = "ended";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data)
                this.lessonService.Broadcast("slideEventRequest", data)
            }
            if (e.data == PlayerState.PAUSED) {
                this.currentState = PlayerState.PAUSED;
                console.log('video paused')
                data['video_event'] = "paused";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data)
                this.lessonService.Broadcast("slideEventRequest", data)
            }
            if (e.data == PlayerState.PLAYING) {
                this.currentState = PlayerState.PLAYING;
                console.log('video playing')
                data['video_event'] = "playing";
                this.lessonService.Broadcast("DoNotDisturb", data)
            }
        }, this.stateTimeout)
    }

    scrollToBottom2(animate=false, timeout=0){
         if (this.scroller) {
             setTimeout(() => {
                 const element = this.scroller.nativeElement;
                 element.scrollTop = element.scrollHeight
             }, timeout)
         }
    }

    sendMessage() {
        this.messages.push(
            new ChatMessage({type: 'user', message: this.message}),
        )
        this.sendUserReplay(this.message);
        this.message = "";
        this.scrollToBottom2();
    }

    translate(index: number) {
        if (!this.messages[index].translatedMessage) {
            this.translateGoogle(this.messages[index]).then((translated_text: string) => {
                this.messages[index].translatedMessage = translated_text;
                this.messages[index].showTranslated = true;
            }).catch((e) => {
                console.log('translateGoogle e', e)
            })
        } else {
            this.messages[index].showTranslated = !this.messages[index].showTranslated;
        }
    }

    translateGoogle(currentMessage: ChatMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            var sourceLang = 'en';
            var targetLang = 'he';

            var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(currentMessage.message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('')
                    resolve(translated_text);
                } catch (e) {
                    reject(e)
                }
            });
        })
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.videoHeight = this.youtube_player.nativeElement.offsetHeight;
        this.videoWidth = this.youtube_player.nativeElement.clientWidth;
        this.setUpTeacherSize();
    }

    onDragStarted(e: Event) {
        const pos = this.helperService.getPointerPos(e, false);
        this.drag.mousedown = true;
        this.drag.startPos = pos;
        this.dragStarted = true;
        const el = this.document.getElementById('wrapper');
        if (el) {
            el.classList.add('disable-pointer-events');
        }
    }

    @HostListener('document:mousemove', ['$event'])
    @HostListener('document:touchmove', ['$event'])
    onDragMove(e: Event) {
        if (this.dragStarted) {
            e.preventDefault();
            e.stopPropagation();
            const pos = this.helperService.getPointerPos(e, false);
            console.log('pos', pos)
            const moveX = pos.x - this.drag.startPos.x;
            console.log('moveX', moveX)
            console.log('this.drag.width', this.drag.width)
            this.drag.width -= moveX;
            if(this.drag.width > this.drag.maxWidth) {
                this.drag.width = this.drag.maxWidth
            } else if(this.drag.width < this.drag.minWidth) {
                this.drag.width = this.drag.minWidth
            } else {
                this.onWindowResize();
            }
            this.drag.startPos = pos;
        }
    }

    @HostListener('document:mouseup', ['$event'])
    @HostListener('document:touchend', ['$event'])
    onDragEnded(e: Event) {
        this.dragStarted = false;
        this.drag.mousedown = false;
        this.drag.startPos = null;
        const el = this.document.getElementById('wrapper');
        if (el) {
            el.classList.remove('disable-pointer-events');
        }
    }

    override ngOnDestroy(): void {
        this.stopListenToAsr();
        super.ngOnDestroy();
    }
}


// constructor(private sanitizer: DomSanitizer) {
//   // Paste the YouTube iframe code you copied here
//   const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

//   // Sanitize and set the HTML
//   this.embeddedVideo = this.sanitizer.bypassSecurityTrustHtml(embedCode);

