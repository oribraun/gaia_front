import {Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {Presentation} from "../../../entities/presentation";
import {AnimationsService} from "../../../services/animations/animations.service";
import {environment} from "../../../../environments/environment";
import {Config} from "../../../config";

@Component({
  selector: 'app-panel-board',
  templateUrl: './panel-board.component.html',
  styleUrls: ['./panel-board.component.less']
})
export class PanelBoardComponent implements OnChanges, OnDestroy {

    @Input('presentation') presentation: Presentation = new Presentation();
    @Input('currentSectionIndex') currentSectionIndex: number = -1;
    @Input('isMobile') isMobile: boolean = false;

    @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
    @ViewChild('user', { static: false }) user!: ElementRef;

    mediaStream: any;

    subscribe: any;

    imageSrc = ''

    constructor(
        private config: Config,
        private animationsService: AnimationsService,
    ) {
        this.listenToCircleAnimations();

        this.imageSrc = this.config.staticImagePath;
    }

    listenToCircleAnimations() {
        this.subscribe = this.animationsService.onAddCircle.subscribe((obj) => {
            this.animationsService.addCircle(this.user.nativeElement, obj.unique_num)
        })
    }

    startVideo() {
        try {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
                // Display the stream in the video element
                this.mediaStream = mediaStream;
                this.setMediaStream();
            })
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    }

    setMediaStream() {
        setTimeout(() => {
            this.videoElement.nativeElement.srcObject = this.mediaStream;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('changes', changes)
        if (changes['isMobile']) {
            this.startVideo();
        }
    }

    ngOnDestroy(): void {
        if (this.subscribe) {
            this.subscribe.unsubscribe();
        }
    }





}
