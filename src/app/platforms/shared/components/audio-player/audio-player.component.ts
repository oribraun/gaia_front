import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import WaveSurfer from 'wavesurfer.js';

@Component({
    selector: 'app-audio-player',
    templateUrl: './audio-player.component.html',
    styleUrl: './audio-player.component.less'
})
export class AudioPlayerComponent implements AfterViewInit {
    @Input() text: string;
    @Input() audioSource: string;
    @Input() audioBlob: Blob;
    @Input() autoPlay: boolean = false;
    @Output() onAudioLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('waveform') waveform: ElementRef;

    isPlaying: boolean = false;
    isMuted: boolean = false;
    volume: number = 50;
    progress: number = 0;

    wavesurfer: any;

    ngAfterViewInit(): void {
        if (this.waveform) {
            const height = this.waveform.nativeElement.clientHeight;
            this.wavesurfer = WaveSurfer.create({
                container: this.waveform.nativeElement,
                url: this.audioSource ? this.audioSource : "",
                height: height,
                normalize: true,
                waveColor: "#c7c7c7",
                progressColor: "#7a7a7a",
                cursorColor: "#000000",
                cursorWidth: 0,
                barWidth: 2,
                barGap: 7,
                // fillParent: true,
                // mediaControls: false,
                interact: true
            });
            if (this.audioBlob) {
                this.wavesurfer.loadBlob(this.audioBlob);
            }
            this.wavesurfer.on('ready', () => {
                this.onAudioLoaded.next(true);
                if (this.autoPlay) {
                    this.play();
                }
            });
            // https://wavesurfer.xyz/docs/types/wavesurfer.WaveSurferEvents
            this.wavesurfer.on('interaction', () => {
                this.play();
                this.isPlaying = true;
            });
            this.wavesurfer.on('finish', () => {
                this.onAudioEnded();
            });
            this.wavesurfer.on('audioprocess', (currentTime: number) => {
                // console.log('audioprocess', currentTime);
            });
        }
    }



    playPause() {
        if (!this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        if (this.waveform) {
            this.wavesurfer.play();
            this.isPlaying = true;
        }
    }

    pause() {
        if (this.waveform) {
            this.wavesurfer.pause();
            this.isPlaying = false;
        }
    }

    stop() {
        if (this.waveform) {
            this.wavesurfer.stop();
            this.isPlaying = false;
        }
    }

    setVolume(volume: number) {
        if (this.wavesurfer) {
            this.wavesurfer.setVolume(volume / 100);
            this.isMuted = volume === 0;
        }
    }

    onAudioEnded() {
        this.isPlaying = false;
    }
}
