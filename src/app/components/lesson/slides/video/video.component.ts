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

    constructor(
        protected override config: Config,
        private sanitizer: DomSanitizer,
        private lessonService: LessonService
    ) {
        super(config)
        this.embeddedVideo =""
    }
    ngOnInit() {
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
        if (e.data == PlayerState.ENDED) {
            console.log('ended')
            const data = {"source": "video_player", 'video_event': "ended"}
            this.lessonService.Broadcast("endDoNotDisturb", data)
            this.lessonService.Broadcast("slideEventRequest", data)
        }
        if (e.data == PlayerState.PAUSED) {
            console.log('paused')
            const data = {"source": "video_player", 'video_event': "paused"}
            this.lessonService.Broadcast("endDoNotDisturb", data)
            this.lessonService.Broadcast("slideEventRequest", data)
        }
        if (e.data == PlayerState.PLAYING) {
            console.log('playing')
            const data = {"source": "video_player", 'video_event': "playing"}
            this.lessonService.Broadcast("DoNotDisturb", data)
        }
        // console.log('onPlayerStateChange e', e.data)
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

