import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {LessonService} from "../../../../services/lesson/lesson.service";
import {BaseSlideComponent} from "../base-slide.component";

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


@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class VideoComponent extends BaseSlideComponent implements OnInit, AfterViewInit{
    @ViewChild('youtube_player', { static: false }) youtube_player!: ElementRef;

    embeddedVideo: SafeHtml;

    loading_player = false;

    videoHeight: any;
    videoWidth: any;

    currentState: number = -1;
    currentStateTimeout: any = null;
    stateTimeout = 150;

    constructor(
        protected override config: Config,
        private sanitizer: DomSanitizer,
        private lessonService: LessonService
    ) {
        super(config)
        this.embeddedVideo =""
    }
    override ngOnInit(): void {
        super.ngOnInit();
        // this.createVideo();
    }

    ngAfterViewInit(): void {
        this.loading_player = true;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        this.youtube_player.nativeElement.appendChild(tag);
        setTimeout(() => {
            this.videoHeight = this.youtube_player.nativeElement.offsetHeight;
            this.videoWidth = this.youtube_player.nativeElement.clientWidth;
        })
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

    @HostListener('window:resize')
    onWindowResize() {
        this.videoHeight = this.youtube_player.nativeElement.offsetHeight;
        this.videoWidth = this.youtube_player.nativeElement.clientWidth;
    }
}


// constructor(private sanitizer: DomSanitizer) {
//   // Paste the YouTube iframe code you copied here
//   const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

//   // Sanitize and set the HTML
//   this.embeddedVideo = this.sanitizer.bypassSecurityTrustHtml(embedCode);

