import {Component, OnDestroy, OnInit} from '@angular/core';
import {AudioRecordingService} from "../../services/audio-recorder/audio-recording.service";
import { webSocket } from 'rxjs/webSocket';

@Component({
    selector: 'app-recorder',
    templateUrl: './recorder.component.html',
    styleUrls: ['./recorder.component.less']
})
export class RecorderComponent implements OnInit, OnDestroy {
    private socket!: WebSocket;
    private audioStreamSubscription: any;

    isRecording = false;

    constructor(
        private audioRecordingService: AudioRecordingService
    ) {
        this.socket = new WebSocket('ws://127.0.0.1:8000/ws/audio-upload/');
        this.socket.onopen = () => {
            console.log('WebSocket connection established.')
        };
        this.socket.onerror = (err: any) => {
            console.log('WebSocket err', err)
        }
    }

    ngOnInit(): void {
    }

    async startRecording() {
        this.isRecording = true;
        await this.audioRecordingService.startRecording();
    }

    async stopRecording() {
        this.isRecording = false;
        const audioBlob = await this.audioRecordingService.stopRecording();
        // Send the audioBlob to the Django backend.
    }

    async startRecordingStream() {
        this.isRecording = true;
        await this.audioRecordingService.startRecordingStream();
    }

    async stopRecordingStream() {
        this.isRecording = false;
        const audioBlob = await this.audioRecordingService.stopRecordingStream();
        console.log('audioBlob',audioBlob)
        // this.socket.complete(); // Close the WebSocket connection after recording is complete
    }

    ngOnDestroy() {
        this.audioStreamSubscription.unsubscribe();
        // this.socket.complete();
    }

}
